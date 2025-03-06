import express from 'express';
import path from 'path';
import cors from 'cors';
import session from 'express-session';
import bodyParser from 'body-parser';
import exercisesRouter from './api/exercises.js';
import trainingDaysRouter from './api/training-days.js';
import userSessionRouter from './api/user-session.js';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const app = express();

// Umożliwiamy CORS
app.use(cors());

// Umożliwiamy obsługę JSON w ciałach żądań
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Ścieżka do folderu 'uploads' (zdjęcia)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Użycie routerów
app.use('/api/exercises', exercisesRouter);
app.use('/api/training-days', trainingDaysRouter);
app.use('/api', userSessionRouter);

app.get('/', (req, res) => {
  res.send('Serwer działa!');
})

// Nasłuchiwanie na porcie 3000
app.listen(3000, () => {
  console.log('Serwer działa na porcie 3000');
});
