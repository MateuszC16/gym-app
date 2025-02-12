class WorkoutDay {
    constructor(date, exercises) {
      this.date = date;
      this.exercises = exercises; // Tablica ćwiczeń
    }
  
    // Przykładowa metoda do zapisania dnia treningowego w bazie danych
    async saveToDatabase(client) {
      try {
        const result = await client.query('INSERT INTO workout_days(date) VALUES($1) RETURNING *', [this.date]);
        const workoutDay = result.rows[0];
  
        // Teraz dodajemy ćwiczenia do danego dnia treningowego
        for (const exercise of this.exercises) {
          await exercise.saveToDatabase(client);
          await client.query('INSERT INTO workout_day_exercises(workout_day_id, exercise_id) VALUES($1, $2)', [workoutDay.id, exercise.id]);
        }
  
        return workoutDay;
      } catch (err) {
        console.error('Błąd przy zapisywaniu dnia treningowego:', err);
        throw new Error('Błąd przy zapisywaniu dnia treningowego');
      }
    }
  }
  
  export default WorkoutDay;  // Eksportujemy klasę WorkoutDay
  