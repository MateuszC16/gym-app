document.getElementById('exercise-form').addEventListener('submit', async function(event) {
  event.preventDefault();  // Zapobiegamy domyślnemu wysyłaniu formularza (przeładowaniu strony)

  const name = document.getElementById('name').value;
  const muscleGroup = document.getElementById('muscle-group').value;
  const currentWeight = parseFloat(document.getElementById('current-weight').value);
  const maxWeight = document.getElementById('max-weight').value ? parseFloat(document.getElementById('max-weight').value) : null;
  
  // Pobieramy datę maksymalnego ciężaru i sprawdzamy, czy jest pusta
  const maxWeightDate = document.getElementById('max-weight-date').value.trim();
  const validMaxWeightDate = maxWeightDate !== "" ? maxWeightDate : null;  // Ustawiamy null, jeśli data jest pusta

  // Pobieramy opis ćwiczenia
  const description = document.getElementById('description').value;

  // Tworzymy FormData
  const formData = new FormData();
  formData.append('name', name);
  formData.append('muscleGroup', muscleGroup);
  formData.append('currentWeight', currentWeight);
  formData.append('maxWeight', maxWeight);  // Możemy wysłać null, jeśli brak
  formData.append('maxWeightDate', validMaxWeightDate);  // Dodajemy datę maksymalnego ciężaru, lub null jeśli pusta
  formData.append('description', description);  // Dodajemy opis ćwiczenia

  // Wysyłamy dane do backendu
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(window.SERVER_URL+'api/exercises', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
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
