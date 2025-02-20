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
        // Sprawdź, czy ćwiczenie już istnieje w tablicy selectedExercises
        const isExerciseAlreadyAdded = selectedExercises.some(e => e.id === exercise.id);
        if (isExerciseAlreadyAdded) {
            alert('To ćwiczenie zostało już dodane!');
            return; // Nie dodawaj ponownie
        }

        const exerciseList = document.getElementById('addedExercisesList');
        const li = document.createElement('li');
        li.classList.add('exercise-item');
        li.innerHTML = `
            <div class="exercise-name">${exercise.name}</div>
            <div class="muscle-group">${exercise.muscle_group || 'Brak danych'}</div>
            Aktualny ciężar: <input type="number" value="${exercise.current_weight || ''}" class="weightInput" data-id="${exercise.id}"><br>
            Opis: <textarea class="descriptionInput" data-id="${exercise.id}" placeholder="Dodaj opis ćwiczenia"></textarea><br>
            ${exercise.image_one ? `<img src="http://127.0.0.1:3000${exercise.image_one}" style="width: 100px; height: 100px; margin: 5px;">` : ''}
            ${exercise.image_two ? `<img src="http://127.0.0.1:3000${exercise.image_two}" style="width: 100px; height: 100px; margin: 5px;">` : ''}
            <button class="removeExerciseBtn" data-id="${exercise.id}">Usuń</button>
        `;
        exerciseList.appendChild(li);
        selectedExercises.push(exercise);  // Dodajemy ćwiczenie do tablicy
    };

    // Funkcja do usuwania ćwiczenia z listy ćwiczeń i tablicy
    const removeExerciseFromList = (exerciseId) => {
        // Usuwamy ćwiczenie z tablicy selectedExercises
        selectedExercises = selectedExercises.filter(e => e.id !== exerciseId);

        // Usuwamy ćwiczenie z DOM
        const exerciseList = document.getElementById('addedExercisesList');
        const exerciseItem = exerciseList.querySelector(`button[data-id="${exerciseId}"]`).closest('li');
        if (exerciseItem) {
            exerciseItem.remove();
        }
    };

    // Wywołaj fetchExercises, aby pobrać ćwiczenia
    fetchExercises();

    // Obsługuje kliknięcie przycisku "Usuń" do usunięcia ćwiczenia z listy
    document.getElementById('addedExercisesList').addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('removeExerciseBtn')) {
            const exerciseId = parseInt(e.target.getAttribute('data-id')); // Upewnij się, że exerciseId jest liczbą
            removeExerciseFromList(exerciseId); // Usuwamy ćwiczenie z listy
            e.stopPropagation();  // Zapobiegamy propagacji, aby nie wywołać submitu formularza
        }
    });

    // Obsługuje kliknięcie przycisku do dodawania ćwiczenia
    document.getElementById('addExerciseBtn').addEventListener('click', async function () {
        const exerciseSelect = document.getElementById('exerciseSelect');
        const selectedExerciseId = parseInt(exerciseSelect.value); // Upewnij się, że selectedExerciseId jest liczbą

        if (selectedExerciseId) {
            const exercise = exercisesList.find(e => e.id === selectedExerciseId);
            if (exercise) {
                addExerciseToList(exercise);
            }
        }
    });

    // Obsługuje kliknięcie przycisku "Zapisz Dzień Treningowy"
    const trainingForm = document.getElementById('trainingForm');
    trainingForm.addEventListener('submit', async (event) => {
        event.preventDefault();  // Zapobiegamy automatycznemu wysyłaniu formularza
    
        const trainingDate = document.getElementById('trainingDate').value;
        const location = document.getElementById('location').value;
    
        // Zbieranie ćwiczeń z selectedExercises, dodajemy wagę i opis
        const exercisesWithDetails = selectedExercises.map(exercise => {
            const weightInput = document.querySelector(`.weightInput[data-id="${exercise.id}"]`);
            const descriptionInput = document.querySelector(`.descriptionInput[data-id="${exercise.id}"]`);
            const weight = weightInput ? parseFloat(weightInput.value) : null;
            const description = descriptionInput ? descriptionInput.value : null;
    
            return {
                exercise_id: exercise.id,
                weight: weight,
                description: description
            };
        });
    
        const data = {
            date: trainingDate,
            location: location,
            exercises: exercisesWithDetails
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
