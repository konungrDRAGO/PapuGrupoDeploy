import React, { useState, useRef, useEffect } from 'react';
import { obtenerMascota, actualizarMascota } from '../services/mascota.service.js';
import {calcularEdad} from '../utils/dateUtils.js';

const ModalMascota = ({ idMascota, closeModal, onMascotaActualizada }) => {
  const [mascota, setMascota] = useState(null);
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [cargando, setCargando] = useState(false);
  const imagenMascota = mascota?.urlFoto || '/assets/mascotaPorDefecto.png';
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchMascota = async () => {
      try {
        const data = await obtenerMascota(idMascota);
        // Asegurar que todos los campos string sean strings (incluso los null/undefined)
        const mascotaNormalizada = Object.fromEntries(
          Object.entries(data).map(([key, val]) => [
            key, 
            typeof val === 'string' ? val : 
            (val === null || val === undefined) ? "" : val
          ])
        );
        setMascota(mascotaNormalizada);
      } catch (err) {
        console.error('Error al obtener la mascota', err);
        setMensaje({ tipo: 'error', texto: 'Error al cargar los datos de la mascota' });
      }
    };
    fetchMascota();
  }, [idMascota]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    const normalizedValue = type === 'checkbox' ? checked : 
                          (value === null || value === undefined) ? "" : value;
    
    setMascota(prev => ({
      ...prev,
      [name]: normalizedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      // Validación básica de campos requeridos
      if (!mascota.nombre || !mascota.especie || !mascota.raza || !mascota.sexo) {
        throw new Error('Nombre, especie, raza y sexo son campos obligatorios');
      }

      await actualizarMascota(idMascota, mascota);
      
      setMensaje({ tipo: 'exito', texto: 'Datos actualizados correctamente' });
      setEditando(false);
      
      if (onMascotaActualizada) {
        onMascotaActualizada();
      }
    } catch (error) {
      console.error('Error al actualizar mascota:', error);
      setMensaje({
        tipo: 'error',
        texto: error.message || 'Error al actualizar los datos'
      });
    } finally {
      setCargando(false);
    }
  };


  if (!mascota) {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-[100]">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <p>Cargando datos de la mascota...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Fondo semitransparente */}
      <div 
        className="fixed inset-0  z-[100]"
        onClick={closeModal}
      />
      
      {/* Contenido del modal */}
      <div
        ref={modalRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 sm:p-8 rounded-lg w-11/12 sm:w-1/2 md:w-2/3 lg:w-1/3 flex flex-col border shadow-xl max-h-[90vh] overflow-y-auto z-[101]"
        style={{ maxWidth: '90%' }}
      >
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 cursor-pointer"
          onClick={closeModal}
        >
          X
        </button>

        {mensaje.texto && (
          <div className={`mb-4 p-3 rounded ${
            mensaje.tipo === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            {mensaje.texto}
          </div>
        )}

        <div className="flex flex-col sm:flex-row">
          {/* Imagen de la mascota */}
          <div className="w-full sm:w-1/3 p-4">
            <img
              src={imagenMascota}
              alt={`Imagen de ${mascota.nombre}`}
              className="w-full h-48 object-cover rounded-lg"
            />
          </div>

          {/* Datos de la mascota */}
          <div className="w-full sm:w-2/3 p-4">
            {editando ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={mascota.nombre || ''}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Especie</label>
                    <input
                      type="text"
                      name="especie"
                      value={mascota.especie || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Raza</label>
                    <input
                      type="text"
                      name="raza"
                      value={mascota.raza || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Sexo</label>
                    <select
                      name="sexo"
                      value={mascota.sexo || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="Macho">Macho</option>
                      <option value="Hembra">Hembra</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Fecha Nacimiento</label>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={mascota.fechaNacimiento?.split('T')[0] || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-1">Color</label>
                    <input
                      type="text"
                      name="color"
                      value={mascota.color || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Tamaño</label>
                    <select
                      name="tamano"
                      value={mascota.tamano || ''}
                      onChange={handleChange}
                      className="w-full p-2 border rounded"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Pequeño">Pequeño</option>
                      <option value="Mediano">Mediano</option>
                      <option value="Grande">Grande</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="esterilizado"
                    checked={mascota.esterilizado || false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-gray-700">Esterilizado</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="vacunasAlDia"
                    checked={mascota.vacunasAlDia || false}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-gray-700">Vacunas al día</label>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditando(false)}
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={cargando}
                    className={`px-4 py-2 text-white rounded ${
                      cargando ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {cargando ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-4 text-center">{mascota.nombre}</h2>

                <div className="space-y-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Especie:</strong> {mascota.especie || 'N/A'}
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Raza:</strong> {mascota.raza || 'N/A'}
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Edad:</strong> {calcularEdad(mascota.fechaNacimiento)}
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Sexo:</strong> {mascota.sexo || 'N/A'}
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Fecha Nacimiento:</strong> {mascota.fechaNacimiento?.split('T')[0] || 'N/A'}
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Color:</strong> {mascota.color || 'N/A'}
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Tamaño:</strong> {mascota.tamano || 'N/A'}
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Esterilizado:</strong> {mascota.esterilizado ? 'Sí' : 'No'}
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Vacunas al día:</strong> {mascota.vacunasAlDia ? 'Sí' : 'No'}
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setEditando(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Editar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ModalMascota;