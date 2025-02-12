class Exercise {
  constructor(name, muscleGroup, currentWeight, maxWeight) {
    this.name = name;
    this.muscleGroup = muscleGroup;
    this.currentWeight = currentWeight;
    this.maxWeight = maxWeight;
  }

  // Przykładowa metoda do zapisywania ćwiczenia w bazie danych
  async saveToDatabase(client) {
    const query = 'INSERT INTO exercises(name, muscle_group, current_weight, max_weight) VALUES($1, $2, $3, $4) RETURNING *';
    const values = [this.name, this.muscleGroup, this.currentWeight, this.maxWeight];
    
    try {
      const res = await client.query(query, values);
      return res.rows[0];
    } catch (err) {
      console.error('Błąd podczas zapisywania ćwiczenia:', err);
      throw new Error('Błąd przy zapisywaniu ćwiczenia');
    }
  }
}

export default Exercise;  // Eksportujemy klasę Exercise
