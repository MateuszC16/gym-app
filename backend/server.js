import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import multer from 'multer';
import pkg from 'pg';
import fs from 'fs';

const { Client } = pkg;

// Ustawienia __dirname dla modułów ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Umożliwiamy CORS
app.use(cors());

// Umożliwiamy obsługę JSON w ciałach żądań
app.use(express.json());

// Konfiguracja Multera - oczekiwanie na pola 'imageOne' i 'imageTwo'
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

// Obsługuje dwa pliki 'imageOne' i 'imageTwo'
const upload = multer({ 
  storage: storage, 
  fields: [
    { name: 'imageOne', maxCount: 1 }, 
    { name: 'imageTwo', maxCount: 1 }
  ]
});

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

// Endpoint do dodawania ćwiczenia
app.post('/api/exercises', upload.array('images', 2), async (req, res) => {
  const { name, muscleGroup, currentWeight, maxWeight, maxWeightDate } = req.body;
  const images = req.files;  // Pliki przesyłane przez multer

  // Logowanie formularza
  console.log('Form data:', { name, muscleGroup, currentWeight, maxWeight, maxWeightDate });
  console.log('Files:', images);

  // Jeśli maxWeight jest "null", zamień to na wartość null
  const parsedMaxWeight = (maxWeight === 'null' || maxWeight === '') ? null : parseFloat(maxWeight);

  // Jeśli maxWeightDate jest "null", ustaw na null
  const parsedMaxWeightDate = (maxWeightDate === 'null' || maxWeightDate === '') ? null : new Date(maxWeightDate);

  // Przypisujemy ścieżki do zdjęć (jeśli istnieją)
  const imageOnePath = images && images['imageOne'] ? `/uploads/${images['imageOne'][0].filename}` : null;
  const imageTwoPath = images && images['imageTwo'] ? `/uploads/${images['imageTwo'][0].filename}` : null;

  // Sztywno ustawiony user_id (na razie)
  const userId = 1; // Zastąp to dynamicznie, gdy zaimplementujesz sesję użytkownika

  console.log('imageOnePath:', imageOnePath);
  console.log('imageTwoPath:', imageTwoPath);
  console.log('Parsed Max Weight:', parsedMaxWeight);
  console.log('Parsed Max Weight Date:', parsedMaxWeightDate);

  try {
    // Zapytanie SQL do dodania ćwiczenia, w tym daty maxWeightDate
    const result = await client.query(
      'INSERT INTO exercises(name, muscle_group, current_weight, max_weight, max_weight_date, image_one, image_two, user_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [name, muscleGroup, currentWeight, parsedMaxWeight, parsedMaxWeightDate, imageOnePath, imageTwoPath, userId]
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

// Endpoint do pobierania ćwiczenia po ID
app.get('/api/exercises/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client.query('SELECT * FROM exercises WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ćwiczenie o podanym ID nie zostało znalezione' });
    }

    res.json(result.rows[0]);  // Zwracamy dane ćwiczenia
  } catch (err) {
    console.error('Błąd przy pobieraniu ćwiczenia:', err);
    res.status(500).json({ error: 'Błąd przy pobieraniu ćwiczenia' });
  }
});
app.put('/api/exercises/:id', upload.array('images', 2), async (req, res) => {
  const { name, muscleGroup, currentWeight, maxWeight, maxWeightDate } = req.body;
  const images = req.files;

  // Jeśli maxWeight lub currentWeight są pustymi ciągami, przypisz NULL
  const parsedCurrentWeight = currentWeight === '' || currentWeight === null ? null : parseFloat(currentWeight);
  const parsedMaxWeight = maxWeight === '' || maxWeight === null ? null : parseFloat(maxWeight);
  const parsedMaxWeightDate = maxWeightDate === '' || maxWeightDate === null ? null : new Date(maxWeightDate);

  // Jeżeli nie ma nowych zdjęć, pozostawiamy stare zdjęcia
  const imageOnePath = images && images['imageOne'] ? `/uploads/${images['imageOne'][0].filename}` : req.body.imageOne || null;
  const imageTwoPath = images && images['imageTwo'] ? `/uploads/${images['imageTwo'][0].filename}` : req.body.imageTwo || null;

  try {
    const result = await client.query(
      `UPDATE exercises SET name = $1, muscle_group = $2, current_weight = $3, max_weight = $4, 
      max_weight_date = $5, 
      image_one = COALESCE($6, image_one), image_two = COALESCE($7, image_two) 
      WHERE id = $8 RETURNING *`,
      [
        name, 
        muscleGroup, 
        parsedCurrentWeight,  // Zmienione na parsedCurrentWeight
        parsedMaxWeight,      // Zmienione na parsedMaxWeight
        parsedMaxWeightDate,  // Zmienione na parsedMaxWeightDate
        imageOnePath, 
        imageTwoPath, 
        req.params.id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ćwiczenie o podanym ID nie zostało znalezione' });
    }

    res.json(result.rows[0]);  // Zwracamy zaktualizowane ćwiczenie
  } catch (err) {
    console.error('Błąd przy edytowaniu ćwiczenia:', err);
    res.status(500).json({ error: 'Błąd przy edytowaniu ćwiczenia' });
  }
});


// Endpoint do usuwania ćwiczeń
app.delete('/api/exercises/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Pobieranie ćwiczenia z bazy danych, aby uzyskać ścieżki do zdjęć
    const result = await client.query('SELECT * FROM exercises WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ćwiczenie o podanym ID nie zostało znalezione' });
    }

    const exercise = result.rows[0];
    const imageOnePath = exercise.image_one ? path.join(__dirname, 'uploads', exercise.image_one.split('/').pop()) : null;
    const imageTwoPath = exercise.image_two ? path.join(__dirname, 'uploads', exercise.image_two.split('/').pop()) : null;

    // Usuwamy zdjęcia z folderu, jeśli istnieją
    if (imageOnePath && fs.existsSync(imageOnePath)) {
      fs.unlink(imageOnePath, (err) => {
        if (err) {
          console.error(`Błąd przy usuwaniu zdjęcia ${imageOnePath}:`, err);
        } else {
          console.log(`Usunięto zdjęcie: ${imageOnePath}`);
        }
      });
    }

    if (imageTwoPath && fs.existsSync(imageTwoPath)) {
      fs.unlink(imageTwoPath, (err) => {
        if (err) {
          console.error(`Błąd przy usuwaniu zdjęcia ${imageTwoPath}:`, err);
        } else {
          console.log(`Usunięto zdjęcie: ${imageTwoPath}`);
        }
      });
    }

    // Usuwanie ćwiczenia z bazy
    await client.query('DELETE FROM exercises WHERE id = $1', [id]);

    res.json({ message: 'Ćwiczenie zostało pomyślnie usunięte' });
  } catch (err) {
    console.error('Błąd przy usuwaniu ćwiczenia:', err);
    res.status(500).json({ error: 'Błąd przy usuwaniu ćwiczenia' });
  }
});

// Udostępnienie folderu uploads/ do publicznego dostępu
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serwer nasłuchuje na porcie 3000
app.listen(3000, () => {
  console.log('Serwer działa na porcie 3000');
});
