// src/utils/sendMail.js
import nodemailer from 'nodemailer';

export const sendCodeEmail = async (to, codigo) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  
    try {
        await transporter.sendMail({
            from: `"GPS Pasivo Papugrupo" <${process.env.EMAIL_USER}>`,
            to,
            subject: 'Código de verificación GPS Pasivo',
            html: `<p>Tu código de verificación es: <b>${codigo}</b></p>`,
          });
        
    } catch (error) {
        console.error(error)
    }
  };
