import express from 'express';
import pkg from 'pg';

const { Client } = pkg;
const router = express.Router();

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'gym_app',
  password: 'admin',
  port: 5432,
});

client.connect()
  .then(() => console.log('Połączono z bazą danych PostgreSQL'))
  .catch(err => console.error('Błąd połączenia z bazą:', err));

// Endpoint do tworzenia dnia treningowego
router.post('/', async (req, res) => {
  const { date, location, exercises } = req.body;

  console.log('Received data from client:', { date, location, exercises });

  // Sprawdzamy, czy exercises jest tablicą
  if (!Array.isArray(exercises)) {
    console.error('Exercises is not an array:', exercises);
    return res.status(400).json({ error: 'Exercises must be an array' });
  }

  try {
    // Dodanie dnia treningowego do bazy danych
    const result = await client.query(
      'INSERT INTO training_days(date, location) VALUES($1, $2) RETURNING id',
      [date, location]
    );

    const trainingDayId = result.rows[0].id;
    console.log('Training Day ID:', trainingDayId);

    // Powiązanie ćwiczeń z dniem treningowym w tabeli asocjacyjnej
    for (const exerciseId of exercises) {
      await client.query(
        'INSERT INTO training_day_exercises(training_day_id, exercise_id) VALUES($1, $2)',
        [trainingDayId, exerciseId]
      );
    }

    res.status(200).json({ message: 'Dzień treningowy dodany pomyślnie' });
  } catch (error) {
    console.error('Błąd przy dodawaniu dnia treningowego:', error);
    res.status(500).json({ error: 'Błąd przy dodawaniu dnia treningowego', details: error.message });
  }
});

export default router;
