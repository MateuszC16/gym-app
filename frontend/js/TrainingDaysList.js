async function fetchTrainingDays() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/training-days');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    const trainingDaysList = document.getElementById('training-days-list');

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

      trainingDayElement.appendChild(exerciseList);
      trainingDaysList.appendChild(trainingDayElement);
    });
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

// Wywołanie funkcji
fetchTrainingDays();
