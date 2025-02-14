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
      const card = document.createElement('div');
      card.classList.add('exercise-card');
      
      // Generowanie HTML dla zdjęć (jeśli istnieją)
      let imagesHtml = '';
      if (exercise.image_one) {
        imagesHtml += `<img src="http://localhost:3000${exercise.image_one}" class="exercise-image" /> `;
      }
      if (exercise.image_two) {
        imagesHtml += `<img src="http://localhost:3000${exercise.image_two}" class="exercise-image" /> `;
      }

      // Formatowanie daty osiągnięcia maksymalnego ciężaru (jeśli istnieje)
      const maxWeightDate = exercise.max_weight_date ? new Date(exercise.max_weight_date).toLocaleDateString() : 'Brak daty';

      card.innerHTML = `
        <h2>${exercise.name}</h2>
        <p><strong>Partia mięśniowa:</strong> ${exercise.muscle_group}</p>
        <p><strong>Aktualny ciężar:</strong> <strong>${exercise.current_weight} kg</strong></p>
        <p><strong>Maksymalny ciężar:</strong> <strong>${exercise.max_weight ? exercise.max_weight + ' kg' : 'Brak'}</strong></p>
        <p><strong>Data maksymalnego ciężaru:</strong> ${maxWeightDate}</p>
        <div class="images">
          ${imagesHtml}
        </div>
        <div class="actions">
          <button onclick="exerciseList.editExercise(${exercise.id})">Edytuj</button>
          <button onclick="exerciseList.deleteExercise(${exercise.id})">Usuń</button>
        </div>
      `;
      exerciseList.appendChild(card);
    });

    // Nasłuchiwanie na kliknięcia w zdjęcia, aby otworzyć modal
    const images = document.querySelectorAll('.exercise-image');
    images.forEach(img => {
      img.addEventListener('click', (event) => {
        this.openImage(event.target.src);  // Otwórz powiększony obrazek
      });
    });
  }

  openImage(imageUrl) {
    const modal = document.createElement('div');
    modal.classList.add('modal');
  
    // Przyciski zamykania
    const closeButton = document.createElement('button');
    closeButton.classList.add('modal-close');
    closeButton.innerHTML = 'Powrót'; // Tekst na przycisku
    closeButton.onclick = () => modal.remove();
  
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Powiększone zdjęcie';
    img.classList.add('modal-image');
    
    modal.appendChild(closeButton);
    modal.appendChild(img);
  
    // Dodajemy modal do body
    document.body.appendChild(modal);
  
    // Upewnij się, że modal jest widoczny
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  }
  async editExercise(id) {
    const response = await fetch(`http://localhost:3000/api/exercises/${id}`);
    const exercise = await response.json();
  
    const modal = document.createElement('div');
    modal.classList.add('modal');
    modal.innerHTML = `
      <div class="modal-content">
        <h2>Edytuj ćwiczenie</h2>
        <label for="name">Nazwa ćwiczenia</label>
        <input type="text" id="name" value="${exercise.name}">
        
        <label for="muscleGroup">Partia mięśniowa</label>
        <input type="text" id="muscleGroup" value="${exercise.muscle_group}">
        
        <label for="currentWeight">Aktualny ciężar (kg)</label>
        <input type="number" id="currentWeight" value="${exercise.current_weight}">
        
        <label for="maxWeight">Maksymalny ciężar (kg)</label>
        <input type="number" id="maxWeight" value="${exercise.max_weight || ''}">
        
        <label for="maxWeightDate">Data osiągnięcia maksymalnego ciężaru</label>
        <input type="date" id="maxWeightDate" value="${exercise.max_weight_date ? new Date(exercise.max_weight_date).toLocaleDateString('en-CA') : ''}">
        
        <button id="saveButton">Zapisz</button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle saving the edited exercise
    document.getElementById('saveButton').addEventListener('click', async () => {
      const updatedExercise = {
        name: document.getElementById('name').value,
        muscleGroup: document.getElementById('muscleGroup').value,
        currentWeight: document.getElementById('currentWeight').value,
        maxWeight: document.getElementById('maxWeight').value,
        maxWeightDate: document.getElementById('maxWeightDate').value
      };
  
      const response = await fetch(`http://localhost:3000/api/exercises/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedExercise)
      });
  
      if (response.ok) {
        modal.remove();  // Close modal
        this.renderExercises();  // Re-render exercises
      } else {
        alert('Błąd podczas edytowania ćwiczenia');
      }
    });
    
    // Handle closing the modal
    const closeButton = document.createElement('button');
    closeButton.classList.add('modal-close');
    closeButton.innerHTML = 'Powrót';
    closeButton.onclick = () => modal.remove();
    modal.appendChild(closeButton);
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
