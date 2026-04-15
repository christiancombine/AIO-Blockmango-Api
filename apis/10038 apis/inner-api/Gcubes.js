const express = require('express');
const mysql = require('mysql2/promise');
const redis = require('redis');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

// MySQL pool
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'eeee',
  database: 'game',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Redis client (v3)
const redisClient = redis.createClient(6379, '127.0.0.1', { password: 'eeee' });
redisClient.on('error', (err) => console.error('Redis error:', err));
redisClient.on('ready', () => console.log('Redis connected'));

app.use(bodyParser.json({ limit: '5mb' }));

// Helper API response
function apiResponse(code, message, data = null) {
  return { code, message, data };
}

// Redis async helper
function redisAsync(command, ...args) {
  return new Promise((resolve, reject) => {
    redisClient[command](...args, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

// Validate userId format
function validateUserId(id) {
  return /^[0-9]+$/.test(id);
}

// Get gcubes balance (prefer Redis cache, fallback to MySQL)
app.get('/api/v1/gcubes/:userId', async (req, res) => {
  const userId = req.params.userId;
  if (!validateUserId(userId)) return res.json(apiResponse(3, 'Invalid userId'));

  try {
    // Try Redis first
    const cacheKey = `gcubes:${userId}`;
    let gcubes = await redisAsync('get', cacheKey);

    if (gcubes === null) {
      // If not in Redis, fetch from MySQL
      const [rows] = await pool.query('SELECT gcubes FROM gcubes_balance WHERE userId = ? LIMIT 1', [userId]);
      gcubes = rows.length > 0 ? rows[0].gcubes : 0;
      // Cache to Redis (expire in 1 hour)
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

// Modify gcubes (add or subtract)
app.post('/api/v1/gcubes/modify', async (req, res) => {
  const { userId, amount, reason } = req.body;
  if (!validateUserId(userId) || typeof amount !== 'number' || amount === 0) {
    return res.json(apiResponse(3, 'Invalid parameters'));
  }

  try {
    // Transactional update in MySQL
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Get current balance
      const [rows] = await connection.query('SELECT gcubes FROM gcubes_balance WHERE userId = ? FOR UPDATE', [userId]);
      let current = rows.length > 0 ? rows[0].gcubes : 0;
      let newBalance = current + amount;

      if (newBalance < 0) {
        // Prevent negative balance
        await connection.rollback();
        return res.json(apiResponse(5, 'Insufficient balance'));
      }

      if (rows.length > 0) {
        await connection.query('UPDATE gcubes_balance SET gcubes = ? WHERE userId = ?', [newBalance, userId]);
      } else {
        await connection.query('INSERT INTO gcubes_balance (userId, gcubes) VALUES (?, ?)', [userId, newBalance]);
      }

      // Log transaction
      await connection.query(
        `INSERT INTO gcubes_log (userId, amount, reason, timestamp) VALUES (?, ?, ?, ?)`,
        [userId, amount, reason || 'N/A', Date.now()]
      );

      await connection.commit();

      // Update Redis cache
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

// 404 handler
app.use((req, res) => {
  res.status(404).json(apiResponse(404, 'Not Found'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Blockman Go gcubes API server running on port ${PORT}`);
});
