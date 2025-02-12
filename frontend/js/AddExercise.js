document.getElementById('exercise-form').addEventListener('submit', async function(event) {
    event.preventDefault();  // Zapobiegamy domyślnemu wysyłaniu formularza (przeładowaniu strony)
  
    const name = document.getElementById('name').value;
    const muscleGroup = document.getElementById('muscle-group').value;
    const currentWeight = parseFloat(document.getElementById('current-weight').value);
    const maxWeight = parseFloat(document.getElementById('max-weight').value);
    const images = document.getElementById('images').files;  // Pobieramy pliki
  
    // Logowanie formularza
    console.log('Form data:', { name, muscleGroup, currentWeight, maxWeight });
    console.log('Files:', images);
  
    // Tworzymy FormData
    const formData = new FormData();
    formData.append('name', name);
    formData.append('muscleGroup', muscleGroup);
    formData.append('currentWeight', currentWeight);
    formData.append('maxWeight', maxWeight);
  
    // Jeśli zdjęcia zostały dodane, dodajemy je do formData
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }
  
    // Wysyłamy dane do backendu
    const response = await fetch('http://localhost:3000/api/exercises', {
      method: 'POST',
      body: formData
    });
  
    if (response.ok) {
      const newExercise = await response.json();
      alert('Ćwiczenie zostało dodane!');
    } else {
      console.error('Błąd przy dodawaniu ćwiczenia');
    }
  });
  