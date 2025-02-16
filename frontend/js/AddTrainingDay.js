document.addEventListener('DOMContentLoaded', function () {
    // Funkcja do pobrania ćwiczeń z API
    const fetchExercises = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/exercises');
        const exercises = await response.json();
        populateExerciseSelect(exercises);
      } catch (error) {
        console.error("Błąd przy ładowaniu ćwiczeń:", error);
      }
    };
  
    // Funkcja do dynamicznego dodawania ćwiczeń do rozwijanej listy
    const populateExerciseSelect = (exercises) => {
      const exerciseSelect = document.getElementById('exerciseSelect');
      exercises.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise.id; // Używamy ID ćwiczenia jako wartości
        option.textContent = exercise.name; // Nazwa ćwiczenia w opcji
        exerciseSelect.appendChild(option);
      });
    };
  
    // Wywołaj fetchExercises, aby pobrać ćwiczenia
    fetchExercises();
  
    // Przycisk do dodawania nowego ćwiczenia
    const addNewExerciseBtn = document.getElementById('addNewExerciseBtn');
    addNewExerciseBtn.addEventListener('click', function () {
      window.location.href = './addExercise.html'; // Zmienisz ten URL na właściwą stronę do dodawania ćwiczeń
    });
  
    // Obsługuje wybranie ćwiczenia z listy
    const exerciseSelect = document.getElementById('exerciseSelect');
    exerciseSelect.addEventListener('change', function () {
      const selectedExerciseId = this.value;
      console.log(`Wybrane ćwiczenie: ${selectedExerciseId}`);
    });
  
    // Formularz do zapisu dnia treningowego
    const trainingForm = document.getElementById('trainingForm');
    trainingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const trainingDate = document.getElementById('trainingDate').value;
      const location = document.getElementById('location').value;
      const exerciseId = document.getElementById('exerciseSelect').value;
  
      const data = {
        date: trainingDate,
        location: location,
        exercise_id: exerciseId
      };
  
      // Wysyłamy dane do backendu
      const response = await fetch('http://127.0.0.1:3000/api/training-days', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
  
      if (response.ok) {
        alert('Dzień treningowy zapisany pomyślnie!');
      } else {
        alert('Błąd przy zapisywaniu dnia treningowego');
      }
    });
  });
  