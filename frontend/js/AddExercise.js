document.getElementById('exercise-form').addEventListener('submit', async function(event) {
    event.preventDefault();  // Zapobiegamy domyślnemu wysyłaniu formularza (przeładowaniu strony)
  
    const name = document.getElementById('name').value;
    const muscleGroup = document.getElementById('muscle-group').value;
    const currentWeight = parseFloat(document.getElementById('current-weight').value);
    const maxWeight = document.getElementById('max-weight').value ? parseFloat(document.getElementById('max-weight').value) : null;
    
    // Pobieramy datę maksymalnego ciężaru i sprawdzamy, czy jest pusta
    const maxWeightDate = document.getElementById('max-weight-date').value.trim();
    const validMaxWeightDate = maxWeightDate !== "" ? maxWeightDate : null;  // Ustawiamy null, jeśli data jest pusta
  
    const images = document.getElementById('images').files;  // Pobieramy pliki
  
    // Logowanie formularza
    console.log('Form data:', { name, muscleGroup, currentWeight, maxWeight, validMaxWeightDate });
    console.log('Files:', images);
  
    // Tworzymy FormData
    const formData = new FormData();
    formData.append('name', name);
    formData.append('muscleGroup', muscleGroup);
    formData.append('currentWeight', currentWeight);
    formData.append('maxWeight', maxWeight);  // Możemy wysłać null, jeśli brak
    formData.append('maxWeightDate', validMaxWeightDate);  // Dodajemy datę maksymalnego ciężaru, lub null jeśli pusta
  
    // Jeśli zdjęcia zostały dodane, dodajemy je do formData
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }
  
    // Wysyłamy dane do backendu
    try {
      const response = await fetch('http://localhost:3000/api/exercises', {
        method: 'POST',
        body: formData
      });
  
      if (response.ok) {
        const newExercise = await response.json();
        alert('Ćwiczenie zostało dodane!');
        // Można tu wywołać funkcję do odświeżenia listy ćwiczeń
      } else {
        throw new Error('Błąd serwera');
      }
    } catch (error) {
      alert('Wystąpił błąd: ' + error.message);
      console.error(error);
    }
  });
  