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
app.use(cors({
    origin: 'http://127.0.0.1:5500', // Adjust the origin to match your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true, // Ensure credentials like cookies/sessions are supported
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true in production (when using HTTPS)
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/exercises', exercisesRouter);
app.use('/api/training-days', trainingDaysRouter);
app.use('/api', userSessionRouter);

app.get('/', (req, res) => {
    console.log('Root endpoint hit');
    res.send('Serwer działa!');
});

app.listen(3000, () => {
    console.log('Serwer działa na porcie 3000');
});
