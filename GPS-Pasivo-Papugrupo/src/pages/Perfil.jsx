import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { actualizarUsuario, obtenerUsuario } from '../services/usuario.service';
import { obtenerListadoMascotas } from '../services/mascota.service';
import ModalMascota from '../components/ModalMascota.jsx';
import Spinner from '../components/Spinner.jsx';

const Perfil = () => {
  const { user } = useAuth();
  const [usuario, setUsuario] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: ''
  }); 
  const [editando, setEditando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  const [mascotas, setMascotas] = useState([]);
  const [loadingMascotas, setLoadingMascotas] = useState(false);
  const [errorMascotas, setErrorMascotas] = useState(null);
  
  // Estado para controlar el modal de mascotas
  const [modalMascotaVisible, setModalMascotaVisible] = useState(false);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [cargando, setCargando] = useState(true);
  

  useEffect(() => {
    const cargarDatosUsuario = async () => {
      try {
        if (user?.email) {
          // Obtener datos del usuario desde el backend
          const datos = await obtenerUsuario(user.email);
          setUsuario(datos);

          // Cargar las mascotas del usuario
          setLoadingMascotas(true);
          const response = await obtenerListadoMascotas();
          setMascotas(response);
          setLoadingMascotas(false);
          setCargando(false);
        }
      } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        setLoadingMascotas(false);
        setErrorMascotas('Error al cargar las mascotas');
      }
    };
    
    cargarDatosUsuario();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actualizarUsuario(usuario);
      setMensaje('Datos actualizados correctamente');
      setEditando(false);
      setTimeout(() => setMensaje(''), 3000);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setMensaje('Error al actualizar los datos');
    }
  };

  // Función para abrir el modal de la mascota
  const abrirModalMascota = (mascota) => {
    setMascotaSeleccionada(mascota);
    setModalMascotaVisible(true);
  };

  // Función para cerrar el modal
  const cerrarModalMascota = () => {
    setModalMascotaVisible(false);
    setMascotaSeleccionada(null);
  };

  return (
    <div className="min-h-screen w-full bg-[url('/assets/fondo.png')] bg-cover bg-center p-6">
      {cargando && (  
        <Spinner mensaje="Cargando datos..." />
      )}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Encabezado del perfil */}
        <div className="bg-[#e0ecfc] p-6 text-gray-800 flex items-center"> 
          <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden mr-6">
            <img 
              src="/assets/fotoPerfil.png" 
              alt="Foto de perfil" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {usuario.nombre || 'Usuario'}
            </h1>
            <p className="">{user?.email || 'Correo no disponible'}</p>
          </div>
        </div>

        {/* Contenido del perfil */}
        <div className="p-6">
          {mensaje && (
            <div className={`mb-4 p-3 rounded ${mensaje.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {mensaje}
            </div>
          )}

          {editando ? (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 mb-2">Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    value={usuario.nombre}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={usuario.correo}
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-gray-100"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={usuario.telefono}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={usuario.direccion}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setEditando(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#e0ecfc] text-gray-800 rounded hover:bg-[#c6d8f5] transition-colors font-medium"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-gray-500 text-sm">Nombre</h3>
                  <p className="text-lg">{usuario.nombre || 'No especificado'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Email</h3>
                  <p className="text-lg">{usuario.correo || 'No especificado'}</p>
                </div>
                <div>
                  <h3 className="text-gray-500 text-sm">Teléfono</h3>
                  <p className="text-lg">{usuario.telefono || 'No especificado'}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-gray-500 text-sm">Dirección</h3>
                  <p className="text-lg">{usuario.direccion || 'No especificado'}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setEditando(true)}
                  className="px-4 py-2 bg-[#e0ecfc] text-gray-800 rounded hover:bg-[#c6d8f5] transition-colors font-medium"
                >
                  Editar perfil
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sección de mascotas */}
        <div className="border-t p-6">
          <h2 className="text-xl font-semibold mb-4">Mis Mascotas</h2>
          {loadingMascotas ? (
            <div className="text-center py-4">
              <p>Cargando mascotas...</p>
            </div>
          ) : errorMascotas ? (
            <div className="text-center py-4 text-red-500">
              <p>{errorMascotas}</p>
            </div>
          ) : mascotas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mascotas.map((mascota) => (
                <div 
                  key={mascota.idMascota} 
                  className="bg-white p-4 rounded shadow-md cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => abrirModalMascota(mascota)}
                >
                  <div className="flex items-center mb-3">
                    {mascota.urlFoto ? (
                      <img 
                        src={mascota.urlFoto} 
                        alt={mascota.nombre} 
                        className="w-16 h-16 rounded-full object-cover mr-3"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-gray-500">Foto</span>
                      </div>
                    )}
                    <h3 className="text-lg font-semibold">{mascota.nombre}</h3>
                  </div>
                  <p className="text-gray-600">Especie: {mascota.especie}</p>
                  <p className="text-gray-600">Raza: {mascota.raza}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay mascotas registradas.</p>
          )}
        </div>
      </div>

      {/* Modal de mascota */}
      {modalMascotaVisible && mascotaSeleccionada && (
      // En Perfil.js, modificar la llamada al ModalMascota
        <ModalMascota 
          idMascota={mascotaSeleccionada.idMascota} 
          closeModal={cerrarModalMascota}
          onMascotaActualizada={() => {
            // Recargar las mascotas después de una actualización
            const cargarMascotas = async () => {
              setLoadingMascotas(true);
              try {
                const response = await obtenerListadoMascotas();
                setMascotas(response);
              } catch (error) {
                console.error('Error al cargar mascotas:', error);
                setErrorMascotas('Error al cargar las mascotas');
              }
              setLoadingMascotas(false);
            };
            cargarMascotas();
          }}
        />
      )}
    </div>
  );
};

export default Perfil;