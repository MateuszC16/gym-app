import express from 'express';
import bcrypt from 'bcrypt';
import pkg from 'pg';

const { Pool } = pkg;

const router = express.Router();
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'gym_app',
    password: 'admin',
    port: 5432,
});

router.post('/register', async (req, res) => {
    const { first_name, last_name, gmail, login, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    try {
        await pool.query(
            'INSERT INTO users (first_name, last_name, user_type, gmail, login, password_hash) VALUES ($1, $2, $3, $4, $5, $6)',
            [first_name, last_name, 'normal', gmail, login, password_hash]
        );
        res.redirect('/frontend/index.html');
    } catch (err) {
        res.status(500).send('Error registering user');
    }
});

router.post('/login', async (req, res) => {
    const { login, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password_hash);
            if (match) {
                req.session.loggedIn = true;
                req.session.username = user.first_name;
                res.redirect('/frontend/index.html');
            } else {
                res.send('Invalid credentials');
            }
        } else {
            res.send('Invalid credentials');
        }
    } catch (err) {
        res.status(500).send('Error logging in');
    }
});

router.get('/session', (req, res) => {
    res.json({
        loggedIn: req.session.loggedIn || false,
        username: req.session.username || ''
    });
});

export default router;
