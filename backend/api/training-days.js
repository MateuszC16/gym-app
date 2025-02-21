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

  try {
    // Dodanie dnia treningowego do bazy danych
    const result = await client.query(
      'INSERT INTO training_days(date, location) VALUES($1, $2) RETURNING id',
      [date, location]
    );

    const trainingDayId = result.rows[0].id;

    // Powiązanie ćwiczeń z dniem treningowym w tabeli asocjacyjnej
    for (const exercise of exercises) {
      const { exercise_id, weight, description } = exercise;

      // Sprawdzamy, czy waga w tabeli asocjacyjnej jest większa niż maksymalna waga w tabeli exercises
      const exerciseResult = await client.query(
        'SELECT current_weight, max_weight FROM exercises WHERE id = $1',
        [exercise_id]
      );

      const currentExercise = exerciseResult.rows[0];
      const newMaxWeight = currentExercise.max_weight < weight ? weight : currentExercise.max_weight;

      // Zaktualizowanie max_weight oraz current_weight w tabeli exercises
      if (currentExercise.max_weight < weight) {
        await client.query(
          'UPDATE exercises SET max_weight = $1, max_weight_date = CURRENT_DATE WHERE id = $2',
          [weight, exercise_id]
        );
      }

      await client.query(
        'UPDATE exercises SET current_weight = $1 WHERE id = $2',
        [weight, exercise_id]
      );

      // Dodanie ćwiczenia do tabeli asocjacyjnej z opisem
      await client.query(
        'INSERT INTO training_day_exercises(training_day_id, exercise_id, weight, description) VALUES($1, $2, $3, $4)',
        [trainingDayId, exercise_id, weight, description || null]
      );
    }

    res.status(200).json({ message: 'Dzień treningowy dodany pomyślnie' });
  } catch (error) {
    console.error('Błąd przy dodawaniu dnia treningowego:', error);
    res.status(500).json({ error: 'Błąd przy dodawaniu dnia treningowego', details: error.message });
  }
});

// Endpoint do pobierania wszystkich dni treningowych wraz z ćwiczeniami
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        td.id AS training_day_id,
        td.date,
        td.location,
        e.id AS exercise_id,
        e.name AS exercise_name,
        e.muscle_group,
        e.current_weight,
        e.max_weight,
        e.max_weight_date,
        e.image_one,
        e.image_two,
        tde.weight AS current_training_day_weight,
        tde.description AS training_day_description
      FROM 
        training_days td
      JOIN 
        training_day_exercises tde ON td.id = tde.training_day_id
      JOIN 
        exercises e ON e.id = tde.exercise_id
      ORDER BY 
        td.date;
    `;
    
    const result = await client.query(query);
    const trainingDays = [];

    result.rows.forEach(row => {
      const day = trainingDays.find(d => d.id === row.training_day_id);
      if (!day) {
        trainingDays.push({
          id: row.training_day_id,
          date: row.date,
          location: row.location,
          exercises: [{
            id: row.exercise_id,
            name: row.exercise_name,
            muscle_group: row.muscle_group,
            current_weight: row.current_weight,
            max_weight: row.max_weight,
            max_weight_date: row.max_weight_date,
            image_one: row.image_one,
            image_two: row.image_two,
            current_training_day_weight: row.current_training_day_weight,
            training_day_description: row.training_day_description
          }]
        });
      } else {
        day.exercises.push({
          id: row.exercise_id,
          name: row.exercise_name,
          muscle_group: row.muscle_group,
          current_weight: row.current_weight,
          max_weight: row.max_weight,
          max_weight_date: row.max_weight_date,
          image_one: row.image_one,
          image_two: row.image_two,
          current_training_day_weight: row.current_training_day_weight,
          training_day_description: row.training_day_description
        });
      }
    });

    res.status(200).json(trainingDays);
  } catch (error) {
    console.error('Błąd przy pobieraniu dni treningowych:', error);
    res.status(500).json({ error: 'Błąd przy pobieraniu dni treningowych', details: error.message });
  }
});

export default router;
