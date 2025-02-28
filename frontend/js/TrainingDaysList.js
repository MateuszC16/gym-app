async function fetchTrainingDays() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/training-days');
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
  const exercisesSelect = document.getElementById('editExerciseSelect');
  const addedExercisesList = document.getElementById('editAddedExercisesList');
  
  // Wypełnij pola w formularzu edycji
  trainingDateInput.value = trainingDay.date;
  locationInput.value = trainingDay.location;
  
  // Wyczyść listę ćwiczeń w modalu
  addedExercisesList.innerHTML = '';
  
  trainingDay.exercises.forEach(exercise => {
    const li = document.createElement('li');
    li.textContent = `${exercise.name} - Waga: ${exercise.current_training_day_weight} kg`;
    addedExercisesList.appendChild(li);
  });

  // Pokaż modal
  modal.style.display = 'flex'; // Zmiana z 'block' na 'flex' dla wyśrodkowania

  // Obsługa zapisu zmian
  document.getElementById('saveEditedTrainingDayBtn').addEventListener('click', async () => {
    const updatedTrainingDay = {
      date: trainingDateInput.value,
      location: locationInput.value,
      exercises: trainingDay.exercises // Możesz zaktualizować ćwiczenia według potrzeb
    };

    const response = await fetch(`http://127.0.0.1:3000/api/training-days/${trainingDay.id}`, {
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
}


// Funkcja do usuwania dnia treningowego
async function deleteTrainingDay(trainingDayId) {
  const response = await fetch(`http://127.0.0.1:3000/api/training-days/${trainingDayId}`, {
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
