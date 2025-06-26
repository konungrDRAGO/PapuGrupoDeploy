import express from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { parseFecha } from '../utils/functions.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
const prisma = new PrismaClient();

const itemMascotaSchema = Joi.object({
  nombre: Joi.string().min(2).required(),
  especie: Joi.string().min(2).required(),
  raza: Joi.string().min(2).required(),
  sexo: Joi.string().min(2).required(),
  fechaNacimiento: Joi.string().required(),

  color: Joi.string().allow('').optional(),
  tamano: Joi.string().allow('').optional(),
  esterilizado: Joi.boolean().optional(),
  numeroMicrochip: Joi.string().allow('').optional(),
  fechaMicrochip: Joi.string().allow('').optional(),
  vacunasAlDia: Joi.boolean().optional(),
  fechaDesparasitacion: Joi.string().allow('').optional(),
  condicionesMedicas: Joi.string().allow('').optional(),
  nombreVeterinario: Joi.string().allow('').optional(),
  telefonoVeterinario: Joi.string().allow('').optional(),
  comportamiento: Joi.string().allow('').optional(),
  observaciones: Joi.string().allow('').optional(),

  urlFoto: Joi.string()
    .pattern(/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/)
    .allow('')
    .optional()
});

// Esquema completo del body
const registrarMascotaSchema = Joi.object({
  mascotas: Joi.array().items(itemMascotaSchema).min(1).required()
});


router.post('/pet-registration', async (req, res) => {

  // Validación de schema
  const { error } = registrarMascotaSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const idCliente = req.token.idCliente;
  const { mascotas } = req.body;

  const mascotasCreadas = await prisma.mascota.createMany({
    data: mascotas.map(mascota => ({
      ...mascota,
      fechaNacimiento: mascota.fechaNacimiento,
      fechaMicrochip: mascota.fechaMicrochip ? mascota.fechaMicrochip : null,
      fechaDesparasitacion: mascota.fechaDesparasitacion ? mascota.fechaDesparasitacion : null,
      idClienteRef: idCliente,
    })),
    skipDuplicates: true,
  });

  const mascotasGuardadas = await prisma.mascota.findMany({
    where: {
      idClienteRef: idCliente,
      nombre: {
        in: mascotas.map(m => m.nombre),
      },
    },
    select: {
      idMascota: true,
      nombre: true,
    }
  });

  res.json({ mascotas: mascotasGuardadas });

});

router.get('/pet-info/:id', async (req, res) => {
  const id = req.params.id;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'ID de mascota inválido' });
  }

  const idCliente = req.token.idCliente;

  try {
    const mascota = await prisma.mascota.findUnique({
      where: { idMascota: id, idClienteRef: idCliente   },
      select: {
        nombre: true,
        especie: true,
        raza: true,
        sexo:true,
        fechaNacimiento: true,
        color:true,
        tamano:true,
        esterilizado:true,
        numeroMicrochip:true,
        fechaMicrochip:true,
        urlFoto: true,
        vacunasAlDia:true,
        fechaDesparasitacion:true,
        condicionesMedicas:true,
        nombreVeterinario:true,
        telefonoVeterinario:true,
        comportamiento:true,
        observaciones: true
      },
    });

    if (!mascota) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    res.json(mascota);
  } catch (error) {
    console.error('Error al obtener la mascota:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/mis-mascotas',authenticateToken, async (req, res) => {
  try {
    const idCliente = req.token.idCliente;
    
    const mascotas = await prisma.mascota.findMany({
      where: { idClienteRef: idCliente },
      select: {
        idMascota: true,
        nombre: true,
        especie: true,
        raza: true,
        urlFoto: true,
      },
    });
    res.json({ mascotas });
  } catch (error) {
    console.error('Error al obtener las mascotas del cliente:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/pet-location/:idMascota', async (req, res) => {
  const { idMascota } = req.params;

  if (!idMascota || typeof idMascota !== 'string') {
    return res.status(400).json({ error: 'ID de mascota inválido' });
  }

  const idCliente = req.token.idCliente;

  try {
    // Validar que la mascota pertenezca al cliente autenticado
    const mascota = await prisma.mascota.findFirst({
      where: {
        idMascota,
        idClienteRef: idCliente
      }
    });

    if (!mascota) {
      return res.status(403).json({ error: 'No tienes acceso a esta mascota o no existe' });
    }

    const ubicaciones = await prisma.ubicacion.findMany({
      where: { idMascota },
      orderBy: { fecha: 'desc' }, // opcional: ordena por fecha descendente
      select: {
        idUbicacion: true,
        latitud: true,
        longitud: true,
        fecha: true,
        nombreReportante: true,
        comentario: true
      }
    });

    res.json({ ubicaciones });
  } catch (error) {
    console.error('Error al obtener las ubicaciones:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.put('/actualizar-mascota/:id', async (req, res) => {
  const id = req.params.id;
  const idCliente = req.token.idCliente;
  const datosActualizados = req.body;

  try {
    // Validar existencia de mascota
    const mascotaExistente = await prisma.mascota.findFirst({
      where: { idMascota: id, idClienteRef: idCliente }
    });

    if (!mascotaExistente) {
      return res.status(404).json({ error: 'Mascota no encontrada' });
    }

    // Validar datos (todos los campos string vacíos son válidos)
    const { error } = itemMascotaSchema.validate(datosActualizados);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    // Preparar datos para Prisma (convertir strings vacíos a null)
    const datosParaPrisma = {
      ...datosActualizados,
      // Convertir strings vacíos a null para campos opcionales
      color: datosActualizados.color || null,
      tamano: datosActualizados.tamano || null,
      numeroMicrochip: datosActualizados.numeroMicrochip || null,
      condicionesMedicas: datosActualizados.condicionesMedicas || null,
      nombreVeterinario: datosActualizados.nombreVeterinario || null,
      telefonoVeterinario: datosActualizados.telefonoVeterinario || null,
      comportamiento: datosActualizados.comportamiento || null,
      observaciones: datosActualizados.observaciones || null,
      urlFoto: datosActualizados.urlFoto || null,
      // Manejo de fechas
      fechaNacimiento: datosActualizados.fechaNacimiento 
        ? new Date(datosActualizados.fechaNacimiento) 
        : null,
      fechaMicrochip: datosActualizados.fechaMicrochip 
        ? new Date(datosActualizados.fechaMicrochip) 
        : null,
      fechaDesparasitacion: datosActualizados.fechaDesparasitacion 
        ? new Date(datosActualizados.fechaDesparasitacion) 
        : null
    };

    const mascotaActualizada = await prisma.mascota.update({
      where: { idMascota: id },
      data: datosParaPrisma
    });

    res.json(mascotaActualizada);
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    res.status(500).json({ error: 'Error del servidor' });
  }
});




export default router;
