import React, { useState, useEffect } from 'react';
import { obtenerMascota, obtenerUbicacionesMascota  } from '../services/mascota.service.js';
import ModalQR from './ModalQR';
import ModalMascota from './ModalMascota.jsx';
import { IoIosArrowDropdown, IoIosArrowDropup } from "react-icons/io";
import { calcularEdad } from '../utils/dateUtils.js';

const TarjetaMascota = ({ idMascota, onSeleccionar, seleccionada }) => { 
  const [desplegado, setDesplegado] = useState(false);
  const [mascota, setMascota] = useState('');
  const imagenMascota = mascota.urlFoto || '/assets/mascotaPorDefecto.png';
  const [mostrarModalQR, setMostrarModalQR] = useState(false);
  const [mascotaParaModalDetalles, setMascotaParaModalDetalles] = useState('');
  const [ultimaUbicacion, setUltimaUbicacion] = useState(null);
  const [cargandoUbicacion, setCargandoUbicacion] = useState(false);

  const toggleDesplegado = () => setDesplegado(!desplegado);

  useEffect(() => {
    const fetchMascota = async () => {
      try {
        const data = await obtenerMascota(idMascota);
        setMascota(data);
        
        // Obtener la última ubicación al cargar la mascota
        await obtenerUltimaUbicacion(idMascota);
      } catch (err) {
        console.error('Error al obtener la mascota', err);
      }
    };
    fetchMascota();
  }, [idMascota]);

  const obtenerUltimaUbicacion = async (mascotaId) => {
    setCargandoUbicacion(true);
    try {
      const response = await obtenerUbicacionesMascota(mascotaId);
      if (response && response.ubicaciones && response.ubicaciones.length > 0) {
        // Ordenar por fecha (más reciente primero)
        const ubicacionesOrdenadas = [...response.ubicaciones].sort((a, b) => 
          new Date(b.fecha) - new Date(a.fecha)
        );
        setUltimaUbicacion(ubicacionesOrdenadas[0]);
      }
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
    } finally {
      setCargandoUbicacion(false);
    }
  };
  
  const abrirModalDetalles = () => {
    setMascotaParaModalDetalles(idMascota); 
  }

  const cerrarModalDetalles = () => {
    setMascotaParaModalDetalles(''); 
  }

  const cerrarModalQR = () => {
    setMostrarModalQR(false);
  };  

  // Función para manejar el cambio SOLO en el radio button
  const handleSeleccionChange = () => {
    if (onSeleccionar) {
      onSeleccionar(idMascota); // Llama a la función pasada desde MapaMascota
    }
  };

  const cardClassName = `w-full rounded-xl p-3 mb-3 transition-all duration-200 ${
    seleccionada 
      ? 'bg-primary border-2 border-dark shadow-lg' 
      : 'bg-light hover:bg-primary border border-gray-200 hover:shadow-md'
  }`;

  if (!mascota) {
    return (
      <div className={cardClassName}>
        <div className="animate-pulse flex items-center space-x-4">
          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cardClassName}>
      <div className='flex items-center justify-between'>
        <button 
          className="flex items-center w-full gap-3 group"
          onClick={handleSeleccionChange}
        > 
          <div className="relative">
            <img 
              src={imagenMascota} 
              alt="Foto mascota" 
              className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-sm 
                        group-hover:border-dark transition-all"
            />
            {seleccionada && (
              <div className="absolute -bottom-1 -right-1 bg-dark text-white rounded-full p-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="text-left flex-1">
            <h3 className="font-bold text-darkNeutral group-hover:text-dark">
              {mascota.nombre || 'Cargando...'}
            </h3>
            <p className="text-xs text-gray-600">{mascota.raza || 'Raza no especificada'}</p>
          </div>
        </button>

        <button 
          onClick={toggleDesplegado} 
          className="p-1 rounded-full hover:bg-white transition-colors"
        >
          {desplegado 
            ? <IoIosArrowDropup className="text-dark" />
            : <IoIosArrowDropdown className="text-darkNeutral" />
          }
        </button>
      </div>

      {desplegado && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-start">
                <span className="inline-block w-20 text-sm font-medium text-dark">Edad:</span>
                <span className="text-sm text-darkNeutral">
                  {calcularEdad(mascota.fechaNacimiento)}
                </span>
              </div>
              
              <div className="flex items-start">
                <span className="inline-block w-20 text-sm font-medium text-dark">Última ubicación:</span>
                <div className="text-sm text-darkNeutral">
                  {cargandoUbicacion ? (
                    <span className="text-gray-400">Cargando...</span>
                  ) : ultimaUbicacion ? (
                    <>
                      <p>Lat: {ultimaUbicacion.latitud}</p>
                      <p>Long: {ultimaUbicacion.longitud}</p>
                      {ultimaUbicacion.fecha && (
                        <p className="text-xs text-gray-500">
                          {new Date(ultimaUbicacion.fecha).toLocaleString()}
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-400">No registrada</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col justify-end gap-2 sm:gap-3">
              <button
                className="px-3 py-1.5 bg-dark text-white text-sm rounded-full hover:bg-opacity-90 
                          transition-all flex items-center justify-center gap-1 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); setMostrarModalQR(true); }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                QR
              </button>

              <button
                className="px-3 py-1.5 bg-secondary text-darkNeutral text-sm rounded-full hover:bg-opacity-90 
                          transition-all flex items-center justify-center gap-1 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); abrirModalDetalles(); }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Detalles
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
      {mostrarModalQR && <ModalQR idMascota={idMascota} closeModal={cerrarModalQR} />}
      {mascotaParaModalDetalles && (
        <ModalMascota idMascota={mascotaParaModalDetalles} closeModal={cerrarModalDetalles} />
      )}
    </div>
  );
};

export default TarjetaMascota;