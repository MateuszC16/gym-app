async function fetchTrainingDays() {
  try {
    const response = await fetch(window.SERVER_URL+'api/training-days');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const trainingDaysList = document.getElementById('training-days-list');
    trainingDaysList.innerHTML = ''; // Wyczyść poprzednie dni treningowe przed załadowaniem nowych

    // Iteracja przez dni treningowe
    data.forEach(trainingDay => {
      const trainingDayElement = document.createElement('div');
      trainingDayElement.classList.add('training-day');

      // Formatowanie daty
      const date = new Date(trainingDay.date);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;

      // Tworzenie nagłówka z datą i miejscem
      const header = document.createElement('h2');
      header.textContent = `${formattedDate} - ${trainingDay.location}`;
      trainingDayElement.appendChild(header);

      // Tworzenie listy ćwiczeń
      const exerciseList = document.createElement('div');
      exerciseList.classList.add('exercise-list');

      if (trainingDay.exercises && trainingDay.exercises.length > 0) {
        // Wydzielenie ćwiczeń
        trainingDay.exercises.forEach(exercise => {
          const exerciseItem = document.createElement('div');
          exerciseItem.classList.add('exercise-item');
          
          // Nazwa ćwiczenia i waga z encji asocjacyjnej
          const exerciseText = document.createElement('p');
          exerciseText.innerHTML = `<span>${exercise.name}</span>: Wykonano z wagą ${exercise.current_training_day_weight ? exercise.current_training_day_weight : 'Brak danych'} kg`; // Waga z encji asocjacyjnej
          exerciseItem.appendChild(exerciseText);
          
          exerciseList.appendChild(exerciseItem);
        });
      } else {
        const noExercisesMessage = document.createElement('p');
        noExercisesMessage.textContent = 'No exercises assigned. Add exercises.';
        exerciseList.appendChild(noExercisesMessage);
      }

      // Dodanie listy ćwiczeń
      trainingDayElement.appendChild(exerciseList);

      // Dodanie kontenera dla przycisków
      const buttonsContainer = document.createElement('div');
      buttonsContainer.classList.add('buttons-container');

      // Dodanie przycisków Edytuj i Usuń
      const editBtn = document.createElement('button');
      editBtn.classList.add('btn');
      editBtn.textContent = 'Edytuj';
      editBtn.addEventListener('click', () => openEditModal(trainingDay)); // Otworzenie modala do edycji

      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('btn');
      deleteBtn.textContent = 'Usuń';
      deleteBtn.addEventListener('click', () => deleteTrainingDay(trainingDay.id)); // Usuwanie dnia treningowego

      // Dodanie przycisków do kontenera
      buttonsContainer.appendChild(editBtn);
      buttonsContainer.appendChild(deleteBtn);

      // Dodanie kontenera przycisków do dnia treningowego
      trainingDayElement.appendChild(buttonsContainer);
      
      // Dodanie dnia treningowego do listy
      trainingDaysList.appendChild(trainingDayElement);
    });
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

function openEditModal(trainingDay) {
  const modal = document.getElementById('editTrainingDayModal');
  const trainingDateInput = document.getElementById('editTrainingDate');
  const locationInput = document.getElementById('editLocation');
  const muscleGroupSelect = document.getElementById('editMuscleGroupSelect');
  const exercisesSelect = document.getElementById('editExerciseSelect');
  const addedExercisesList = document.getElementById('editAddedExercisesList');
  
  // Wypełnij pola w formularzu edycji
  trainingDateInput.value = new Date(trainingDay.date).toISOString().split('T')[0]; // Ustaw datę na poprzednią wartość
  locationInput.value = trainingDay.location;
  
  // Wyczyść listę ćwiczeń w modalu
  addedExercisesList.innerHTML = '';
  
  trainingDay.exercises.forEach(exercise => {
    const li = document.createElement('li');
    li.innerHTML = `
      ${exercise.name} - Waga: <input type="number" value="${exercise.current_training_day_weight}" class="editWeightInput" data-id="${exercise.id}">
      Opis: <textarea class="editDescriptionInput" data-id="${exercise.id}">${exercise.training_day_description}</textarea>
      <button class="removeExerciseBtn" data-id="${exercise.id}">Usuń</button>
    `;
    addedExercisesList.appendChild(li);
  });

  // Pokaż modal
  modal.style.display = 'flex'; // Zmiana z 'block' na 'flex' dla wyśrodkowania

  // Pobierz wszystkie ćwiczenia z bazy danych i wypełnij select
  fetch(window.SERVER_URL+'api/exercises')
    .then(response => response.json())
    .then(exercises => {
      exercisesSelect.innerHTML = '<option value="">Wybierz ćwiczenie</option>';
      exercises.forEach(exercise => {
        const option = document.createElement('option');
        option.value = exercise.id;
        option.textContent = exercise.name;
        exercisesSelect.appendChild(option);
      });

      // Wypełnij select partii mięśniowych
      muscleGroupSelect.innerHTML = `
        <option value="all">Wszystkie</option>
        <option value="klatka piersiowa">Klatka piersiowa</option>
        <option value="plecy">Plecy</option>
        <option value="barki">Barki</option>
        <option value="biceps">Biceps</option>  
        <option value="triceps">Triceps</option>  
        <option value="nogi">Nogi</option>
        <option value="brzuch">Brzuch</option>
        <option value="łydki">Łydki</option>
        <option value="przedramiona">Przedramiona</option>
        <option value="pośladki">Pośladki</option>
      `;

      // Obsługa zmiany partii mięśniowej
      muscleGroupSelect.addEventListener('change', () => {
        const selectedGroup = muscleGroupSelect.value;
        exercisesSelect.innerHTML = '<option value="">Wybierz ćwiczenie</option>';
        exercises
          .filter(ex => selectedGroup === 'all' || ex.muscle_group === selectedGroup)
          .forEach(exercise => {
            const option = document.createElement('option');
            option.value = exercise.id;
            option.textContent = exercise.name;
            exercisesSelect.appendChild(option);
          });
      });
    });

  // Obsługa zapisu zmian
  document.getElementById('saveEditedTrainingDayBtn').addEventListener('click', async () => {
    const updatedExercises = Array.from(addedExercisesList.children).map(li => {
      const exerciseId = parseInt(li.querySelector('.editWeightInput').getAttribute('data-id'));
      const weight = parseFloat(li.querySelector('.editWeightInput').value);
      const description = li.querySelector('.editDescriptionInput').value;
      return { exercise_id: exerciseId, weight, description };
    });

    const updatedTrainingDay = {
      date: trainingDateInput.value,
      location: locationInput.value,
      exercises: updatedExercises // Ensure exercises array is correctly passed
    };

    console.log('Sending updated training day data:', updatedTrainingDay); // Logowanie danych przed wysłaniem

    const response = await fetch(`${window.SERVER_URL}api/training-days/${trainingDay.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTrainingDay)
    });

    if (response.ok) {
      alert('Dzień treningowy zaktualizowany');
      location.reload(); // Odśwież stronę, by zobaczyć zmiany
    } else {
      alert('Błąd przy edytowaniu dnia treningowego');
    }
  });

  // Anulowanie edycji
  document.getElementById('cancelEditTrainingDayBtn').addEventListener('click', () => {
    modal.style.display = 'none'; // Zamknij modal
  });

  // Obsługa usuwania ćwiczenia
  addedExercisesList.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('removeExerciseBtn')) {
      const exerciseId = parseInt(e.target.getAttribute('data-id'));
      const li = e.target.closest('li');
      li.remove(); // Usuń ćwiczenie z listy w modalu
      trainingDay.exercises = trainingDay.exercises.filter(ex => ex.id !== exerciseId); // Usuń ćwiczenie z obiektu trainingDay
    }
  });

  // Obsługa dodawania nowego ćwiczenia
  document.getElementById('addNewExerciseBtn').addEventListener('click', async () => {
    const selectedExerciseId = parseInt(exercisesSelect.value);
    if (selectedExerciseId) {
      // Sprawdź, czy ćwiczenie już istnieje w liście
      const isExerciseAlreadyAdded = Array.from(addedExercisesList.children).some(li => {
        return parseInt(li.querySelector('.editWeightInput').getAttribute('data-id')) === selectedExerciseId;
      });

      if (isExerciseAlreadyAdded) {
        alert('To ćwiczenie zostało już dodane!');
        return; // Nie dodawaj ponownie
      }

      const response = await fetch(`${window.SERVER_URL}api/exercises/${selectedExerciseId}`);
      const exercise = await response.json();
      trainingDay.exercises.push({
        id: exercise.id,
        name: exercise.name,
        muscle_group: exercise.muscle_group,
        current_training_day_weight: exercise.current_weight || 0,
        training_day_description: ''
      });
      const li = document.createElement('li');
      li.innerHTML = `
        ${exercise.name} - Waga: <input type="number" value="${exercise.current_weight || 0}" class="editWeightInput" data-id="${exercise.id}">
        Opis: <textarea class="editDescriptionInput" data-id="${exercise.id}"></textarea>
        <button class="removeExerciseBtn" data-id="${exercise.id}">Usuń</button>
      `;
      addedExercisesList.appendChild(li);
    }
  });
}

// Funkcja do usuwania dnia treningowego
async function deleteTrainingDay(trainingDayId) {
  const response = await fetch(`${window.SERVER_URL}api/training-days/${trainingDayId}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    alert('Dzień treningowy usunięty');
    location.reload(); // Odśwież stronę, by zobaczyć zmiany
  } else {
    alert('Błąd przy usuwaniu dnia treningowego');
  }
}

// Wywołanie funkcji do załadowania dni treningowych
fetchTrainingDays();
