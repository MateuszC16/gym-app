class App {
  constructor() {
    this.addEventListeners();
  }

  // Funkcja do dodawania ćwiczenia
  async addExercise(event) {
    event.preventDefault();  // Zapobiegamy domyślnemu wysyłaniu formularza

    // Pobieramy dane z formularza
    const name = document.getElementById('name').value;
    const muscleGroup = document.getElementById('muscle-group').value;
    const currentWeight = parseFloat(document.getElementById('current-weight').value);
    const maxWeight = parseFloat(document.getElementById('max-weight').value);
    const images = document.getElementById('images').files;

    // Tworzymy obiekt FormData do przesyłania danych w formularzu
    const formData = new FormData();
    formData.append('name', name);
    formData.append('muscleGroup', muscleGroup);
    formData.append('currentWeight', currentWeight);
    formData.append('maxWeight', maxWeight);

    // Dodajemy zdjęcia do FormData (jeśli są)
    for (let i = 0; i < images.length; i++) {
      formData.append('images', images[i]);
    }

    // Wysyłamy dane do backendu
    const response = await fetch('http://localhost:3000/api/exercises', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const newExercise = await response.json();
      console.log('Dodano ćwiczenie:', newExercise);
    } else {
      console.error('Błąd przy dodawaniu ćwiczenia');
    }
  }

  // Funkcja do obsługi formularza
  addEventListeners() {
    document.getElementById('exercise-form').addEventListener('submit', this.addExercise);
  }
}

// Inicjalizujemy aplikację
const app = new App();
