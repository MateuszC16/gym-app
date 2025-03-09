import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Pobierz token z nagłówka

  if (!token) {
    return res.status(403).json({ error: 'Brak tokenu autoryzacyjnego' });
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');  // Użyj odpowiedniego klucza
    req.user = { userId: decoded.userId };  // Zakładam, że 'userId' jest zapisane w payload
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Błąd autoryzacji' });
  }
};
