class WorkoutDay {
    constructor(date, exercises = []) {
      this.date = date;
      this.exercises = exercises;  // Tablica ćwiczeń
    }
  
    // Funkcja do renderowania dnia treningowego
    render() {
      const workoutDayContainer = document.createElement('div');
      workoutDayContainer.classList.add('workout-day');
      workoutDayContainer.innerHTML = `<h2>Workout Day: ${this.date}</h2>`;
  
      // Renderujemy ćwiczenia
      this.exercises.forEach(exercise => {
        workoutDayContainer.appendChild(exercise.render());
      });
  
      return workoutDayContainer;
    }
  }
  
  export default WorkoutDay;  // Eksportujemy klasę WorkoutDay
  