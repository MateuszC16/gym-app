class ExerciseList {
  constructor() {
    this.renderExercises();  // Załaduj ćwiczenia po załadowaniu strony
  }

  // Funkcja do renderowania ćwiczeń na stronie
  async renderExercises() {
    const response = await fetch('http://localhost:3000/api/exercises');
    const exercises = await response.json();
    
    const exerciseList = document.getElementById('exercise-list');
    exerciseList.innerHTML = '';  // Czyścimy poprzednią listę

    exercises.forEach(exercise => {
      const tr = document.createElement('tr');
      let imagesHtml = '';

      // Generujemy HTML dla zdjęć (jeśli istnieją)
      if (exercise.image_one) {
        imagesHtml += `<img src="http://localhost:3000${exercise.image_one}" width="100" height="100" /> `;
      }
      if (exercise.image_two) {
        imagesHtml += `<img src="http://localhost:3000${exercise.image_two}" width="100" height="100" /> `;
      }

      tr.innerHTML = `
        <td>${exercise.name}</td>
        <td>${exercise.muscle_group}</td>
        <td>${exercise.current_weight} kg</td>
        <td>${exercise.max_weight} kg</td>
        <td>${imagesHtml || 'Brak zdjęć'}</td>  <!-- Wyświetlanie zdjęć -->
        <td>
          <button onclick="exerciseList.editExercise(${exercise.id})">Edytuj</button>
          <button onclick="exerciseList.deleteExercise(${exercise.id})">Usuń</button>
        </td>
      `;
      exerciseList.appendChild(tr);
    });
  }

  // Funkcja do edytowania ćwiczenia
  async editExercise(id) {
    const name = prompt('Nowa nazwa ćwiczenia:');
    const muscleGroup = prompt('Nowa partia mięśniowa:');
    const currentWeight = prompt('Nowy aktualny ciężar (kg):');
    const maxWeight = prompt('Nowy maksymalny ciężar (kg):');

    const exerciseData = {
      name,
      muscleGroup,
      currentWeight: parseFloat(currentWeight),
      maxWeight: parseFloat(maxWeight),
    };

    const response = await fetch(`http://localhost:3000/api/exercises/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(exerciseData)
    });

    if (response.ok) {
      this.renderExercises();  // Zaktualizuj listę ćwiczeń
    } else {
      console.error('Błąd przy edytowaniu ćwiczenia');
    }
  }

  // Funkcja do usuwania ćwiczenia
  async deleteExercise(id) {
    if (confirm('Czy na pewno chcesz usunąć to ćwiczenie?')) {
      const response = await fetch(`http://localhost:3000/api/exercises/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Ćwiczenie zostało usunięte.');
        this.renderExercises();  // Zaktualizuj listę ćwiczeń
      } else {
        console.error('Błąd przy usuwaniu ćwiczenia');
      }
    }
  }
}

// Tworzymy instancję klasy ExerciseList
const exerciseList = new ExerciseList();
