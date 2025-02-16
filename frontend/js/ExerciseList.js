class ExerciseList {
  constructor() {
    this.renderExercises();  // Załaduj ćwiczenia po załadowaniu strony
  }

  // Funkcja do renderowania ćwiczeń na stronie
  async renderExercises() {
    try {
      const response = await fetch('http://localhost:3000/api/exercises');
      
      // Sprawdzanie odpowiedzi serwera
      if (!response.ok) {
        throw new Error(`Błąd odpowiedzi z serwera: ${response.status}`);
      }

      const exercises = await response.json();
      console.log('Dane ćwiczeń:', exercises);  // Dodane logowanie odpowiedzi

      const exerciseList = document.getElementById('exercise-list');
      exerciseList.innerHTML = '';  // Czyścimy poprzednią listę

      if (exercises.length === 0) {
        exerciseList.innerHTML = '<p>Brak ćwiczeń w bazie danych.</p>';
      }

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

    } catch (error) {
      console.error("Błąd podczas renderowania ćwiczeń:", error);
      alert("Wystąpił błąd podczas ładowania ćwiczeń.");
    }
  }

  // Funkcja do otwierania powiększonego zdjęcia w modalu
  openImage(imageUrl) {
    const modal = document.createElement('div');
    modal.classList.add('modal');

    const closeButton = document.createElement('button');
    closeButton.classList.add('modal-close');
    closeButton.innerHTML = 'Powrót';
    closeButton.onclick = () => modal.remove();

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Powiększone zdjęcie';
    img.classList.add('modal-image');
    
    modal.appendChild(closeButton);
    modal.appendChild(img);

    document.body.appendChild(modal);

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

  // Funkcja do edytowania ćwiczenia
async editExercise(id) {
  const response = await fetch(`http://localhost:3000/api/exercises/${id}`);
  const exercise = await response.json();

  const modal = document.createElement('div');
  modal.classList.add('modal');

  const imageOneInfo = exercise.image_one ? `Dodane zdjęcie 1: <a href="http://localhost:3000${exercise.image_one}" target="_blank">Zobacz</a>` : 'Brak zdjęcia 1';
  const imageTwoInfo = exercise.image_two ? `Dodane zdjęcie 2: <a href="http://localhost:3000${exercise.image_two}" target="_blank">Zobacz</a>` : 'Brak zdjęcia 2';

  modal.innerHTML = `
    <div class="modal-content">
      <h2>Edytuj ćwiczenie</h2>
      
      <label for="name">Nazwa ćwiczenia</label>
      <input type="text" id="name" value="${exercise.name}">
      
      <label for="muscleGroup">Partia mięśniowa</label>
      <select id="muscleGroup">
        <option value="klatka piersiowa" ${exercise.muscle_group === 'klatka piersiowa' ? 'selected' : ''}>Klatka piersiowa</option>
        <option value="plecy" ${exercise.muscle_group === 'plecy' ? 'selected' : ''}>Plecy</option>
        <option value="barki" ${exercise.muscle_group === 'barki' ? 'selected' : ''}>Barki</option>
        <option value="biceps" ${exercise.muscle_group === 'biceps' ? 'selected' : ''}>Biceps</option>
        <option value="triceps" ${exercise.muscle_group === 'triceps' ? 'selected' : ''}>Triceps</option>
        <option value="nogi" ${exercise.muscle_group === 'nogi' ? 'selected' : ''}>Nogi</option>
        <option value="brzuch" ${exercise.muscle_group === 'brzuch' ? 'selected' : ''}>Brzuch</option>
        <option value="łydki" ${exercise.muscle_group === 'łydki' ? 'selected' : ''}>Łydki</option>
        <option value="przedramiona" ${exercise.muscle_group === 'przedramiona' ? 'selected' : ''}>Przedramiona</option>
        <option value="pośladki" ${exercise.muscle_group === 'pośladki' ? 'selected' : ''}>Pośladki</option>
      </select>
      
      <label for="currentWeight">Aktualny ciężar (kg)</label>
      <input type="number" id="currentWeight" value="${exercise.current_weight}">
      
      <label for="maxWeight">Maksymalny ciężar (kg)</label>
      <input type="number" id="maxWeight" value="${exercise.max_weight || ''}">
      
      <label for="maxWeightDate">Data osiągnięcia maksymalnego ciężaru</label>
      <input type="date" id="maxWeightDate" value="${exercise.max_weight_date ? new Date(exercise.max_weight_date).toLocaleDateString('en-CA') : ''}">
      
      <label for="imageOne">Zdjęcie 1</label>
      <input type="file" id="imageOne">
      <p>${imageOneInfo}</p>

      <label for="imageTwo">Zdjęcie 2</label>
      <input type="file" id="imageTwo">
      <p>${imageTwoInfo}</p>
      
      <button id="saveButton">Zapisz</button>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('saveButton').addEventListener('click', async () => {
    const updatedExercise = new FormData();
    updatedExercise.append('name', document.getElementById('name').value);
    updatedExercise.append('muscleGroup', document.getElementById('muscleGroup').value);  // Ustawienie wartości wybranej w formularzu
    updatedExercise.append('currentWeight', document.getElementById('currentWeight').value);
    updatedExercise.append('maxWeight', document.getElementById('maxWeight').value);
    updatedExercise.append('maxWeightDate', document.getElementById('maxWeightDate').value);
    
    const imageOne = document.getElementById('imageOne').files[0];
    const imageTwo = document.getElementById('imageTwo').files[0];

    if (imageOne) {
      updatedExercise.append('imageOne', imageOne);
    } else {
      updatedExercise.append('imageOne', exercise.image_one || '');
    }

    if (imageTwo) {
      updatedExercise.append('imageTwo', imageTwo);
    } else {
      updatedExercise.append('imageTwo', exercise.image_two || '');
    }

    const response = await fetch(`http://localhost:3000/api/exercises/${id}`, {
      method: 'PUT',
      body: updatedExercise
    });

    if (response.ok) {
      modal.remove();
      this.renderExercises();
    } else {
      alert('Błąd podczas edytowania ćwiczenia');
    }
  });

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
        this.renderExercises();
      } else {
        console.error('Błąd przy usuwaniu ćwiczenia');
      }
    }
  }
}

const exerciseList = new ExerciseList();
