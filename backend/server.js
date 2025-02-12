import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import multer from 'multer';
import pkg from 'pg';

const { Client } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Umożliwiamy CORS
app.use(cors());

// Umożliwiamy obsługę JSON w ciałach żądań
app.use(express.json());

// Ustawienia multer do przesyłania zdjęć
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Folder, w którym będą przechowywane zdjęcia
  },
  filename: (req, file, cb) => {
    const userId = req.body.userId || 'unknown_user';  // Identyfikator użytkownika (jeśli dostępne)
    const exerciseName = req.body.name || 'exercise';  // Nazwa ćwiczenia
    const timestamp = Date.now();  // Znacznik czasu
    const fileExtension = path.extname(file.originalname);  // Rozszerzenie pliku (.jpg, .png, itp.)
    const filename = `${userId}_${exerciseName}_${timestamp}${fileExtension}`; // Unikalna nazwa pliku
    cb(null, filename);  // Ustalamy unikalną nazwę pliku
  }
});

const upload = multer({ storage: storage });

// Połączenie z bazą danych PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'gym_app',
  password: 'admin',
  port: 5432,
});

client.connect()
  .then(() => {
    console.log('Połączono z bazą danych PostgreSQL');
  })
  .catch(err => {
    console.error('Błąd połączenia z bazą:', err);
  });


  
  app.post('/api/exercises', upload.array('images', 2), async (req, res) => {
    const { name, muscleGroup, currentWeight, maxWeight, userId } = req.body;
    const images = req.files;  // Pliki przesyłane przez multer
  
    // Logowanie danych przychodzących
    console.log('Received exercise data:', req.body);  // Sprawdzamy dane ćwiczenia
    console.log('Received files:', images);  // Sprawdzamy przesłane zdjęcia
  
    // Przypisujemy ścieżki do zdjęć (jeśli istnieją)
    const imageOnePath = images && images[0] ? `/uploads/${images[0].filename}` : null;
    const imageTwoPath = images && images[1] ? `/uploads/${images[1].filename}` : null;
  
    console.log('imageOnePath:', imageOnePath);
    console.log('imageTwoPath:', imageTwoPath);
  
    try {
      // Zapytanie SQL do dodania ćwiczenia, w tym ścieżek do zdjęć (mogą być NULL)
      const result = await client.query(
        'INSERT INTO exercises(name, muscle_group, current_weight, max_weight, image_one, image_two, user_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [name, muscleGroup, currentWeight, maxWeight, imageOnePath, imageTwoPath, userId]
      );
  
      res.json(result.rows[0]);  // Zwracamy dodane ćwiczenie
    } catch (err) {
      console.error('Błąd przy dodawaniu ćwiczenia:', err);  // Logowanie błędów serwera
      res.status(500).json({ error: 'Błąd przy dodawaniu ćwiczenia' });
    }
  });
  
  
  

// Endpoint do pobierania ćwiczeń
app.get('/api/exercises', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM exercises');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Błąd przy pobieraniu ćwiczeń z bazy danych' });
  }
});

// Udostępnienie folderu `uploads/` do publicznego dostępu
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serwer nasłuchuje na porcie 3000
app.listen(3000, () => {
  console.log('Backend działa na http://localhost:3000');
});
