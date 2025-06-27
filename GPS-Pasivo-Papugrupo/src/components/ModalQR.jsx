import React, { useState, useRef, useEffect } from 'react';
import { obtenerMascota } from '../services/mascota.service.js';
import QRCode from 'qrcode';
import {calcularEdad} from '../utils/dateUtils.js';


const ModalQR = ({ idMascota, closeModal }) => {
  const [mascota, setMascota] = useState(null);
  const [imagenQR, setImagenQR] = useState(null);
  const [cargandoQR, setCargandoQR] = useState(true);

  const modalRef = useRef(null);
  
 const urlBase = import.meta.env.VITE_URL_BASE;
 const urlBaseQR = `${urlBase}/registrar-ubicacion`;

  useEffect(() => {
    const fetchMascota = async () => {
      try {
        const data = await obtenerMascota(idMascota);
        setMascota(data);
      } catch (err) {
        console.error('Error al obtener la mascota', err);
      }
    };
    fetchMascota();
  }, [idMascota]);

  useEffect(() => {
    const generarQR = async () => {
      if (mascota) {
        try {
          setCargandoQR(true);
          const dataURL = await QRCode.toDataURL(`${urlBaseQR}/${idMascota}`);
          setImagenQR(dataURL);
        } catch (err) {
          console.error('Error al generar el QR:', err);
        } finally {
          setCargandoQR(false);
        }
      }
    };
    generarQR();
  }, [mascota]);

  const handleOutsideClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      closeModal();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const descargarQR = () => {
    if (imagenQR) {
      const link = document.createElement('a');
      link.href = imagenQR;
      link.download = `QR_${mascota.nombre}.png`;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-lg w-11/12 sm:w-1/2 md:w-1/2 lg:w-1/3 flex flex-col items-center relative border shadow-lg space-y-6"
        style={{ maxWidth: '90%' }}
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          onClick={closeModal}
        >
          X
        </button>

        {/* Imagen del QR y botón descargar */}
        <div className="flex flex-col items-center">
          {cargandoQR ? (
            <p className="text-gray-500">Cargando QR...</p>
          ) : (
            <>
              <img
                src={imagenQR}
                alt={`QR de ${mascota.nombre}`}
                className="w-60 h-60 object-contain rounded-lg mb-4"
              />
              <button
                onClick={descargarQR}
                className="bg-primary text-black font-semibold py-2 px-4 rounded cursor-pointer hover:bg-[var(--color-secondary)] transition duration-200"
              >
                Descargar QR
              </button>
            </>
          )}
        </div>

        {/* Datos de la mascota */}
        {mascota && (
          <div className="text-center w-full">
            <h2 className="text-2xl font-semibold mb-4">Información de la Mascota</h2>
            <div className="flex flex-col space-y-3">
              <div className="p-3 bg-primary rounded-lg text-black">
                <strong>Nombre:</strong> {mascota.nombre}
              </div>
              <div className="p-3 bg-primary rounded-lg text-black">
                <strong>Raza:</strong> {mascota.raza}
              </div>
              <div className="p-3 bg-primary rounded-lg text-black">
                <strong>Edad:</strong> {calcularEdad(mascota.fechaNacimiento)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalQR;
