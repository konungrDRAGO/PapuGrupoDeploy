// src/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './src/routes/authRoutes.js';
import ensureJson from './src/middleware/jsonMiddleware.js';
import petRoutes from './src/routes/petRoutes.js'
import userRoutes from './src/routes/userRoutes.js'
import qrRoutes from './src/routes/qrRoutes.js'
import { authenticateToken } from './src/middleware/authMiddleware.js';

dotenv.config();
const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
app.use(cors());

// Unprotected routes (No token required)

app.use('/api/auth',ensureJson, authRoutes);
app.use('/api/qr',ensureJson,qrRoutes);

// Protected routes (Token required)
app.use('/api/pet',authenticateToken,petRoutes);
app.use('/api/user',authenticateToken,userRoutes);


app.listen(process.env.BACKEND_PORT, '0.0.0.0', () => 
    console.log(`Servidor corriendo en http://0.0.0.0:${process.env.BACKEND_PORT}`)
  );
