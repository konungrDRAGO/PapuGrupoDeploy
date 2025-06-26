import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/authMiddleware.js'; 
import Joi from 'joi';
import { parseFecha } from '../utils/functions.js';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await prisma.cliente.findUnique({
      where: { correo: email, idCliente: req.token.idCliente },
      select: {
        correo: true,
        nombre: true,
        direccion: true,
        telefono: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const response = {
      ...user,
    };
    res.json(user);
  } catch (error) {
    console.error('Error al obtener los datos del usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/:email', authenticateToken, async (req, res) => {
  try {
    const { email } = req.params;
    const { nombre, direccion, telefono } = req.body; 

    const usuarioActualizado = await prisma.cliente.update({
      where: { 
        correo: email,
        idCliente: req.token.idCliente 
      },
      data: {
        nombre,
        direccion,
        telefono
      },
    });

    const response = {
      ...usuarioActualizado,
    };

    res.json(response);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

export default router;