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
    console.log('Register endpoint hit');
    const { first_name, last_name, gmail, login, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);
    try {
        await pool.query(
            'INSERT INTO users (first_name, last_name, user_type, gmail, login, password_hash) VALUES ($1, $2, $3, $4, $5, $6)',
            [first_name, last_name, 'normal', gmail, login, password_hash]
        );
        console.log('User registered successfully');
        res.status(201).send('User registered successfully');
    } catch (err) {
        console.error('Error registering user:', err);
        res.status(500).send('Error registering user');
    }
});

router.post('/login', async (req, res) => {
    console.log('Login endpoint hit');
    const { login, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password_hash);
            if (match) {
                req.session.loggedIn = true;
                req.session.username = user.first_name;
                console.log('Login successful');
                res.status(200).send('Login successful');
            } else {
                console.log('Invalid credentials');
                res.status(401).send('Invalid credentials');
            }
        } else {
            console.log('Invalid credentials');
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        console.error('Error logging in:', err);
        res.status(500).send('Error logging in');
    }
});

router.get('/session', (req, res) => {
    console.log('Session endpoint hit');
    res.json({
        loggedIn: req.session.loggedIn || false,
        username: req.session.username || ''
    });
});

export default router;
