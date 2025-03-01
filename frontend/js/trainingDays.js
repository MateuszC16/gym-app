let trainingDays = []; // Store all training days

function openEditModal(trainingDayId) {
  const modal = document.getElementById('editTrainingDayModal');
  const form = document.getElementById('editTrainingDayForm');
  
  const trainingDay = trainingDays.find(day => day.id === trainingDayId);

  // ...existing code...

  const descriptionInput = form.querySelector('textarea[name="description"]');
  descriptionInput.value = trainingDay.associativeDescription || ''; // Use associative entity description

  // ...existing code...

  modal.style.display = 'flex';
}

function saveTrainingDay(trainingDayId) {
  const form = document.getElementById('editTrainingDayForm');
  
  const trainingDay = trainingDays.find(day => day.id === trainingDayId);

  // ...existing code...

  const description = form.querySelector('textarea[name="description"]').value;
  if (description) {
    trainingDay.associativeDescription = description; // Save to associative entity
  }

  // ...existing code...

  closeEditModal();
}

function loadTrainingDays(data) {
  trainingDays = data; // Load all training days data
}

// ...existing code...
