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
// Endpoint do tworzenia dnia treningowego
router.post('/', async (req, res) => {
  const { date, location, exercises } = req.body;

  try {
      // Dodanie dnia treningowego do bazy danych
      const result = await client.query(
          'INSERT INTO training_days(date, location) VALUES($1, $2) RETURNING id',
          [date, location]
      );

      const trainingDayId = result.rows[0].id;

      // Powiązanie ćwiczeń z dniem treningowym w tabeli asocjacyjnej
      for (const exercise of exercises) {
          const { exercise_id, weight } = exercise;

          await client.query(
              'INSERT INTO training_day_exercises(training_day_id, exercise_id, weight) VALUES($1, $2, $3)',
              [trainingDayId, exercise_id, weight]
          );
      }

      res.status(200).json({ message: 'Dzień treningowy dodany pomyślnie' });
  } catch (error) {
      console.error('Błąd przy dodawaniu dnia treningowego:', error);
      res.status(500).json({ error: 'Błąd przy dodawaniu dnia treningowego', details: error.message });
  }
});

// Endpoint do pobierania dni treningowych z wagami ćwiczeń
router.get('/training-days', async (req, res) => {
  try {
    const result = await client.query(`
      SELECT td.id, td.date, td.location, e.id AS exercise_id, e.name, tde.weight
      FROM training_days td
      LEFT JOIN training_day_exercises tde ON td.id = tde.training_day_id
      LEFT JOIN exercises e ON tde.exercise_id = e.id
      ORDER BY td.date DESC
    `);

    // Grupa wyników według dnia treningowego
    const trainingDays = result.rows.reduce((acc, row) => {
      let day = acc.find(d => d.id === row.id);
      if (!day) {
        day = {
          id: row.id,
          date: row.date,
          location: row.location,
          exercises: [],
        };
        acc.push(day);
      }

      // Dodaj ćwiczenie do dnia treningowego, w tym wagę z tabeli asocjacyjnej
      if (row.exercise_id) {
        day.exercises.push({
          id: row.exercise_id,
          name: row.name,
          current_weight: row.weight,  // Waga ćwiczenia z tabeli asocjacyjnej
        });
      }

      return acc;
    }, []);

    res.json(trainingDays);
  } catch (error) {
    console.error('Błąd przy pobieraniu dni treningowych:', error);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

export default router;


