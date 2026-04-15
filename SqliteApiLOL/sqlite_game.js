// Gyt3lyz based sqlite3 database
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 8080;

// SQLite Database Setup
const dbPath = path.join(__dirname, 'game.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeTables();
  }
});

// Initialize database tables
function initializeTables() {
  // Create UserData table
  db.run(`
    CREATE TABLE IF NOT EXISTS UserData (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      subKey TEXT NOT NULL,
      data TEXT NOT NULL,
      UNIQUE(userId, subKey)
    )
  `, (err) => {
    if (err) console.error('Error creating UserData table:', err);
    else console.log('UserData table initialized');
  });

  // Create Leaderboards table (to replace Redis sorted sets)
  db.run(`
    CREATE TABLE IF NOT EXISTS Leaderboards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL,
      member TEXT NOT NULL,
      score REAL NOT NULL DEFAULT 0,
      expireTime INTEGER DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(key, member)
    )
  `, (err) => {
    if (err) console.error('Error creating Leaderboards table:', err);
    else console.log('Leaderboards table initialized');
  });

  // Create LogData table for game logs
  db.run(`
    CREATE TABLE IF NOT EXISTS LogData (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      serverInfo TEXT,
      gameType TEXT,
      dataAction TEXT,
      data TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Error creating LogData table:', err);
    else console.log('LogData table initialized');
  });

  // Clean up expired leaderboard entries periodically
  setInterval(cleanExpiredLeaderboards, 60000); // Every minute
}

// Helper function to clean expired leaderboard entries
function cleanExpiredLeaderboards() {
  const now = Math.floor(Date.now() / 1000);
  db.run(
    'DELETE FROM Leaderboards WHERE expireTime IS NOT NULL AND expireTime < ?',
    [now],
    function(err) {
      if (err) console.error('Error cleaning expired leaderboards:', err);
      else if (this.changes > 0) console.log(`Cleaned ${this.changes} expired leaderboard entries`);
    }
  );
}

// Middleware
app.use(bodyParser.json({ limit: '5mb' }));
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log(req.method === 'GET' ? 'Query:' : 'Body:', req.method === 'GET' ? req.query : req.body);
  next();
});

// Helper functions
function apiResponse(code, message, data = null) {
  return { code, message, data };
}

function validateTableName(name) {
  return /^[a-zA-Z0-9_]+$/.test(name);
}

// Promise wrapper for SQLite operations
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function dbAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

// ------------------ SQLite Data API ------------------

// GET /api/v1/game/data
app.get('/api/v1/game/data', async (req, res) => {
  try {
    const { userId, subKey, tableName } = req.query;
    if (!userId || !subKey || !validateTableName(tableName)) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    // For backwards compatibility, we'll use UserData table for all data
    const row = await dbGet(
      'SELECT data FROM UserData WHERE userId = ? AND subKey = ? LIMIT 1',
      [userId, subKey]
    );

    return res.json(apiResponse(1, 'Success', row ? {
      userId: Number(userId),
      subKey: Number(subKey),
      data: row.data,
    } : null));
  } catch (err) {
    console.error('GET /data error:', err);
    res.json(apiResponse(4, 'INNER ERROR'));
  }
});

// ------------------ Init UserData Table ------------------
app.get('/api/v1/data/init', async (req, res) => {
  try {
    await dbRun(`
      CREATE TABLE IF NOT EXISTS UserData (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        subKey TEXT NOT NULL,
        data TEXT NOT NULL,
        UNIQUE(userId, subKey)
      )
    `);
    res.json({ code: 1, message: 'UserData table created/exists' });
  } catch (err) {
    console.error('/api/v1/data/init error:', err);
    res.json({ code: 4, message: 'INNER ERROR', detail: err.message });
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

    for (const { userId, subKey, data } of dataArr) {
      if (!userId || !subKey || !data) {
        throw new Error('PARAM ERROR');
      }
      
      // Use REPLACE for upsert functionality
      await dbRun(
        'REPLACE INTO UserData (userId, subKey, data) VALUES (?, ?, ?)',
        [userId, subKey, data]
      );
    }

    return res.json(apiResponse(1, 'Success'));
  } catch (err) {
    console.error('POST /data error:', err.message);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});

// ------------------ Wealth API (flat structure) ------------------
app.get('/pay/i/api/v1/wealth/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.json({ code: 3, message: 'PARAM ERROR', data: null });

    // Default flat wealth values
    const wealth = {
      diamonds: 99999,
      gDiamonds: 99999,     // gcubes
      ngDiamonds: 99999,    // bcubes
      gold: 99999,
      money: 99999,
      gDiamondsProfit: 99999,
      sameUser: 99999,
      firstPunch: 99999
    };

    // Respond directly with userId + currencies
    res.json({
      code: 1,
      message: 'SUCCESS',
      data: {
        userId: Number(userId),
        ...wealth
      }
    });
  } catch (err) {
    console.error('/pay/i/api/v1/wealth/users/:userId error:', err);
    res.json({ code: 4, message: 'INNER ERROR', data: null });
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

    for (const { userId, serverInfo, gameType, dataAction, data } of logArr) {
      if (!userId || !serverInfo || !gameType || !dataAction || !data) {
        throw new Error('PARAM ERROR');
      }
      
      await dbRun(
        'INSERT INTO LogData (userId, serverInfo, gameType, dataAction, data) VALUES (?, ?, ?, ?, ?)',
        [userId, serverInfo, gameType, dataAction, data]
      );
    }

    return res.json(apiResponse(1, 'Success'));
  } catch (err) {
    console.error('POST /log error:', err.message);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});

// Purchase API (v1)
app.post('/pay/api/v1/pay/users/purchase/game/props', async (req, res) => {
  try {
    const userId = Number(req.body?.userId || req.query?.userId || 112);
    const propsId = Number(req.body?.propsId || req.query?.propsId || 0);
    const quantity = Number(req.body?.quantity || req.query?.quantity || 1);
    const currencyNum = Number(req.body?.currency || req.query?.currency || 1);

    // Map numeric currencies to keys
    const currencyMap = { 1: 'diamonds', 2: 'gold' };
    const currencyKey = currencyMap[currencyNum] || 'diamonds';

    // Default wealth
    let wealthData = { diamonds: 99999, gold: 99999 };

    // Load current wealth
    const row = await dbGet(
      'SELECT data FROM UserData WHERE userId = ? AND subKey = ? LIMIT 1',
      [userId, 'wealth']
    );

    if (row) {
      try {
        const parsed = JSON.parse(row.data || '{}');
        wealthData.diamonds = Number(parsed.diamonds || 0);
        wealthData.gold = Number(parsed.gold || 0);
      } catch {
        // fallback to defaults
      }
    }

    // Deduct currency safely
    if (!wealthData[currencyKey]) wealthData[currencyKey] = 0;
    if (wealthData[currencyKey] >= quantity) wealthData[currencyKey] -= quantity;

    // Save back to DB
    const dataStr = JSON.stringify(wealthData);
    await dbRun(
      'REPLACE INTO UserData (userId, subKey, data) VALUES (?, ?, ?)',
      [userId, 'wealth', dataStr]
    );

    // Respond exactly how the game expects
    res.json({
      code: 1,
      message: "Success",
      data: {
        userId,
        propsId,
        quantity,
        diamonds: wealthData.diamonds,
        gold: wealthData.gold
      }
    });

  } catch (err) {
    console.error('Purchase API error:', err);
    res.json({
      code: 1,
      message: "Success",
      data: {
        userId: 112,
        propsId: 0,
        quantity: 0,
        diamonds: 99999,
        gold: 99999
      }
    });
  }
});

// ------------------ Leaderboard API (replacing Redis) ------------------

app.put('/api/v1/game/rank/expire', async (req, res) => {
  try {
    const dataArr = req.body;
    if (!Array.isArray(dataArr)) {
      return res.json(apiResponse(3, 'PARAM ERROR'));
    }

    for (const item of dataArr) {
      const expireTime = item.expireTime;
      if (expireTime <= Math.floor(Date.now() / 1000)) {
        // Delete expired entries
        await dbRun('DELETE FROM Leaderboards WHERE key = ?', [item.key]);
      } else {
        // Update expire time
        await dbRun(
          'UPDATE Leaderboards SET expireTime = ? WHERE key = ?',
          [expireTime, item.key]
        );
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

    const now = Math.floor(Date.now() / 1000);
    const rows = await dbAll(
      `SELECT member, score FROM Leaderboards 
       WHERE key = ? AND (expireTime IS NULL OR expireTime > ?)
       ORDER BY score DESC 
       LIMIT ? OFFSET ?`,
      [key, now, Number(end) - Number(start) + 1, Number(start)]
    );

    const formatted = rows.map(row => ({
      member: row.member,
      score: parseInt(row.score)
    }));

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
        // Get current score and increment
        const existing = await dbGet(
          'SELECT score FROM Leaderboards WHERE key = ? AND member = ?',
          [item.key, item.member]
        );
        
        const newScore = (existing ? existing.score : 0) + item.count;
        
        await dbRun(
          `REPLACE INTO Leaderboards (key, member, score, updated_at) 
           VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
          [item.key, item.member, newScore]
        );
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

    const now = Math.floor(Date.now() / 1000);
    
    // Get score
    const scoreRow = await dbGet(
      'SELECT score FROM Leaderboards WHERE key = ? AND member = ? AND (expireTime IS NULL OR expireTime > ?)',
      [key, member, now]
    );
    
    // Get rank (count how many have higher scores)
    const rankRow = await dbGet(
      `SELECT COUNT(*) as rank FROM Leaderboards 
       WHERE key = ? AND score > ? AND (expireTime IS NULL OR expireTime > ?)`,
      [key, scoreRow ? scoreRow.score : 0, now]
    );

    return res.json(apiResponse(1, 'Success', {
      score: scoreRow ? parseFloat(scoreRow.score) : 0,
      rank: scoreRow ? rankRow.rank : -1,
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
      
      // Get current score and increment
      const existing = await dbGet(
        'SELECT score FROM Leaderboards WHERE key = ? AND member = ?',
        [item.key, item.member]
      );
      
      const newScore = (existing ? existing.score : 0) + item.count;
      
      await dbRun(
        `REPLACE INTO Leaderboards (key, member, score, updated_at) 
         VALUES (?, ?, ?, CURRENT_TIMESTAMP)`,
        [item.key, item.member, newScore]
      );
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
      const expireTime = item.expireTime;
      if (expireTime <= Math.floor(Date.now() / 1000)) {
        // Delete expired entries
        await dbRun('DELETE FROM Leaderboards WHERE key = ?', [item.key]);
      } else {
        // Update expire time
        await dbRun(
          'UPDATE Leaderboards SET expireTime = ? WHERE key = ?',
          [expireTime, item.key]
        );
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

    const now = Math.floor(Date.now() / 1000);
    const rows = await dbAll(
      `SELECT member, score FROM Leaderboards 
       WHERE key = ? AND (expireTime IS NULL OR expireTime > ?)
       ORDER BY score ASC 
       LIMIT ? OFFSET ?`,
      [key, now, Number(end) - Number(start) + 1, Number(start)]
    );

    const formatted = rows.map(row => ({
      member: row.member,
      score: parseInt(row.score)
    }));

    return res.json(apiResponse(1, 'Success', formatted));
  } catch (err) {
    console.error('GET /zrange error:', err);
    return res.json(apiResponse(4, 'INNER ERROR'));
  }
});

// 404 handler
app.use((req, res) => {
  console.warn(`Unknown route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ code: 404, message: 'Not Found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
  console.log(`SQLite database: ${dbPath}`);
});