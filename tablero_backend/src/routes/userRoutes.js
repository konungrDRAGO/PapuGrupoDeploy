import express from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { generateToken } from '../utils/generateToken.js';

const router = express.Router();
const prisma = new PrismaClient();

const grupoSchema = Joi.object({
  nombreGrupo: Joi.string().min(1).required()
});

const asignarGrupoSchema = Joi.object({
  idGrupo: Joi.string().uuid().required(),
});

router.post('/add-group', async (req, res) => {
  const { error, value } = grupoSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { nombreGrupo } = value;

  const idUsuario = req.token.idUsuario;

  try {
    const nuevoGrupo = await prisma.grupo.create({
      data: {
        nombreGrupo,
        creadoPor: idUsuario,
      },
    });

    const response = {
      idGrupo: nuevoGrupo.idGrupo,
      nombreGrupo: nuevoGrupo.nombreGrupo
    }

    res.status(201).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear grupo.' });
  }
});

router.get('/group-list', async (req, res) => {
  try {
    const grupos = await prisma.grupo.findMany({
      select: {
        idGrupo: true,
        nombreGrupo: true,
        Usuario: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        creadoEn: 'desc',
      },
    });
    res.status(200).json(grupos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener grupos.' });
  }
});

router.put('/assign-group', async (req, res) => {
  const { error, value } = asignarGrupoSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { idGrupo } = value;

  const idUsuario = req.token.idUsuario;

  try {
    const usuarioActualizado = await prisma.usuario.update({
      where: { idUsuario },
      data: { idGrupoRef: idGrupo },
    });

    res.status(200).json({ token: generateToken(idUsuario, idGrupo), "mensaje": "Asignación de grupo exitosa. Debes reemplazar el token." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al asignar grupo al usuario.' });
  }
});

router.get('/user-info', async (req, res) => {
  try {
    // Obtener el ID del usuario desde el token (verificado por el middleware de auth)
    const idUsuario = req.token.idUsuario;

    if (!idUsuario) {
      return res.status(401).json({ error: 'No autorizado. Token inválido.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: {
        idUsuario
      },
      select: {
        idUsuario: true,
        nombre: true,
        correo: true,
        telefono: true,
        idGrupoRef: true,
        verificado: true,
        creadoEn: true,
        grupos: {
          select: {
            idGrupo: true,
            nombreGrupo: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    let grupoAsignado = null;
    if (usuario.idGrupoRef) {
      grupoAsignado = await prisma.grupo.findUnique({
        where: {
          idGrupo: usuario.idGrupoRef
        },
        select: {
          idGrupo: true,
          nombreGrupo: true
        }
      });
    }

    res.status(200).json({
      ...usuario,
      grupoAsignado
    });

  } catch (err) {
    console.error('Error al obtener información del usuario:', err);
    res.status(500).json({ error: 'Error al obtener información del usuario.' });
  }
});

export default router;