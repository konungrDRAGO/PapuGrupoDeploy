import express from 'express';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

// Enum para los formatos de mensaje (debe coincidir con tu schema.prisma)
const TipoFormato = {
  TEXTO_PLANO: 'TEXTO_PLANO',
  PAPUGRUPO: 'PAPUGRUPO',
  JSON: 'JSON'
};

const mensajeSchema = Joi.object({
  idTableroRef: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.base': 'El ID del tablero debe ser un texto.',
      'string.uuid': 'El ID del tablero debe tener formato UUID.',
      'any.required': 'El ID del tablero es obligatorio.',
    }),

  mensaje: Joi.string()
    .min(1)
    .required()
    .messages({
      'string.base': 'El mensaje debe ser un texto.',
      'string.empty': 'El mensaje no puede estar vacío.',
      'any.required': 'El mensaje es obligatorio.',
    }),

  velocidad: Joi.number()
    .min(0.1)
    .default(1.0)
    .messages({
      'number.base': 'La velocidad debe ser un número.',
      'number.min': 'La velocidad debe ser mayor que 0.',
    }),
    
  animacion: Joi.string()
    .required()
    .messages({
      'string.base': 'La animacion debe ser un texto.',
      'string.empty': 'La animacion no puede estar vacío.',
      'any.required': 'El animacion es obligatoria.'
    })
});

const atributoJsonSchema = Joi.object({
  clave: Joi.string().min(1).required().messages({
    'string.base': 'La clave del atributo debe ser un texto.',
    'string.empty': 'La clave del atributo no puede estar vacía.',
    'any.required': 'La clave del atributo es obligatoria.',
  })
});

const tableroSchema = Joi.object({
  nombreTablero: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'El nombre debe ser un texto.',
      'string.empty': 'El nombre no puede estar vacío.',
      'any.required': 'El nombre es obligatorio.',
    }),
  protocoloTablero: Joi.string()
    .min(1)
    .max(3)
    .required()
    .messages({
      'string.base': 'El protocolo debe ser un texto.',
      'string.empty': 'El protocolo no puede estar vacío.',
      'any.required': 'El protocolo es obligatorio.',
    }),
  ipTablero: Joi.string()
    .min(1)
    .max(21)
    .required()
    .messages({
      'string.base': 'La ip debe ser un texto.',
      'string.empty': 'La ip no puede estar vacío.',
      'any.required': 'La ip es obligatoria.',
    }),
  topicoTablero: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'El topico debe ser un texto.',
      'string.empty': 'El topico no puede estar vacío.',
      'any.required': 'El topico es obligatorio.',
    }),
  // Nuevo campo para el formato del mensaje
  formatoMensaje: Joi.string()
    .valid(TipoFormato.TEXTO_PLANO, TipoFormato.PAPUGRUPO, TipoFormato.JSON) // Validar con el enum
    .default(TipoFormato.TEXTO_PLANO)
    .messages({
      'any.only': 'El formato del mensaje debe ser "TEXTO_PLANO" o "JSON" o "PAPUGRUPO".',
    })
});


const updateTableroSchema = Joi.object({
  nombreTablero: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'El nombre debe ser un texto.',
      'string.empty': 'El nombre no puede estar vacío.',
      'any.required': 'El nombre es obligatorio.',
    }),
  ipTablero: Joi.string()
    .min(1)
    .max(21)
    .required()
    .messages({
      'string.base': 'La ip debe ser un texto.',
      'string.empty': 'La ip no puede estar vacío.',
      'any.required': 'La ip es obligatoria.',
    }),
  topicoTablero: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.base': 'El topico debe ser un texto.',
      'string.empty': 'El topico no puede estar vacío.',
    }),
  formatoMensaje: Joi.string()
    .valid(TipoFormato.TEXTO_PLANO, TipoFormato.PAPUGRUPO)
    .messages({
      'any.only': 'El formato del mensaje debe ser "TEXTO_PLANO" o "PAPUGRUPO".',
    })
}).min(1).messages({ // Asegura que al menos un campo se esté actualizando
  'object.min': 'Se requiere al menos un campo para actualizar el tablero.',
});


const idTableroParamSchema = Joi.object({
  idTableroRef: Joi.string()
    .uuid()
    .required()
    .messages({
      'string.base': 'El ID del tablero debe ser una cadena.',
      'string.uuid': 'El ID del tablero debe tener un formato UUID válido.',
      'any.required': 'El ID del tablero es obligatorio.',
    }),
});


