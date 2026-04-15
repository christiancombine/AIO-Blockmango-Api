const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'eeee', // <-- replace with your MySQL root password
    database: 'game'
});

// === Save player data ===
app.post('/save_player', (req, res) => {
    const { userId, subKey, data } = req.body;
    const sql = `
        INSERT INTO user_data (userId, subKey, data)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        subKey = VALUES(subKey), data = VALUES(data)
    `;
    db.query(sql, [userId, subKey, data], (err) => {
        if (err) return res.status(500).send('DB Error');
        res.send('Player data saved');
    });
});

// === Load player data ===
app.get('/load_player', (req, res) => {
    const { userId } = req.query;
    const sql = `SELECT * FROM user_data WHERE userId = ?`;
    db.query(sql, [userId], (err, rows) => {
        if (err) return res.status(500).send('DB Error');
        if (rows.length === 0) return res.json({});
        res.json(rows[0]);
    });
});

// === Start server ===
app.listen(3000, () => console.log('API running at http://localhost:3000'));
