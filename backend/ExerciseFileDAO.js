class ExerciseFileDao {
  constructor(client) {
    this.client = client;  // Przechowujemy klienta PostgreSQL
  }

  // Zapis ćwiczenia do bazy danych
  async saveExercise(exercise) {
    const query = 'INSERT INTO exercises(name, muscle_group, current_weight, max_weight) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [exercise.name, exercise.muscleGroup, exercise.currentWeight, exercise.maxWeight];
    
    try {
      const res = await this.client.query(query, values);  // Używamy tego samego klienta
      console.log('Dodano ćwiczenie:', res.rows[0]);
    } catch (err) {
      console.error('Błąd przy zapisywaniu ćwiczenia:', err);
    }
  }

  // Pobieranie wszystkich ćwiczeń z bazy danych
  async loadAllExercises() {
    try {
      const res = await this.client.query('SELECT * FROM exercises');  // Używamy tego samego klienta
      return res.rows;
    } catch (err) {
      console.error('Błąd przy ładowaniu ćwiczeń:', err);
      return [];
    }
  }

  // Zamknięcie połączenia z bazą
  async closeConnection() {
    await this.client.end();
    console.log('Połączenie z bazą danych zostało zamknięte');
  }
}

// Eksportujemy klasę jako domyślny eksport
export default ExerciseFileDao;
