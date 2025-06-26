import React, { useState, useEffect } from 'react';
import MapMascotaComponent from '../components/MapMascotaComponent.jsx';
import {obtenerListadoMascotas, obtenerUbicacionesMascota } from '../services/mascota.service.js';
import TablaUbicacionMascota from '../components/TablaUbicacionMascota.jsx';
import TarjetaMascota from '../components/TarjetaMascota.jsx';
import { MdPets } from "react-icons/md";
import { MdMap } from "react-icons/md";
import { MdLocationPin } from "react-icons/md";
import Spinner from '../components/Spinner.jsx';
import { useNavigate } from "react-router-dom";

// Helper function to transform location data
const transformarUbicacion = (ubicacion, mascotaId) => {
  if (!ubicacion || !ubicacion.fecha) {
    console.warn("Ubicación inválida o sin fecha:", ubicacion);
    return null; // O retornar un objeto con valores por defecto/N/A
  }
  try {
    const fechaObj = new Date(ubicacion.fecha);
    if (isNaN(fechaObj.getTime())) {
      console.warn("Fecha inválida en ubicación:", ubicacion.fecha);
      return null; // O manejar como prefieras
    }
    return {
      idUbicacion: ubicacion.idUbicacion,
      mascotaId: mascotaId, // Agregamos el ID de la mascota
      latitud: ubicacion.latitud,
      longitud: ubicacion.longitud,
      dia: fechaObj.getDate(),
      mes: fechaObj.getMonth() + 1, // getMonth() es 0-indexado
      anio: fechaObj.getFullYear(),
      hora: fechaObj.getHours(),
      minuto: fechaObj.getMinutes(),
      segundo: fechaObj.getSeconds(),
      nombreReportante: ubicacion.nombreReportante || 'Desconocido',
      comentario: ubicacion.comentario || 'Sin comentario',
    };
  } catch (error) {
    console.error("Error transformando ubicación:", error, ubicacion);
    return null;
  }
};

