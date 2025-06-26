import express from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

const registrarUbicacionSchema = Joi.object({
  idMascota: Joi.string().required(),
  latitud: Joi.number().min(-90).max(90).required(),
  longitud: Joi.number().min(-180).max(180).required(),
  nombreReportante: Joi.string().allow(null, '').optional(),
  comentario: Joi.string().allow(null, '').optional(),
});

router.get('/pet/:id', async (req, res) => {
  const id = req.params.id;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de mascota inválido' });
  }

  try {
    const mascota = await prisma.mascota.findUnique({
      where: { idMascota: id },
      include: {
        cliente: {
          select: {
            nombre: true,
            telefono: true
          }
        }
      }
    });

    if (!mascota) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    // Verificar si la mascota tiene cliente asociado
    if (!mascota.cliente) {
      return res.status(404).json({ error: 'Dueño no encontrado para esta mascota' });
    }

    res.json({
      nombre: mascota.nombre,
      raza: mascota.raza,
      urlFoto: mascota.urlFoto || '',
      fechaNacimiento: mascota.fechaNacimiento,
      nombreDueno: mascota.cliente.nombre,
      telefonoDueno: mascota.cliente.telefono

    });

  } catch (error) {
    console.error('Error al obtener la mascota:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.post('/registrar-ubicacion', async (req, res) => {
  const { error } = registrarUbicacionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { idMascota, latitud, longitud, nombreReportante, comentario } = req.body;

  try {
    const mascota = await prisma.mascota.findUnique({
      where: { idMascota }
    });

    if (!mascota) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    const ubicacion = await prisma.ubicacion.create({
      data: {
        idMascota,
        latitud,
        longitud,
        nombreReportante: nombreReportante || null,
        comentario: comentario || null
      }
    });

    res.json({ message: 'Ubicación registrada exitosamente', ubicacion });
  } catch (error) {
    console.error('Error al registrar ubicación:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});


export default router;