const express = require('express');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const redis = require('redis');

const app = express();
const PORT = 8080;

// MySQL
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'eeee',
  database: 'game',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Redis v3 client
const redisClient = redis.createClient(6379, '127.0.0.1', { password: 'eeee' });
redisClient.on('error', (err) => console.error('Redis Error:', err));
redisClient.on('ready', () => console.log('Connected to Redis'));

// Middleware
app.use(bodyParser.json({ limit: '5mb' }));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log(req.method === 'GET' ? 'Query:' : 'Body:', req.method === 'GET' ? req.query : req.body);
  next();
});

// Helper
function apiResponse(code, message, data = null) {
  return { code, message, data };
}
function validateTableName(name) {
  return /^[a-zA-Z0-9_]+$/.test(name);
}

// ------------------ MySQL API ------------------

// GET /api/v1/game/data
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

// POST /api/v1/game/data
app.post('/api/v1/game/data', async (req, res) => {
  try {
    const { tableName } = req.query;
    const dataArr = req.body;

    if (!validateTableName(tableName) || !Array.isArray(dataArr) || dataArr.length === 0) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    const values = dataArr.map(({ userId, subKey, data }) => {
      if (!userId || !subKey || !data) throw new Error('PARAM ERROR');
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

// POST /api/v1/game/log
app.post('/api/v1/game/log', async (req, res) => {
  try {
    const { tableName } = req.query;
    const logArr = req.body;

    if (!validateTableName(tableName) || !Array.isArray(logArr) || logArr.length === 0) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    const values = logArr.map(({ userId, serverInfo, gameType, dataAction, data }) => {
      if (!userId || !serverInfo || !gameType || !dataAction || !data) throw new Error('PARAM ERROR');
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

// ------------------ Redis API ------------------

function redisAsync(command, ...args) {
  return new Promise((resolve, reject) => {
    redisClient[command](...args, (err, result) => err ? reject(err) : resolve(result));
  });
}

app.put('/api/v1/game/rank/expire', async (req, res) => {
  try {
    const dataArr = req.body;
    if (!Array.isArray(dataArr)) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    for (const item of dataArr) {
      const ttl = item.expireTime - Math.floor(Date.now() / 1000);
      if (ttl > 0) await redisAsync('expire', item.key, ttl);
      else await redisAsync('del', item.key);
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

    const result = await redisAsync('zrevrange', key, start, end, 'WITHSCORES');
    const formatted = [];
    for (let i = 0; i < result.length; i += 2) {
      formatted.push({ member: result[i], score: parseInt(result[i + 1]) });
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
      if (ttl > 0) await redisAsync('expire', item.key, ttl);
      else await redisAsync('del', item.key);
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

    const result = await redisAsync('zrange', key, start, end, 'WITHSCORES');
    const formatted = [];
    for (let i = 0; i < result.length; i += 2) {
      formatted.push({ member: result[i], score: parseInt(result[i + 1]) });
    }

    return res.json(apiResponse(1, 'Success', formatted));
  } catch (err) {
    console.error('GET /zrange error:', err);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});

// 404
app.use((req, res) => {
  console.warn(`Unknown route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ code: 404, message: 'Not Found' });
});

// Start
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
