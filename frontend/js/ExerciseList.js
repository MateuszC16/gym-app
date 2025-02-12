class ExerciseList {
    constructor() {
      this.renderExercises();  // Załaduj ćwiczenia po załadowaniu strony
    }
  
    // Funkcja do renderowania ćwiczeń na stronie
    async renderExercises() {
      const response = await fetch('http://localhost:3000/api/exercises');  // Wysyłamy zapytanie do backendu
      const exercises = await response.json();
      
      const exerciseList = document.getElementById('exercise-list');
      exerciseList.innerHTML = '';  // Czyścimy poprzednią listę
  
      exercises.forEach(exercise => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${exercise.name}</td>
          <td>${exercise.muscle_group}</td>
          <td>${exercise.current_weight} kg</td>
          <td>${exercise.max_weight} kg</td>
        `;
        exerciseList.appendChild(tr);
      });
    }
  }
  
  // Inicjalizujemy listę ćwiczeń
  const exerciseList = new ExerciseList();
  