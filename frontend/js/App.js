class App {
  constructor() {
    this.exerciseList = new ExerciseList(); // Przekazujemy nową instancję ExerciseList
    this.addEventListeners();
  }

  // Funkcja do obsługi formularza
  addEventListeners() {
    // Może dodać eventy globalne, ale nie specyficzne dla ćwiczeń
  }
}

// Tworzymy instancję aplikacji
const app = new App();
