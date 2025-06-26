// src/pages/Landing.jsx
import React, { useEffect, useState } from 'react'; // Importa useEffect y useState
import { useLocation, useNavigate } from 'react-router-dom'; // Importa useLocation y useNavigate
import { useAuth } from '../context/AuthContext'; // Importa useAuth para clearAuthMessage
import Login from './Login';

export default function Landing() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearAuthMessage } = useAuth(); // Para limpiar el mensaje del contexto

  // Nuevo estado para el mensaje de sesión caducada
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('');

  // Efecto para verificar el estado de la ubicación al cargar el componente
  useEffect(() => {
    if (location.state?.sessionExpiredMessage) {
      setSessionExpiredMessage(location.state.sessionExpiredMessage);
      
      // Limpiar el estado de la ubicación para que el mensaje no reaparezca en futuras visitas o refrescos
      navigate(location.pathname, { replace: true, state: {} }); 
      
      // Asegurarse de que el AuthContext también limpie su mensaje interno
      clearAuthMessage(); 
    }
  }, [location, navigate, clearAuthMessage]); // Dependencias

  return (
    <div className="min-h-screen w-full bg-[url('/assets/fondo.png')] bg-cover bg-center">
      {/* Hero Section flotante */}
      <div className="pt-5">
        <div className="w-full bg-primary text-center py-12 px-6 shadow-md">
          <h1 className="text-6xl md:text-7xl font-bold text-darkNeutral drop-shadow-lg">PET-GPS</h1>
          <p className="mt-4 text-lg md:text-xl font-medium text-darkNeutral drop-shadow">
            GPS Pasivo para Mascotas
          </p>
        </div>
      </div>

      {/* Mostrar el mensaje de sesión caducada si existe, ANTES del Login Box */}
      {sessionExpiredMessage && (
        <div className="flex justify-center mt-4 px-4"> {/* Centrar el mensaje */}
          <div className="w-full md:w-100 p-2 bg-red-500 text-white rounded text-center shadow-md">
            {sessionExpiredMessage}
          </div>
        </div>
      )}

      {/* Contenedor principal con flexbox y espaciado adecuado */}
      <div className="flex flex-col items-center justify-start p-4">
        {/* Login Box flotante */}
        <div className="w-full md:w-100 bg-white shadow-xl rounded-2xl p-6 text-left">
          {/* PASAR EL MENSAJE AL COMPONENTE HIJO LOGIN */}
          <Login sessionExpiredMessage={sessionExpiredMessage} />
        </div>
      </div>

      {/* Content Section (más abajo) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded shadow overflow-hidden">
            <img
              src="assets/mascotas.jpg"
              alt="Mascotas"
              className="w-full h-100 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-sm mb-1 text-darkNeutral">Día de la mascota</h3>
              <p className="text-xs text-secondary text-darkNeutral">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur iaculis egestas gravida.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}