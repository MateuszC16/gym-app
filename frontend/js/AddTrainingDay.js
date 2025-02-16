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
      li.classList.add('exercise-item');
      li.innerHTML = `
        <div class="exercise-name">${exercise.name}</div>
        <div class="muscle-group">${exercise.muscle_group || 'Brak danych'}</div>
        Aktualny ciężar: <input type="number" value="${exercise.current_weight || ''}" class="weightInput" data-id="${exercise.id}"><br>
        ${exercise.image_one ? `<img src="http://127.0.0.1:3000${exercise.image_one}" style="width: 100px; height: 100px; margin: 5px;">` : ''}
        ${exercise.image_two ? `<img src="http://127.0.0.1:3000${exercise.image_two}" style="width: 100px; height: 100px; margin: 5px;">` : ''}
        <button class="viewDetailsBtn" data-id="${exercise.id}">Zobacz więcej</button>
        <button class="removeExerciseBtn" data-id="${exercise.id}">Usuń</button>
      `;
      exerciseList.appendChild(li);
      selectedExercises.push(exercise);  // Dodajemy ćwiczenie do tablicy
    };
  
    // Funkcja do usuwania ćwiczenia z listy ćwiczeń wyświetlanej na stronie i z tablicy
    const removeExerciseFromList = (exerciseId) => {
      // Usuwamy ćwiczenie z tablicy selectedExercises
      const exerciseIndex = selectedExercises.findIndex(e => e.id === exerciseId);
      if (exerciseIndex >= 0) {
        selectedExercises.splice(exerciseIndex, 1);  // Usuwamy ćwiczenie z tablicy
      }
      
      // Usuwamy ćwiczenie z DOM
      const exerciseList = document.getElementById('addedExercisesList');
      const exerciseItem = exerciseList.querySelector(`button[data-id="${exerciseId}"]`).closest('li');
      exerciseItem.remove();
    };
  
    // Wyświetlanie szczegółów ćwiczenia w modalu
    const viewExerciseDetails = (exerciseId) => {
      const exercise = exercisesList.find(e => e.id === parseInt(exerciseId));
      const detailsDiv = document.getElementById('exerciseDetails');
      detailsDiv.innerHTML = `
        <strong>${exercise.name}</strong><br>
        Maksymalny ciężar: ${exercise.max_weight || 'Brak danych'}<br>
        Data osiągnięcia maksymalnego ciężaru: ${exercise.max_weight_date || 'Brak danych'}<br>
        ${exercise.image_one ? `<img src="http://127.0.0.1:3000${exercise.image_one}" style="width: 250px; height: 250px; margin: 10px;">` : ''}
        ${exercise.image_two ? `<img src="http://127.0.0.1:3000${exercise.image_two}" style="width: 250px; height: 250px; margin: 10px;">` : ''}
      `;
      document.getElementById('viewExerciseModal').style.display = 'flex';
    };
  
    // Zamknięcie modala
    document.getElementById('closeViewModal').addEventListener('click', () => {
      document.getElementById('viewExerciseModal').style.display = 'none';
    });
  
    // Wywołaj fetchExercises, aby pobrać ćwiczenia
    fetchExercises();
  
    // Obsługuje kliknięcie przycisku "Zobacz więcej"
    document.getElementById('addedExercisesList').addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('viewDetailsBtn')) {
        const exerciseId = e.target.getAttribute('data-id');
        viewExerciseDetails(exerciseId);
      }
  
      // Obsługuje kliknięcie przycisku "Usuń" do usunięcia ćwiczenia z listy
      if (e.target && e.target.classList.contains('removeExerciseBtn')) {
        const exerciseId = e.target.getAttribute('data-id');
        removeExerciseFromList(exerciseId); // Usuwamy ćwiczenie z listy
      }
    });
  
    // Obsługuje kliknięcie przycisku do dodawania ćwiczenia
    document.getElementById('addExerciseBtn').addEventListener('click', async function () {
      const exerciseSelect = document.getElementById('exerciseSelect');
      const selectedExerciseId = exerciseSelect.value;
  
      if (selectedExerciseId) {
        const exercise = exercisesList.find(e => e.id === parseInt(selectedExerciseId));
        addExerciseToList(exercise);
      }
    });
  
    // Obsługuje kliknięcie przycisku "Zapisz Dzień Treningowy"
    const trainingForm = document.getElementById('trainingForm');
    trainingForm.addEventListener('submit', async (event) => {
      event.preventDefault();  // Zapobiegamy automatycznemu wysyłaniu formularza
  
      const trainingDate = document.getElementById('trainingDate').value;
      const location = document.getElementById('location').value;
  
      // Zbieranie ID ćwiczeń dodanych do dnia treningowego
      const exerciseIds = selectedExercises.map(exercise => exercise.id);
  
      const data = {
        date: trainingDate,
        location: location,
        exercises: exerciseIds
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
  