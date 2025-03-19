import express from 'express';
import bcrypt from 'bcrypt';
import pkg from 'pg';
import jwt from 'jsonwebtoken';

const { Pool } = pkg;
const router = express.Router();

// Konfiguracja bazy danych
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'gym_app',
    password: 'admin',
    port: 5432,
});

// Middleware do uwierzytelniania JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (token) {
        jwt.verify(token, 'your-secret-key', (err, user) => {
            if (err) {
                return res.sendStatus(403); // Niepoprawny token
            }
            req.user = user; // Dodajemy dane użytkownika do requesta
            next();
        });
    } else {
        res.sendStatus(401); // Brak tokenu
    }
};

// Rejestracja użytkownika
router.post('/register', async (req, res) => {
    const { first_name, last_name, gmail, login, password } = req.body;

    // Hashowanie hasła
    const password_hash = await bcrypt.hash(password, 10);

    try {
        // Zapisujemy użytkownika w bazie
        await pool.query(
            'INSERT INTO users (first_name, last_name, user_type, gmail, login, password_hash) VALUES ($1, $2, $3, $4, $5, $6)',
            [first_name, last_name, 'normal', gmail, login, password_hash]
        );
        res.status(201).send('Użytkownik zarejestrowany!');
    } catch (err) {
        console.error('Błąd rejestracji:', err);
        res.status(500).send('Błąd rejestracji użytkownika');
    }
});

// Logowanie użytkownika
router.post('/login', async (req, res) => {
    const { login, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE login = $1', [login]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const match = await bcrypt.compare(password, user.password_hash);

            if (match) {
                // Generujemy token JWT zawierający dane użytkownika, w tym user_id
                const token = jwt.sign({ username: user.first_name, userId: user.user_id }, 'your-secret-key', { expiresIn: '1h' });
                console.log('Logowanie udane');
                res.json({ token });
            } else {
                res.status(401).send('Niepoprawny login lub hasło');
            }
        } else {
            res.status(401).send('Niepoprawny login lub hasło');
        }
    } catch (err) {
        console.error('Błąd logowania:', err);
        res.status(500).send('Błąd logowania');
    }
});

// Sprawdzanie statusu sesji
router.get('/session', authenticateJWT, (req, res) => {
    res.json({
        loggedIn: true,
        username: req.user.username // Dostęp do użytkownika przez req.user
    });
});

// Wylogowanie użytkownika
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Błąd wylogowania:', err);
            res.status(500).send('Błąd wylogowania');
        } else {
            res.status(200).send('Wylogowanie udane');
        }
    });
});

export default router;
