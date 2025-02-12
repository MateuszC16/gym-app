import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import multer from 'multer';
import pkg from 'pg';

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Umożliwiamy CORS
app.use(cors());

// Umożliwiamy obsługę JSON w ciałach żądań
app.use(express.json());

// Ustawienia multer do przesyłania zdjęć
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

// Połączenie z bazą danych PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'gym_app',
  password: 'admin',
  port: 5432,
});

client.connect()
  .then(() => {
    console.log('Połączono z bazą danych PostgreSQL');
  })
  .catch(err => {
    console.error('Błąd połączenia z bazą:', err);
  });

// Endpoint do pobierania ćwiczeń
app.get('/api/exercises', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM exercises');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Błąd przy pobieraniu ćwiczeń' });
  }
});

// Endpoint do dodawania ćwiczenia
app.post('/api/exercises', upload.array('images', 2), async (req, res) => {
  const { name, muscleGroup, currentWeight, maxWeight } = req.body;

  try {
    const result = await client.query(
      'INSERT INTO exercises(name, muscle_group, current_weight, max_weight) VALUES($1, $2, $3, $4) RETURNING *',
      [name, muscleGroup, currentWeight, maxWeight]
    );

    // Obsługuje przesyłanie zdjęć
    if (req.files) {
      req.files.forEach(file => {
        console.log('Zapisano zdjęcie:', file.path);
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Błąd przy dodawaniu ćwiczenia' });
  }
});

// Serwer nasłuchuje na porcie 3000
app.listen(3000, () => {
  console.log('Backend działa na http://localhost:3000');
});
