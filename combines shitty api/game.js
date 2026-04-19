// 100% skidded
// WORKS SOMEHOW
// uhh apply to https://discord.gg/eAc4ZvQZ we are releasing soon

const express = require('express');
const mysql = require('mysql2/promise');
const { createClient } = require('redis');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '',
  database: 'useyourowndb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const redisClient = createClient({
  socket: {
    host: '127.0.0.1',
    port: 6379
  }
});

redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('ready', () => console.log('Redis connected'));

// redis thingy
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error('Failed to connect to Redis:', err.message);
  }
})();

app.use(bodyParser.json({ limit: '5mb' }));

function apiResponse(code, message, data = null) {
  return { code, message, data };
}

async function redisAsync(command, ...args) {
  if (!redisClient.isReady) {
    throw new Error('Redis not connected');
  }
  return redisClient[command](...args);
}

function validateUserId(id) {
  return /^[0-9]+$/.test(id);
}

function validateTableName(name) {
  return /^[a-zA-Z0-9_]+$/.test(name);
}

// gcubes 

app.get('/api/v1/gcubes/:userId', async (req, res) => {
  const userId = req.params.userId;
  if (!validateUserId(userId)) return res.json(apiResponse(3, 'Invalid userId'));

  try {
    const cacheKey = `gcubes:${userId}`;
    let gcubes = await redisAsync('get', cacheKey);

    if (gcubes === null) {
      const [rows] = await pool.query('SELECT gcubes FROM gcubes_balance WHERE userId = ? LIMIT 1', [userId]);
      gcubes = rows.length > 0 ? rows[0].gcubes : 0;
      await redisAsync('setex', cacheKey, 3600, gcubes);
    } else {
      gcubes = parseInt(gcubes);
    }

    return res.json(apiResponse(1, 'Success', { userId: Number(userId), gcubes }));
  } catch (err) {
    console.error('GET gcubes error:', err);
    return res.json(apiResponse(4, 'Internal server error'));
  }
});

app.post('/api/v1/gcubes/modify', async (req, res) => {
  const { userId, amount, reason } = req.body;
  if (!validateUserId(userId) || typeof amount !== 'number' || amount === 0) {
    return res.json(apiResponse(3, 'Invalid parameters'));
  }

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.query('SELECT gcubes FROM gcubes_balance WHERE userId = ? FOR UPDATE', [userId]);
      let current = rows.length > 0 ? rows[0].gcubes : 0;
      let newBalance = current + amount;

      if (newBalance < 0) {
        await connection.rollback();
        return res.json(apiResponse(5, 'Insufficient balance'));
      }

      if (rows.length > 0) {
        await connection.query('UPDATE gcubes_balance SET gcubes = ? WHERE userId = ?', [newBalance, userId]);
      } else {
        await connection.query('INSERT INTO gcubes_balance (userId, gcubes) VALUES (?, ?)', [userId, newBalance]);
      }

      await connection.query(
        `INSERT INTO gcubes_log (userId, amount, reason, timestamp) VALUES (?, ?, ?, ?)`,
        [userId, amount, reason || 'N/A', Date.now()]
      );

      await connection.commit();

      const cacheKey = `gcubes:${userId}`;
      await redisAsync('setex', cacheKey, 3600, newBalance);

      return res.json(apiResponse(1, 'Success', { userId: Number(userId), gcubes: newBalance }));
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('POST gcubes/modify error:', err);
    return res.json(apiResponse(4, 'Internal server error'));
  }
});

// loggin api

app.get('/api/v1/game/data', async (req, res) => {
  try {
    const { userId, subKey, tableName } = req.query;
    if (!userId || !subKey || !validateTableName(tableName)) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    const [rows] = await pool.query(
      'SELECT data FROM ?? WHERE userId = ? AND subKey = ? LIMIT 1',
      [tableName, userId, subKey]
    );

    return res.json(apiResponse(1, 'Success', rows.length > 0 ? {
      userId: Number(userId),
      subKey: Number(subKey),
      data: rows[0].data,
    } : null));
  } catch (err) {
    console.error('GET /data error:', err);
    res.json(apiResponse(4, 'INNER ERROR'));
  }
});

