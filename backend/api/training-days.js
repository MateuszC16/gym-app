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
  const { date, location, exercise_id } = req.body;
  
  try {
    // Wstawienie dnia treningowego do bazy
    const result = await client.query(
      'INSERT INTO training_days(date, location) VALUES($1, $2) RETURNING id',
      [date, location]
    );
    
    const trainingDayId = result.rows[0].id;

    // Powiązanie ćwiczenia z dniem treningowym
    await client.query(
      'INSERT INTO training_day_exercises(training_day_id, exercise_id) VALUES($1, $2)',
      [trainingDayId, exercise_id]
    );

    res.status(200).json({ message: 'Dzień treningowy dodany pomyślnie' });
  } catch (error) {
    console.error('Błąd przy dodawaniu dnia treningowego:', error);
    res.status(500).json({ error: 'Błąd przy dodawaniu dnia treningowego' });
  }
});

export default router;