router.get('/messages/:idTableroRef', async (req, res) => {
  const { error } = idTableroParamSchema.validate(req.params);
  if (error) {
    console.log(error);
    return res.status(400).json({ error: error.details[0].message });
  }

  const { idTableroRef } = req.params;

  try {
    const mensajes = await prisma.mensajes.findMany({
      where: {
        idTableroRef,
      },
      select: {
        idMensaje: true,
        mensaje: true,
        velocidad: true,
        animacion: true,
        creadoEn: true,
        Usuario: {
          select: {
            nombre: true,
          },
        },
      },
      orderBy: {
        creadoEn: 'asc',
      },
    });
    res.status(200).json(mensajes);
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    res.status(500).json({ error: 'Error al obtener los mensajes.' });
  }
});

// Ruta para obtener la lista de tableros (se agrega `formatoMensaje` y `atributosJsonTablero`)
router.get('/board-list', async (req, res) => {
  const idGrupoRef = req.token.idGrupo;

  try {
    const tableros = await prisma.tablero.findMany({
      where: {
        idGrupoRef,
      },
      select: {
        idTablero: true,
        nombreTablero: true,
        formatoMensaje: true, // Incluir el formato del mensaje
        Grupo: {
          select: {
            idGrupo: true,
            nombreGrupo: true,
          },
        },
        Mensajes: {
          select: {
            idMensaje: true,
            mensaje: true,
            velocidad: true,
            animacion: true,
            creadoEn: true,
            Usuario: {
              select: {
                nombre: true,
              },
            },
          },
          orderBy: {
            creadoEn: 'asc',
          },
        },
      },
      orderBy: {
        creadoEn: 'asc',
      },
    });
    res.status(200).json(tableros);
  } catch (error) {
    console.error('Error al obtener tableros:', error);
    res.status(500).json({ error: 'Error al obtener los tableros.' });
  }
});

