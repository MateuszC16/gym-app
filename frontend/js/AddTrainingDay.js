document.addEventListener('DOMContentLoaded', function () {
    let exercisesList = []; // Lista ćwiczeń z bazy danych
    let selectedExercises = []; // Lista ćwiczeń dodanych do dnia treningowego
  
    // Funkcja do pobrania ćwiczeń z API
    const fetchExercises = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/exercises');
        exercisesList = await response.json();
        populateExerciseSelect(exercisesList);
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
  
    // Funkcja do dodania ćwiczenia do listy ćwiczeń w formularzu
    const addExerciseToList = (exercise) => {
      const exerciseList = document.getElementById('addedExercisesList');
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${exercise.name}</strong><br>
        Aktualny ciężar: ${exercise.current_weight ? exercise.current_weight + ' kg' : 'Brak danych'}<br>
        ${exercise.image_one ? `<img src="http://127.0.0.1:3000${exercise.image_one}" style="width: 100px; height: 100px; margin: 5px;">` : ''}
        ${exercise.image_two ? `<img src="http://127.0.0.1:3000${exercise.image_two}" style="width: 100px; height: 100px; margin: 5px;">` : ''}
      `;
      exerciseList.appendChild(li);
  
      // Dodaj ćwiczenie do listy dodanych ćwiczeń
      selectedExercises.push(exercise);  // Zapisujemy całe ćwiczenie w tablicy
    };
  
    // Funkcja do dodawania ćwiczenia do listy na froncie (nie zapisujemy do bazy)
    const addExerciseToTrainingDay = async (exerciseId) => {
      const exercise = exercisesList.find(e => e.id === parseInt(exerciseId));
      if (!exercise) return;  // Jeżeli ćwiczenie nie istnieje, nie dodawaj
  
      addExerciseToList(exercise);  // Dodaj ćwiczenie do listy na froncie, ale nie zapisuj jeszcze w bazie danych
    };
  
    // Wywołaj fetchExercises, aby pobrać ćwiczenia
    fetchExercises();
  
    // Obsługuje kliknięcie przycisku do dodawania ćwiczenia
    const addExerciseBtn = document.getElementById('addExerciseBtn');
    addExerciseBtn.addEventListener('click', async function () {
      const exerciseSelect = document.getElementById('exerciseSelect');
      const selectedExerciseId = exerciseSelect.value;
  
      if (selectedExerciseId) {
        await addExerciseToTrainingDay(selectedExerciseId);
      }
    });
  
    // Formularz do zapisu dnia treningowego
    const trainingForm = document.getElementById('trainingForm');
    trainingForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      const trainingDate = document.getElementById('trainingDate').value;
      const location = document.getElementById('location').value;
  
      // Zbieranie ID ćwiczeń dodanych do dnia treningowego
      const exerciseIds = selectedExercises.map(exercise => exercise.id);  // Pobieramy ID ćwiczeń
  
      console.log('Selected Exercises:', selectedExercises); // Logowanie całej tablicy ćwiczeń
      console.log('Exercise IDs:', exerciseIds); // Logowanie tablicy z ID ćwiczeń
  
      // Sprawdzamy, czy mamy ćwiczenia do zapisania
      if (exerciseIds.length === 0) {
        alert('Musisz dodać przynajmniej jedno ćwiczenie do dnia treningowego');
        return;
      }
  
      const data = {
        date: trainingDate,
        location: location,
        exercises: exerciseIds // Wysyłamy tablicę ćwiczeń
      };
  
      console.log('Sending data to server:', data); // Logowanie danych przed wysłaniem
  
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
  