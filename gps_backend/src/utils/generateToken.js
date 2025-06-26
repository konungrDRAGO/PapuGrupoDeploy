import jwt from 'jsonwebtoken';

export const generateToken = (userId) => {
  return jwt.sign({ idCliente: userId }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  });
};
