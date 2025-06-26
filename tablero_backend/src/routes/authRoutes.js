import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../utils/generateToken.js';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

const user_registration_schema = Joi.object({
    email: Joi.string().email().required(),
    nombre: Joi.string().required(),
    telefono: Joi.string().optional(),
    contrasena: Joi.string()
        .min(8) // Mínimo 8 caracteres
        .max(30) // Máximo 30 caracteres
        .pattern(new RegExp('(?=.*[a-z])')) // Al menos una letra minúscula
        .pattern(new RegExp('(?=.*[A-Z])')) // Al menos una letra mayúscula
        .pattern(new RegExp('(?=.*[0-9])')) // Al menos un dígito
        .pattern(new RegExp('(?=.*[!@#$%^&*])')) // Al menos un carácter especial
        .required()
        .messages({
            'string.min': 'La contraseña debe tener al menos {{#limit}} caracteres.',
            'string.max': 'La contraseña no debe exceder los {{#limit}} caracteres.',
            'string.pattern.base': 'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial (!@#$%^&*).'
        })
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

    const { email, contrasena, nombre, telefono } = req.body;

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
        const user = await prisma.usuario.create({
        data: {
            correo:email,
            nombre,
            contrasena: hash,
            telefono: telefono ? telefono : '',
            verificado: true
        },
        });
        res.json({ token: generateToken(user.idUsuario) });
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
    const user = await prisma.usuario.findUnique({ where: { correo: email } });
    if (!user || !(await bcrypt.compare(contrasena, user.contrasena))) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    res.json({ token: generateToken(user.idUsuario, user.idGrupoRef) });
});

export default router;