const MapaMascota = () => {
  const [selectedMascotas, setSelectedMascotas] = useState([]); // Cambiamos a array de IDs
  const [mascotasData, setMascotasData] = useState([]); // Objeto para guardar datos de mascotas
  const [listaMascotas, setListaMascotas] = useState([]);
  const [puntosActivos, setPuntosActivos] = useState([]);
  const [vistaActiva, setVistaActiva] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ultimaUbicacionGlobal, setUltimaUbicacionGlobal] = useState(null);
  const [botonUltimaUbicacion, setbotonUltimaUbicacion] = useState(false);

  const navigate = useNavigate();

  // Modificamos la función de selección para manejar múltiples mascotas
  const handleSeleccionarMascota = async (idMascota) => {
    setSelectedMascotas(prev => prev.includes(idMascota)
      ? prev.filter(id => id !== idMascota)
      : [...prev, idMascota]
    );
    setPuntosActivos([]);
    setVistaActiva(null);

  };

  useEffect(() => {
    const actualizarUbicaciones = async () => {
      if (!selectedMascotas.length) return;

      const ubicaciones = await obtenerUltimasUbicaciones(selectedMascotas);
      ubicaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setUltimaUbicacionGlobal(ubicaciones[ubicaciones.length - 1]);
      setPuntosActivos(ubicaciones);
      setbotonUltimaUbicacion(false);
    };

    actualizarUbicaciones();
  }, [selectedMascotas]);

  // Función para obtener la ÚLTIMA ubicación de mascotas específicas
  const obtenerUltimasUbicaciones = async (mascotasIds) => {
    if (mascotasIds.length === 0) {
      console.log("No hay mascotas para procesar.");
      return [];
    }

    try {
      const todasUbicaciones = [];
      
      // Obtenemos ubicaciones para cada mascota
      for (const mascotaId of mascotasIds) {
        const responseData = await obtenerUbicacionesMascota(mascotaId);
        const ubicacionesOriginales = responseData && Array.isArray(responseData.ubicaciones) ? 
          responseData.ubicaciones : [];

        if (ubicacionesOriginales.length > 0) {
          // Ordenamos y tomamos la última
          ubicacionesOriginales.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
          const ultimaUbicacion = ubicacionesOriginales[ubicacionesOriginales.length - 1];
          const ubicacionTransformada = transformarUbicacion(ultimaUbicacion, mascotaId);
          
          if (ubicacionTransformada) {
            todasUbicaciones.push(ubicacionTransformada);
          }
        }
        
        // Guardamos la última ubicación global con la mas reciente de todasUbicaciones
        if (todasUbicaciones.length > 0) {
          todasUbicaciones.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          setUltimaUbicacionGlobal(todasUbicaciones[todasUbicaciones.length - 1]);
        }
      }

      return todasUbicaciones;
    } catch (error) {
      console.error("Error al obtener las últimas ubicaciones:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchListadoMascotas = async () => {
      console.log('Obteniendo listado de mascotas...');
      try {
        const data = await obtenerListadoMascotas();
        console.log('Listado de mascotas:', data);
        setListaMascotas(data);

        // Guardamos los datos de las mascotas
        const mascotasDataArray = [];
        const ids = [];
        for (const mascota of data) {
          ids.push(mascota.idMascota);
          mascotasDataArray[mascota.idMascota] = {
            nombre: mascota.nombre,
            urlFoto: mascota.urlFoto,
          };
        }

        setMascotasData(mascotasDataArray);
        setSelectedMascotas(ids); // Seleccionamos todas las mascotas

        // Ahora obtenemos y mostramos automáticamente las últimas ubicaciones
        if (ids.length > 0) {
          setCargando(true);
          setVistaActiva('ultima');
          
          const ubicaciones = await obtenerUltimasUbicaciones(ids);
          setPuntosActivos(ubicaciones);
          
        }
        setCargando(false);
      } catch (err) {
        console.error('Error al obtener el listado de mascotas', err);
        setCargando(false);
      }
    };

    fetchListadoMascotas();
  }, []);

  // Función para obtener la ÚLTIMA ubicación de las mascotas seleccionadas
  const handleMostrarUltimaUbicacion = async () => {
    if (selectedMascotas.length === 0) {
      console.log("No hay mascotas seleccionadas.");
      return;
    }

    setCargando(true);
    setVistaActiva('ultima');

    const ubicaciones = await obtenerUltimasUbicaciones(selectedMascotas);
    setbotonUltimaUbicacion(true);
    setPuntosActivos(ubicaciones);
    setCargando(false);
  };

  // Función para obtener TODAS las ubicaciones de las mascotas seleccionadas
  const handleMostrarTodasUbicaciones = async () => {
    if (selectedMascotas.length === 0) {
      console.log("No hay mascotas seleccionadas.");
      return;
    }

    setCargando(true);
    setVistaActiva('todas');

    try {
      const todasUbicaciones = [];
      
      // Obtenemos todas las ubicaciones para cada mascota seleccionada
      for (const mascotaId of selectedMascotas) {
        const responseData = await obtenerUbicacionesMascota(mascotaId);
        const ubicacionesOriginales = responseData && Array.isArray(responseData.ubicaciones) ? 
          responseData.ubicaciones : [];

        const ubicacionesTransformadas = ubicacionesOriginales
          .map(ubicacion => transformarUbicacion(ubicacion, mascotaId))
          .filter(u => u !== null);

        todasUbicaciones.push(...ubicacionesTransformadas);
      }

      setPuntosActivos(todasUbicaciones);
      setbotonUltimaUbicacion(false);
    } catch (error) {
      console.error("Error al obtener todas las ubicaciones:", error);
      setPuntosActivos([]);
    } finally {
      setCargando(false);
    }
  };

  // Función para obtener nombres de mascotas seleccionadas
  const getNombresMascotasSeleccionadas = () => {
    return selectedMascotas.map(id => mascotasData[id]?.nombre || 'Mascota').join(', ');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-bottom p-2 md:p-4"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.3)), url('/assets/gps_background.png')`,
      }}
    >
      {cargando && (  
        <Spinner mensaje="Cargando mascotas..." />
      )}

      <div className="container mx-auto max-w-full mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sección izquierda - Listado de mascotas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-4 h-full">
              <div className="flex justify-center items-center gap-2 mb-4">
                <MdPets className="text-lg text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">Mis Mascotas</h2>
              </div>

               {listaMascotas.length === 0 ? (
                <div className="flex-1 flex items-center justify-center"> {/* MANTÉN ESTAS CLASES */}
                  <div className="text-center py-8 text-gray-500">
                    <MdPets className="text-4xl mx-auto mb-3 text-gray-300" />
                    <p className="text-base">No tienes mascotas registradas</p>
                  </div>
                </div>
              ) : (
              <div className="space-y-2 mh-[280px] md:h-[320px] lg:h-[380px] overflow-y-auto pr-1"> {/* ESTE DIV AHORA ESTÁ EN EL ELSE */}
                {listaMascotas.map((mascota) => (
                    <TarjetaMascota
                      key={mascota.idMascota} 
                      idMascota={mascota.idMascota}
                      onSeleccionar={handleSeleccionarMascota}
                      seleccionada={selectedMascotas.includes(mascota.idMascota)}
                    />
                  ))}
                </div> 
              )}
              <div className='flex justify-end items-center mt-4'>
                <button className='w-full hover:bg-blue-600 hover:text-white rounded-lg p-2 mb-2 bg-blue-300 cursor-pointer' 
                      title='Registrar Mascota'
                      onClick={() =>navigate('/registro-mascota')}>
                        {listaMascotas.length == 0 ? 'Registra tu primera mascota' : 'Registrar nueva mascota'}
              </button>
              </div>
            </div>
           </div>

          {/* Sección central - Mapa */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col h-full">
              <div className="flex items-center justify-center gap-2 mb-4">
                <MdMap className="text-lg text-green-600" />
                <h2 className="text-lg font-bold text-gray-800">Mapa de Ubicaciones</h2>
              </div>

              {selectedMascotas.length > 0 ? (
                <>
                  {/* Mapa con altura optimizada */}
                  <div className="h-[280px] md:h-[320px] lg:h-[380px] w-full rounded-xl overflow-hidden border border-gray-200">
                    <MapMascotaComponent
                      mascotas={mascotasData}
                      puntos={puntosActivos}
                      key={selectedMascotas.join(',')}
                      ultimaUbicacionGlobal = {ultimaUbicacionGlobal}
                      botonUltimaUbicacion = {botonUltimaUbicacion}
                    />
                  </div>

                  {/* Botones mejorados */}
                  <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                    <button
                      onClick={handleMostrarUltimaUbicacion}
                      disabled={selectedMascotas.length === 0 || cargando}
                      className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200 transform hover:scale-105 ${
                        vistaActiva === 'ultima'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-300'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      } ${selectedMascotas.length === 0 || cargando ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
                    >
                      {cargando && vistaActiva === 'ultima' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Cargando...</span>
                        </div>
                      ) : (
                        <span className="text-sm">Última Ubicación</span>
                      )}
                    </button>
                    <button
                      onClick={handleMostrarTodasUbicaciones}
                      disabled={selectedMascotas.length === 0 || cargando}
                      className={`px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200 transform hover:scale-105 ${
                        vistaActiva === 'todas'
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-green-300'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      } ${selectedMascotas.length === 0 || cargando ? 'opacity-50 cursor-not-allowed transform-none' : ''}`}
                    >
                      {cargando && vistaActiva === 'todas' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm">Cargando...</span>
                        </div>
                      ) : (
                        <span className="text-sm">Todas las Ubicaciones</span>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="h-[280px] md:h-[320px] lg:h-[360px] flex items-center justify-center">
                  <div className="text-center p-8 text-gray-600">
                    <MdMap className="text-5xl mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold mb-2">
                      {listaMascotas.length > 0
                        ? 'Selecciona una o más mascotas'
                        : 'No hay mascotas disponibles'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {listaMascotas.length > 0
                        ? 'Elige las mascotas que deseas ver en el mapa'
                        : 'Registra mascotas para poder visualizar sus ubicaciones'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Sección derecha - Tabla de ubicaciones */}
        <div className="lg:col-span-1 mt-4">
          <div className="bg-white rounded-2xl shadow-xl p-4 h-full flex flex-col">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MdLocationPin className="text-lg text-red-600" />
              <h2 className="text-lg font-bold text-gray-800 text-center">
                Ubicaciones
              </h2>
            </div>

            {selectedMascotas.length > 0 ? (
              <div className='min-h-[20vh]'>
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-medium text-center">
                    {getNombresMascotasSeleccionadas()}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-350px)]">
                  <TablaUbicacionMascota datos={puntosActivos} mascotas={mascotasData} />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <MdLocationPin className="text-4xl mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">Selecciona mascotas para ver sus ubicaciones</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

};

export default MapaMascota;