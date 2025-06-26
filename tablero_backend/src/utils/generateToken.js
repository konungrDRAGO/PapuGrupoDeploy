import jwt from 'jsonwebtoken';

export const generateToken = (userId,grupoId) => {
  return jwt.sign({ idUsuario: userId, idGrupo: grupoId }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
};
