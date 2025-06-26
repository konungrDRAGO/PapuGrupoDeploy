import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.headers['content-type'] !== 'application/json') {
    return res.status(415).json({ message: 'Tipo de contenido no soportado. Usa application/json.' });
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido o mal formado' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expirado' });
      }
      return res.status(405).json({ error: 'Token inválido' });
    }
    if(!decoded.idGrupo){
      return res.status(403).json({ error: 'Usuario sin grupo asignado' });
    }

    req.token = decoded;
    next();
  });
};