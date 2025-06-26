import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/generateToken.js';
import Joi from 'joi';
import { sendCodeEmail } from '../utils/sendMail.js';

const router = express.Router();
const prisma = new PrismaClient();

const code_request_schema = Joi.object({
    email: Joi.string().email().required()
  });

const code_verify_schema = Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().pattern(/^\d{6}$/).required().messages({
        'string.pattern.base': 'El código debe tener exactamente 6 dígitos numéricos.',
        'any.required': 'El campo code es obligatorio.',
      })
});

const user_registration_schema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'El correo electrónico no es válido.'}),
    nombre: Joi.string().required().messages({
        'string.empty': 'El campo nombre no puede estar vacío.',
        'any.required': 'El campo nombre es obligatorio.',
    }),
    direccion: Joi.string().optional().messages({
        'string.empty': 'El campo dirección no puede estar vacío.',}),
    telefono: Joi.string().pattern(/^[0-9]{9}$/).optional().messages({
        'string.pattern.base': 'El teléfono debe contener solo números y ser de 9 dígitos.',
        'any.required': 'El campo teléfono es obligatorio.',
      }),
    contrasena: Joi.string().pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/).required().messages({
        'string.pattern.base': 'La contraseña debe tener al menos 8 caracteres, una letra mayúscula, un número y un carácter especial.',
        'any.required': 'El campo contraseña es obligatorio.',
      }),
});

const login_schema = Joi.object({
    email: Joi.string().email().required(),
    contrasena: Joi.string().required()
})



router.post('/user-registration', async (req, res) => {

    // Validación de schema
    const { error } = user_registration_schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, contrasena, nombre, direccion,telefono } = req.body;

    /* try {
        const verification = await prisma.codigoVerificacion.findFirst({
            where: {
              correo: email,
              verificado: true
            },
          });
          if(!verification) return res.status(400).json({ error: 'Correo no verificado' });
        
    } catch (error) {
        console.error("Error al obtener la verificación de correo")
        
    }  */

    let hash = '';
    try {
        hash = await bcrypt.hash(contrasena, 10);

        if (hash.length == 0){
            return res.status(500).json({error: 'Error en backend'})
        }
    } catch (error) {
        console.error(error)
    }

    try {
        const user = await prisma.cliente.create({
        data: {
            correo:email,
            nombre,
            contrasena: hash,
            direccion: direccion ? direccion : '',
            telefono: telefono ? telefono : '',
            verificado: true
        },
        });
        res.json({ token: generateToken(user.idCliente) });
    } catch (error) {
        console.error(error)
        res.status(400).json({ error: 'Correo ya registrado' });
    }
    
});

/* 
router.post('/request-code', async (req, res) => {

    // Validación de schema
    const { error } = code_request_schema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email } = req.body;
    const codigo = Math.floor(100000 + Math.random() * 900000).toString(); // Ej: 6 dígitos

    try {

    await prisma.codigoVerificacion.upsert({
        where: { correo: email }, 
        update: { codigo, creadoEn: new Date() },
        create: { correo: email, codigo },
    });

    console.log("Codigo registrado en neon database")

    await sendCodeEmail(email, codigo);
    res.json({ message: 'Código enviado al correo.' });
    } catch (error) {
    res.status(500).json({ error: 'Error al generar el código.' });
    }

  });
  
  router.post('/verify-code', async (req, res) => {

    // Validación de schema
    const { error } = code_verify_schema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email,code } = req.body;

    const user = await prisma.codigoVerificacion.findFirst({
        where: {
          codigo: code,
          correo: email,
        },
      });
    
      if (!user) return res.status(400).json({ error: 'Código inválido' });
    
      try {
        await prisma.codigoVerificacion.update({
            where: { correo: email },
            data: { verificado: true},
          });
        
      } catch (error) {
        console.error(error)
        return res.status(500).json({ error: 'Error' });
      }
    
      res.send('<h2>Cuenta verificada correctamente ✅</h2>');

  }); */

router.post('/login', async (req, res) => {
    
    // Validación de schema
    const { error } = login_schema.validate(req.body);

    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { email, contrasena } = req.body;
    const user = await prisma.cliente.findUnique({ where: { correo: email } });
    if (!user || !(await bcrypt.compare(contrasena, user.contrasena))) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({ token: generateToken(user.idCliente) });
});

export default router;