router.post('/add-board', async (req, res) => {
  const { error, value } = tableroSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  const { nombreTablero, ipTablero, protocoloTablero, topicoTablero, formatoMensaje, atributosJson } = value;
  const idGrupoRef = req.token.idGrupo;

  try {
    const grupoExiste = await prisma.grupo.findUnique({
      where: { idGrupo: idGrupoRef }
    });

    if (!grupoExiste) {
      return res.status(404).json({ error: 'El grupo especificado no existe.' });
    }

    const nuevoTablero = await prisma.tablero.create({
      data: {
        idGrupoRef,
        nombreTablero,
        ipTablero,
        protocoloTablero,
        topicoTablero,
        formatoMensaje, // Guardar el formato del mensaje
      },
    });

    res.status(201).json({
      idTablero: nuevoTablero.idTablero,
      formatoMensaje: nuevoTablero.formatoMensaje,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el tablero.' });
  }
});

router.put('/update-board/:idTableroRef', async (req, res) => {
  const { error: paramError } = idTableroParamSchema.validate(req.params);
  if (paramError) {
    console.log(paramError);
    return res.status(400).json({ error: paramError.details[0].message });
  }

  const { idTableroRef } = req.params;

  const { error: bodyError, value } = updateTableroSchema.validate(req.body);
  if (bodyError) return res.status(400).json({ error: bodyError.details[0].message });

  const { nombreTablero, ipTablero, topicoTablero, formatoMensaje } = value;
  const idGrupoRef = req.token.idGrupo;

  try {
    const tableroExistente = await prisma.tablero.findUnique({
      where: {
        idTablero: idTableroRef,
        idGrupoRef: idGrupoRef,
      }
    });

    if (!tableroExistente) {
      return res.status(404).json({ error: 'El tablero no existe o no pertenece a tu grupo.' });
    }

    const datosParaActualizar = {};
    if (nombreTablero !== undefined) {
      datosParaActualizar.nombreTablero = nombreTablero;
    }
    if (ipTablero !== undefined) {
      datosParaActualizar.ipTablero = ipTablero;
    }
    if (topicoTablero !== undefined) {
      datosParaActualizar.topicoTablero = topicoTablero;
    }
    if (formatoMensaje !== undefined) {
      datosParaActualizar.formatoMensaje = formatoMensaje;
    }

    if (Object.keys(datosParaActualizar).length === 0) {
      return res.status(400).json({ error: 'No se proporcionaron datos para actualizar.' });
    }


    const tableroActualizado = await prisma.tablero.update({
      where: {
        idTablero: idTableroRef,
      },
      data: datosParaActualizar,
    });

    res.status(200).json({
      message: 'Tablero actualizado exitosamente',
      idTablero: tableroActualizado.idTablero,
      nombreTablero: tableroActualizado.nombreTablero,
      ipTablero: tableroActualizado.ipTablero,
      topicoTablero: tableroActualizado.topicoTablero,
      formatoMensaje: tableroActualizado.formatoMensaje,
    });

  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Tablero no encontrado.' });
    }
    res.status(500).json({ error: 'Error al actualizar el tablero.' });
  }
});

router.delete('/delete-board/:idTableroRef', async (req, res) => {
  const { error } = idTableroParamSchema.validate(req.params);
  if (error) {
    console.log(error);
    return res.status(400).json({ error: error.details[0].message });
  }

  const { idTableroRef } = req.params;
  const idGrupoRef = req.token.idGrupo; 

  try {
    const tableroExistente = await prisma.tablero.findUnique({
      where: {
        idTablero: idTableroRef, 
        idGrupoRef: idGrupoRef,
      },
    });

    if (!tableroExistente) {
      return res.status(404).json({ error: 'El tablero no existe o no pertenece a tu grupo.' });
    }


    await prisma.tablero.delete({
      where: {
        idTablero: idTableroRef,
      },
    });

    res.status(200).json({ message: 'Tablero eliminado exitosamente.' });

  } catch (err) {
    console.error(err);
    if (err.code === 'P2025') { 
      return res.status(404).json({ error: 'Tablero no encontrado para eliminar.' });
    }
    res.status(500).json({ error: 'Error al eliminar el tablero.' });
  }
});

router.get('/board/:idTableroRef', async (req, res) => {
  const { error } = idTableroParamSchema.validate(req.params);
  if (error) {
    console.log(error);
    return res.status(400).json({ error: error.details[0].message });
  }

  const { idTableroRef } = req.params;
  console.log(idTableroRef);
  
  try {
    const tablero = await prisma.tablero.findUnique({
      where: {
        idTablero: idTableroRef,  // Corregir a 'idTablero' en lugar de 'idTableroRef'
      },
      include: {
        Grupo: {
          select: {
            idGrupo: true,
            nombreGrupo: true,
          },
        },
        Mensajes: {
          select: {
            idMensaje: true,
            mensaje: true,
            velocidad: true,
            animacion: true,
            creadoEn: true,
            Usuario: {
              select: {
                nombre: true,
              },
            },
          },
          orderBy: {
            creadoEn: 'asc',
          },
        },
      },
    });

    if (!tablero) {
      return res.status(404).json({ error: 'Tablero no encontrado' });
    }

    res.status(200).json(tablero);
  } catch (error) {
    console.error('Error al obtener tablero:', error);
    res.status(500).json({ error: 'Error al obtener información del tablero' });
  }
});

router.post('/save-message', async (req, res) => {
  console.log(req.body);
  const { error } = mensajeSchema.validate(req.body);

  if (error) return res.status(400).json({ error: error.details[0].message });

  const { idTableroRef, mensaje, velocidad, animacion } = req.body;

  const idUsuarioRef = req.token.idUsuario;

  try {
    // Validar que el tablero existe
    const tableroExiste = await prisma.tablero.findUnique({
      where: { idTablero: idTableroRef }
    });

    console.log(tableroExiste)

    if (!tableroExiste) {
      return res.status(404).json({ error: 'El tablero especificado no existe.' });
    }

    // Validar que el usuario existe
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { idUsuario: idUsuarioRef }
    });

    if (!usuarioExiste) {
      return res.status(404).json({ error: 'El usuario especificado no existe.' });
    }

    const nuevoMensaje = await prisma.mensajes.create({
      data: {
        mensaje,
        idTableroRef,
        idUsuarioRef,
        velocidad,
        animacion
      },
    });

    res.status(201).json({
      idMensaje: nuevoMensaje.idMensaje,
      mensaje: nuevoMensaje.mensaje,
      animacion: nuevoMensaje.animacion,
      velocidad: nuevoMensaje.velocidad
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el mensaje.' });
  }
});

router.post('/save-message-JSON', async (req, res) => {

  try {
    console.log(req.body);
    const { idTableroRef } = req.body;
    const idUsuarioRef = req.token.idUsuario;
    // Validar que el tablero existe
    const tableroExiste = await prisma.tablero.findUnique({
      where: { idTablero: idTableroRef }
    });

    console.log(tableroExiste)

    if (!tableroExiste) {
      return res.status(404).json({ error: 'El tablero especificado no existe.' });
    }

    // Validar que el usuario existe
    const usuarioExiste = await prisma.usuario.findUnique({
      where: { idUsuario: idUsuarioRef }
    });

    if (!usuarioExiste) {
      return res.status(404).json({ error: 'El usuario especificado no existe.' });
    }
    

    // Clonar req.body y eliminar la clave idTableroRef antes de guardar
    const mensajeObj = { ...req.body };
    delete mensajeObj.idTableroRef;

    const mensajeString = JSON.stringify(mensajeObj);

    const nuevoMensaje = await prisma.mensajes.create({
      data: {
      mensaje: mensajeString,
      idTableroRef,
      idUsuarioRef
      },
    });

    res.status(201).json({
      mensaje: req.body,
      idTableroRef,
      idUsuarioRef
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear el mensaje.' });
  }
});

export default router;
