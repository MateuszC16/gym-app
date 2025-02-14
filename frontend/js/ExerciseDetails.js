class ExerciseDetails {
    constructor() {
      const urlParams = new URLSearchParams(window.location.search);
      const exerciseId = urlParams.get('id');
      console.log('ID ćwiczenia:', exerciseId);
      if (exerciseId) {
        this.loadExerciseDetails(exerciseId);
      } else {
        alert('Brak ID ćwiczenia');
      }
    }
  
    async loadExerciseDetails(id) {
      try {
        const response = await fetch(`http://localhost:3000/api/exercises/${id}`);
        
        if (!response.ok) {
          console.error('Błąd odpowiedzi API:', response.statusText);
          alert('Nie znaleziono ćwiczenia.');
          return;
        }
  
        const exercise = await response.json();
        console.log('Dane ćwiczenia:', exercise);
  
        const detailsDiv = document.getElementById('exercise-details');
        
        if (!exercise || !exercise.name) {
          detailsDiv.innerHTML = '<p>Nie znaleziono ćwiczenia o podanym ID.</p>';
          return;
        }
  
        let imagesHtml = '';
        if (exercise.image_one) {
          imagesHtml += `<img src="http://localhost:3000${exercise.image_one}" width="200" /> 
          <button onclick="exerciseDetails.deleteImage('image_one')">Usuń zdjęcie</button><br>`;
        }
        if (exercise.image_two) {
          imagesHtml += `<img src="http://localhost:3000${exercise.image_two}" width="200" /> 
          <button onclick="exerciseDetails.deleteImage('image_two')">Usuń zdjęcie</button><br>`;
        }
  
        detailsDiv.innerHTML = `
          <p><strong>Nazwa ćwiczenia:</strong> <input type="text" id="name" value="${exercise.name}" /></p>
          <p><strong>Partia mięśniowa:</strong> <input type="text" id="muscle_group" value="${exercise.muscle_group}" /></p>
          <p><strong>Aktualny ciężar:</strong> <input type="number" id="current_weight" value="${exercise.current_weight}" /></p>
          <p><strong>Maksymalny ciężar:</strong> <input type="number" id="max_weight" value="${exercise.max_weight || ''}" /></p>
          <p><strong>Data osiągnięcia maksymalnego obciążenia:</strong> <input type="date" id="max_weight_date" value="${exercise.max_weight_date || ''}" /></p>
          <p><strong>Zdjęcia:</strong> ${imagesHtml || 'Brak zdjęć'}</p>
          <button onclick="exerciseDetails.saveExercise(${exercise.id})">Zapisz zmiany</button>
          <button onclick="exerciseDetails.deleteExercise(${exercise.id})">Usuń ćwiczenie</button>
        `;
      } catch (error) {
        console.error('Błąd podczas ładowania danych ćwiczenia:', error);
        alert('Wystąpił błąd przy ładowaniu danych ćwiczenia.');
      }
    }
  
    async deleteImage(imageType) {
      const exerciseId = new URLSearchParams(window.location.search).get('id');
      if (!exerciseId) {
        alert('Nie znaleziono ćwiczenia.');
        return;
      }
  
      const confirmation = confirm('Czy na pewno chcesz usunąć to zdjęcie?');
      if (!confirmation) return;
  
      const response = await fetch(`http://localhost:3000/api/exercises/${exerciseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [imageType]: null,  // Usuwamy zdjęcie z bazy
          [`delete_${imageType}`]: imageType,  // Flaga do usunięcia zdjęcia na serwerze
        }),
      });
  
      if (response.ok) {
        alert('Zdjęcie zostało usunięte.');
        window.location.reload();  // Odświeżenie strony, aby zaktualizować dane
      } else {
        alert('Nie udało się usunąć zdjęcia.');
      }
    }
  
    async saveExercise(id) {
      // Pobieramy wartości z formularza
      const name = document.getElementById('name').value;
      const muscleGroup = document.getElementById('muscle_group').value;
      const currentWeight = document.getElementById('current_weight').value;
      const maxWeight = document.getElementById('max_weight').value;
      const maxWeightDate = document.getElementById('max_weight_date').value;
  
      // Walidacja tylko dla wymaganych pól
      if (!name || !muscleGroup) {
        alert('Nazwa ćwiczenia oraz partia mięśniowa są wymagane!');
        return;
      }
  
      // Tworzymy obiekt ćwiczenia
      const exerciseData = {
        name,
        muscle_group: muscleGroup,
        current_weight: currentWeight ? parseFloat(currentWeight) : null,
        max_weight: maxWeight ? parseFloat(maxWeight) : null,
        max_weight_date: maxWeightDate || null
      };
  
      try {
        const response = await fetch(`http://localhost:3000/api/exercises/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(exerciseData)
        });
  
        if (response.ok) {
          alert('Ćwiczenie zostało zaktualizowane.');
          window.location.reload();
        } else {
          alert('Nie udało się zaktualizować ćwiczenia.');
        }
      } catch (error) {
        console.error('Błąd podczas aktualizacji ćwiczenia:', error);
        alert('Wystąpił błąd przy aktualizacji ćwiczenia.');
      }
    }
  
    async deleteExercise(id) {
      const confirmation = confirm('Czy na pewno chcesz usunąć to ćwiczenie?');
      if (!confirmation) return;
  
      try {
        const response = await fetch(`http://localhost:3000/api/exercises/${id}`, {
          method: 'DELETE',
        });
  
        if (response.ok) {
          alert('Ćwiczenie zostało usunięte.');
          window.location.href = '/';  // Przekierowanie na stronę główną po usunięciu
        } else {
          alert('Nie udało się usunąć ćwiczenia.');
        }
      } catch (error) {
        console.error('Błąd podczas usuwania ćwiczenia:', error);
        alert('Wystąpił błąd przy usuwaniu ćwiczenia.');
      }
    }
  }
  
  // Tworzymy instancję klasy
  const exerciseDetails = new ExerciseDetails();
  