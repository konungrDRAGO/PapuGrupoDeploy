const ensureJson = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.headers['content-type'] !== 'application/json') {
        return res.status(415).json({ message: 'Tipo de contenido no soportado. Usa application/json.' });
      }
    next();
};

export default ensureJson;