app.post('/api/v1/game/data', async (req, res) => {
  try {
    const { tableName } = req.query;
    const dataArr = req.body;

    if (!validateTableName(tableName) || !Array.isArray(dataArr) || dataArr.length === 0) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    const values = dataArr.map(({ userId, subKey, data }) => {
      if (!userId || !subKey || data === undefined) throw new Error('PARAM ERROR');
      return [userId, subKey, data];
    });

    const sql = `
      INSERT INTO ?? (userId, subKey, data)
      VALUES ?
      ON DUPLICATE KEY UPDATE data = VALUES(data)
    `;
    await pool.query(sql, [tableName, values]);
    return res.json(apiResponse(1, 'Success'));
  } catch (err) {
    console.error('POST /data error:', err.message);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});

app.post('/api/v1/game/log', async (req, res) => {
  try {
    const { tableName } = req.query;
    const logArr = req.body;

    if (!validateTableName(tableName) || !Array.isArray(logArr) || logArr.length === 0) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    const values = logArr.map(({ userId, serverInfo, gameType, dataAction, data }) => {
      if (!userId || !serverInfo || !gameType || !dataAction || data === undefined) {
        throw new Error('PARAM ERROR');
      }
      return [userId, serverInfo, gameType, dataAction, data];
    });

    const sql = `INSERT INTO ?? (userId, serverInfo, gameType, dataAction, data) VALUES ?`;
    await pool.query(sql, [tableName, values]);
    return res.json(apiResponse(1, 'Success'));
  } catch (err) {
    console.error('POST /log error:', err.message);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});


app.put('/api/v1/game/rank/expire', async (req, res) => {
  try {
    const dataArr = req.body;
    if (!Array.isArray(dataArr)) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    for (const item of dataArr) {
      const ttl = item.expireTime - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisAsync('expire', item.key, ttl);
      } else {
        await redisAsync('del', item.key);
      }
    }

    return res.json(apiResponse(1, 'Success'));
  } catch (err) {
    console.error('PUT /rank/expire error:', err);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});

app.get('/api/v1/game/rank/list', async (req, res) => {
  try {
    const { key, start, end } = req.query;
    if (!key || start === undefined || end === undefined) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    const result = await redisAsync('zrevrange', key, Number(start), Number(end), 'WITHSCORES');
    const formatted = [];
    for (let i = 0; i < result.length; i += 2) {
      formatted.push({ member: result[i], score: parseInt(result[i + 1], 10) });
    }

    return res.json(apiResponse(1, 'Success', formatted));
  } catch (err) {
    console.error('GET /rank/list error:', err);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});

app.post('/api/v1/game/rank', async (req, res) => {
  try {
    const dataArr = req.body;
    if (!Array.isArray(dataArr) || dataArr.length === 0) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    for (const item of dataArr) {
      if (!item.key || !item.member || typeof item.count !== 'number' || typeof item.add !== 'boolean') {
        return res.json(apiResponse(3, 'PARAM ERROR'));
      }
      if (item.add) {
        await redisAsync('zincrby', item.key, item.count, item.member);
      }
    }

    return res.json(apiResponse(1, 'Success'));
  } catch (err) {
    console.error('POST /rank error:', err);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});

app.get('/api/v1/game/rank', async (req, res) => {
  try {
    const { key, member } = req.query;
    if (!key || !member) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    const score = await redisAsync('zscore', key, member);
    const rank = await redisAsync('zrevrank', key, member);

    return res.json(apiResponse(1, 'Success', {
      score: score !== null ? parseFloat(score) : 0,
      rank: rank !== null ? rank : -1,
    }));
  } catch (err) {
    console.error('GET /rank error:', err);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});

app.post('/api/v1/game/zincrby', async (req, res) => {
  try {
    const dataArr = req.body;
    if (!Array.isArray(dataArr)) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    for (const item of dataArr) {
      if (!item.key || !item.member || typeof item.count !== 'number') {
        return res.json(apiResponse(3, 'PARAM ERROR'));
      }
      await redisAsync('zincrby', item.key, item.count, item.member);
    }

    return res.json(apiResponse(1, 'Success'));
  } catch (err) {
    console.error('POST /zincrby error:', err);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});

app.put('/api/v1/game/zexpire', async (req, res) => {
  try {
    const dataArr = req.body;
    if (!Array.isArray(dataArr)) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    for (const item of dataArr) {
      const ttl = item.expireTime - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redisAsync('expire', item.key, ttl);
      } else {
        await redisAsync('del', item.key);
      }
    }

    return res.json(apiResponse(1, 'Success'));
  } catch (err) {
    console.error('PUT /zexpire error:', err);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});

app.get('/api/v1/game/zrange', async (req, res) => {
  try {
    const { key, start, end } = req.query;
    if (!key || start === undefined || end === undefined) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    const result = await redisAsync('zrange', key, Number(start), Number(end), 'WITHSCORES');
    const formatted = [];
    for (let i = 0; i < result.length; i += 2) {
      formatted.push({ member: result[i], score: parseInt(result[i + 1], 10) });
    }

    return res.json(apiResponse(1, 'Success', formatted));
  } catch (err) {
    console.error('GET /zrange error:', err);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});

app.use((req, res) => {
  res.status(404).json(apiResponse(404, 'Not Found'));
});

app.listen(PORT, () => {
  console.log(`de api servur runnin on ${PORT}`);
});
