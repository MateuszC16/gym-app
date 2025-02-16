import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';  // Importujemy metody do obsługi ścieżek
import exercisesRouter from './api/exercises.js';
import trainingDaysRouter from './api/training-days.js';

// Ustalamy __dirname (ponieważ w trybie ESM nie jest dostępne)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Umożliwiamy CORS
app.use(cors());

// Umożliwiamy obsługę JSON w ciałach żądań
app.use(express.json());

// Ścieżka do folderu 'uploads' (gdzie trzymane będą pliki statyczne, takie jak zdjęcia)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Użycie routerów
app.use('/api/exercises', exercisesRouter);
app.use('/api/training-days', trainingDaysRouter);

// Nasłuchiwanie na porcie 3000
app.listen(3000, () => {
  console.log('Serwer działa na porcie 3000');
});
