import express from 'express';
import pkg from 'pg';
import { authenticate } from './auth.js'; // Import the authenticate middleware

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
router.post('/', authenticate, async (req, res) => {
  const { date, location, exercises } = req.body;
  const userId = req.user.userId; // Pobierz user_id z tokena JWT

  console.log('userId:', userId); // Logowanie userId

  try {
    // Logowanie danych wejściowych
    console.log('Received data for creating training day:', { date, location, exercises });

    // Dodanie dnia treningowego do bazy danych
    const result = await client.query(
      'INSERT INTO training_days(date, location, user_id) VALUES($1, $2, $3) RETURNING id',
      [date, location, userId]
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
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.userId; // Pobierz userId z middleware

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
      LEFT JOIN 
        training_day_exercises tde ON td.id = tde.training_day_id
      LEFT JOIN 
        exercises e ON e.id = tde.exercise_id
      WHERE 
        td.user_id = $1
      ORDER BY 
        td.date;
    `;
    
    const result = await client.query(query, [userId]);
    const trainingDays = [];

    result.rows.forEach(row => {
      const day = trainingDays.find(d => d.id === row.training_day_id);
      if (!day) {
        trainingDays.push({
          id: row.training_day_id,
          date: row.date,
          location: row.location,
          exercises: row.exercise_id ? [{
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
          }] : []
        });
      } else if (row.exercise_id) {
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

// Endpoint do edytowania dnia treningowego
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { date, location, exercises } = req.body;

  try {
    // Logowanie danych wejściowych
    console.log('Received data for updating training day:', { id, date, location, exercises });

    // Zaktualizowanie dnia treningowego
    await client.query(
      'UPDATE training_days SET date = $1, location = $2 WHERE id = $3',
      [date, location, id]
    );

    // Pobierz istniejące ćwiczenia dla dnia treningowego
    const existingExercisesResult = await client.query(
      'SELECT exercise_id FROM training_day_exercises WHERE training_day_id = $1',
      [id]
    );
    const existingExercises = existingExercisesResult.rows.map(row => row.exercise_id);

    // Logowanie typu i zawartości exercises
    console.log('Type of exercises:', typeof exercises);
    console.log('Content of exercises:', exercises);

    // Upewnij się, że exercises jest tablicą
    if (!Array.isArray(exercises)) {
      throw new TypeError('exercises is not iterable');
    }

    // Dodanie nowych i zaktualizowanie istniejących ćwiczeń
    for (const exercise of exercises) {
      const { exercise_id, weight, description } = exercise;
      if (existingExercises.includes(exercise_id)) {
        // Zaktualizowanie istniejącego ćwiczenia
        await client.query(
          'UPDATE training_day_exercises SET weight = $1, description = $2 WHERE training_day_id = $3 AND exercise_id = $4',
          [weight, description || null, id, exercise_id]
        );
      } else {
        // Dodanie nowego ćwiczenia
        await client.query(
          'INSERT INTO training_day_exercises(training_day_id, exercise_id, weight, description) VALUES($1, $2, $3, $4)',
          [id, exercise_id, weight, description || null]
        );
      }
    }

    // Usunięcie ćwiczeń, które nie są już powiązane z dniem treningowym
    const updatedExerciseIds = exercises.map(ex => ex.exercise_id);
    const exercisesToRemove = existingExercises.filter(exId => !updatedExerciseIds.includes(exId));
    for (const exerciseId of exercisesToRemove) {
      await client.query(
        'DELETE FROM training_day_exercises WHERE training_day_id = $1 AND exercise_id = $2',
        [id, exerciseId]
      );
    }

    res.status(200).json({ message: 'Dzień treningowy zaktualizowany pomyślnie' });
  } catch (error) {
    console.error('Błąd przy edytowaniu dnia treningowego:', error);
    res.status(500).json({ error: 'Błąd przy edytowaniu dnia treningowego', details: error.message });
  }
});

// Endpoint do usuwania dnia treningowego
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    // Usunięcie powiązanych ćwiczeń
    await client.query('DELETE FROM training_day_exercises WHERE training_day_id = $1', [id]);

    // Usunięcie dnia treningowego
    await client.query('DELETE FROM training_days WHERE id = $1', [id]);

    res.status(200).json({ message: 'Dzień treningowy usunięty pomyślnie' });
  } catch (error) {
    console.error('Błąd przy usuwaniu dnia treningowego:', error);
    res.status(500).json({ error: 'Błąd przy usuwaniu dnia treningowego', details: error.message });
  }
});

// Endpoint do dodawania ćwiczenia do dnia treningowego
router.post('/:id/exercises', authenticate, async (req, res) => {
  const { id } = req.params;
  const { exercise_id, weight, description } = req.body;

  try {
    await client.query(
      'INSERT INTO training_day_exercises(training_day_id, exercise_id, weight, description) VALUES($1, $2, $3, $4)',
      [id, exercise_id, weight, description || null]
    );

    res.status(200).json({ message: 'Ćwiczenie dodane do dnia treningowego pomyślnie' });
  } catch (error) {
    console.error('Błąd przy dodawaniu ćwiczenia do dnia treningowego:', error);
    res.status(500).json({ error: 'Błąd przy dodawaniu ćwiczenia do dnia treningowego', details: error.message });
  }
});

export default router;
