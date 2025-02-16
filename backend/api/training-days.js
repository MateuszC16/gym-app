import express from 'express';
import pkg from 'pg';  // Importujemy cały pakiet 'pg' jako default export
const { Client } = pkg;  // Wyciągamy 'Client' z default export

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

// Endpoint do dodawania dnia treningowego
router.post('/', async (req, res) => {
  const { date, location, exercises } = req.body;

  if (!date || !location || !exercises || exercises.length === 0) {
    return res.status(400).json({ error: 'Data, lokalizacja i lista ćwiczeń są wymagane' });
  }

  try {
    const result = await client.query(
      'INSERT INTO training_days(date, location) VALUES($1, $2) RETURNING id',
      [date, location]
    );

    const trainingDayId = result.rows[0].id;

    const queryValues = exercises.map((exerciseId) => `(${trainingDayId}, ${exerciseId})`).join(', ');

    if (queryValues) {
      await client.query(
        `INSERT INTO training_day_exercises(training_day_id, exercise_id) VALUES ${queryValues}`
      );
    }

    res.json({ message: 'Dzień treningowy został dodany' });
  } catch (err) {
    console.error('Błąd przy dodawaniu dnia treningowego:', err);
    res.status(500).json({ error: 'Błąd przy dodawaniu dnia treningowego' });
  }
});

// Endpoint do pobierania dni treningowych
router.get('/', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM training_days');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Błąd przy pobieraniu dni treningowych' });
  }
});

export default router;
