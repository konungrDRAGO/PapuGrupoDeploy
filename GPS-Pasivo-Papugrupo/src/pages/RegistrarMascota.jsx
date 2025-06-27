import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import { MdMap } from "react-icons/md";
import { FaCheck } from "react-icons/fa";


import { registrarMascotas } from '../services/mascota.service';

import { eliminarLlavesVacias } from '../utils/funciones';

import imageCompression from 'browser-image-compression';



const especieOptions = ['Seleccionar...','Perro', 'Gato', 'Ave', 'Conejo', 'Otro'];
const razaOptions = {
  Perro: ['Seleccionar...','Labrador', 'Poodle', 'Bulldog', 'Pastor Alemán','Otro'],
  Gato: ['Seleccionar...','Persa', 'Siames', 'Maine Coon', 'Sphynx','Otro'],
  Ave: ['Seleccionar...','Periquito', 'Canario', 'Loro','Otro'],
  Conejo: ['Enano', 'Cabeza de León', 'Angora','Otro'],
  Otro: ['Seleccionar...','Otro']
};
const sexoOptions = ['Seleccionar...','Macho','Hembra']



const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50  flex items-center justify-center">
      {/* Fondo con opacidad */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: 0.6 }} // 
        onClick={onClose}
      />

      {/* Contenido del modal */}
      <div className="relative bg-white rounded-xl p-6 shadow-xl z-10 max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
};

const nuevaMascota = () => ({
  nombre: '',
  especie: '',
  raza: '',
  sexo: '',
  fechaNacimiento: '',
  color: '',
  tamano: '',
  esterilizado: false,
  numeroMicrochip: '',
  fechaMicrochip: '',
  urlFoto: '',
  vacunasAlDia: false,
  fechaDesparasitacion: '',
  condicionesMedicas: '',
  nombreVeterinario: '',
  telefonoVeterinario: '',
  comportamiento: '',
  observaciones: ''
});

const urlBase = import.meta.env.VITE_URL_BASE;
const urlBaseQR = `${urlBase}/registrar-ubicacion`;

const RegistrarMascota = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mascotas, setMascotas] = useState([]);
  const [tabActiva, setTabActiva] = useState(0);

  const navigate = useNavigate();


  const [intentadoGuardar, setIntentadoGuardar] = useState(false);

  const [registroResponse,setRegistroResponse] = useState([
    {
        nombreMascota: 'Boby',
        idMascota: '9f5cae14-a465-497b-9645-5e1325ffbb03' 
    },
    {
        nombreMascota: 'Rito',
        idMascota: '9f5cae14-a465-497b-9645-8e1325ffbb03' 
    },
    {
        nombreMascota: 'Ryley',
        idMascota: '9f5cae14-a465-497b-9645-1e1325ffbb03' 
    }
  ])


  const handleChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const nuevasMascotas = [...mascotas];
    nuevasMascotas[index][name] = type === 'checkbox' ? checked : value;
    setMascotas(nuevasMascotas);
  };

  const descargarQR = async (mascota) => {
    try {
      const dataURL = await QRCode.toDataURL(urlBaseQR+"/"+mascota.idMascota); // Generar el QR en base64
  
      // Convertir base64 a Blob
      const res = await fetch(dataURL);
      const blob = await res.blob();
  
      // Crear URL temporal para descarga
      const url = URL.createObjectURL(blob);
  
      // Crear link de descarga
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-${mascota.nombre}.png`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
      // Liberar memoria
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al generar/descargar el QR:', err);
    }
  };

  const generarZipConQRs = async () => {
    const zip = new JSZip();
    const carpeta = zip.folder('QRs-Mascotas');

    await Promise.all(
        registroResponse.map(async (response) => {
          const dataURL = await QRCode.toDataURL(urlBaseQR + "/" + response.idMascota);
          const res = await fetch(dataURL);
          const blob = await res.blob();
          carpeta.file(`qr-${response.nombre || 'vacio'}.png`, blob);
        })
      );
  
    const contenidoZip = await zip.generateAsync({ type: 'blob' });
    saveAs(contenidoZip, 'GPS-Papugrupo-QRS.zip');
  };

  const handleImageUpload = async (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      const options = {
        maxSizeMB: 0.3,          // Tamaño máximo en MB (ajusta según sea necesario)
        maxWidthOrHeight: 800, // Ancho o alto máximo (ajusta según sea necesario)
        useWebWorker: true     // Usar Web Worker para procesamiento en segundo plano
      };

      const compressedFile = await imageCompression(file, options);
  
      // Cuando la imagen esté cargada, convertirla a base64
      reader.onloadend = () => {
        handleChange(index, {
          target: {
            name: 'urlFoto',
            value: reader.result, // Aquí se obtiene el Base64
            type: 'text'
          }
        });
      };
  
      // Leer la imagen como Data URL (Base64)
      reader.readAsDataURL(compressedFile);
    }
  };

  const closeModalHandler =()=>{
    //navigate('/mapa')
    resetForm();
    setIsModalOpen(false);
    setIntentadoGuardar(false);
  }

  // Función para eliminar la imagen
    const handleRemoveImage = (index) => {
        const updatedMascotas = [...mascotas];
        updatedMascotas[index].urlFoto = null;  // Elimina la URL de la imagen
        setMascotas(updatedMascotas);
    };

  const agregarMascota = () => {
    setMascotas([...mascotas, nuevaMascota()]);
    setTabActiva(mascotas.length);
  };

  const eliminarMascota = (index) => {
    const nuevasMascotas = mascotas.filter((_, i) => i !== index);
    setMascotas(nuevasMascotas);
    setTabActiva(Math.max(0, index - 1));
  };

  const guardarMascotas = async () => {
    setIntentadoGuardar(true);
  
    const errores = [];
  
    mascotas.forEach((m, idx) => {
      if (!m.nombre.trim()) {
        errores.push(`Mascota ${idx + 1}: falta el nombre.`);
      }
      if (!m.sexo || m.sexo === 'Seleccionar...') {
        errores.push(`Mascota ${idx + 1}: falta seleccionar el sexo.`);
      }
      if (!m.especie || m.especie === 'Seleccionar...') {
        errores.push(`Mascota ${idx + 1}: falta seleccionar la especie.`);
      }
      if (
        (!m.raza || m.raza === 'Seleccionar...') &&
        m.raza !== 'Otro'
      ) {
        errores.push(`Mascota ${idx + 1}: falta seleccionar la raza.`);
      }
      if (!m.fechaNacimiento.trim()) {
        errores.push(`Mascota ${idx + 1}: falta la fecha de nacimiento.`);
      }
    });
  
    if (errores.length > 0) {
      alert('Errores encontrados:\n\n' + errores.join('\n'));
      return;
    }

    // Convertir las fechas a formato ISO
    for (let i = 0; i < mascotas.length; i++) {
      mascotas[i].fechaNacimiento = new Date(mascotas[i].fechaNacimiento).toISOString();
      if (mascotas[i].fechaMicrochip) {
        mascotas[i].fechaMicrochip = new Date(mascotas[i].fechaMicrochip).toISOString();
      }
      if (mascotas[i].fechaDesparasitacion) {
        mascotas[i].fechaDesparasitacion = new Date(mascotas[i].fechaDesparasitacion).toISOString();
      }

    }

    const data = {
      mascotas: mascotas
    }

    eliminarLlavesVacias(data);

    const jsonMascotas = JSON.stringify(data);

    const responseMascotas = await registrarMascotas(jsonMascotas);

    setRegistroResponse(responseMascotas.mascotas)
    setIsModalOpen(true)

  };

  const resetForm = () =>{
    setMascotas([nuevaMascota()])
  }


  return (
    <div className="min-h-screen w-full bg-[url('/assets/fondo.png')] flex flex-col items-center p-4 md:p-8">
      <div className="bg-white bg-opacity-95 p-5 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Registro de Mascotas</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {mascotas.map((_, i) => (
            <div key={i}>
                <button
              
              className={`px-4 py-2 rounded-lg font-semibold ${i === tabActiva ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
              onClick={() => setTabActiva(i)}
            >
              {mascotas[i].nombre ? mascotas[i].nombre : "Nueva mascota"}
            </button>
            {mascotas.length > 1 && (
                <button
                  type="button"
                  className=" bg-w-full text-red-600 py-2 px-1 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition"
                  onClick={() => eliminarMascota(i)}
                >
                  X
                </button>
              )}
            </div>
          ))}
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600"
            onClick={agregarMascota}
          >
            + Agregar otra Mascota
          </button>
        </div>

        {/* Formulario por mascota */}
        {mascotas.map((mascota, index) =>
          index === tabActiva ? (
            <form key={index} className="space-y-4">
                {/* Subida de imagen */}
                {!mascota.urlFoto ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 ">
                    <div className="flex items-center justify-center w-full mb-8">
                    <input
                        type="file"
                        accept="image/png"
                        onChange={(e) => handleImageUpload(index, e)}
                        className="hidden"
                        id={`file-upload-${index}`}
                    />
                    <label
                        htmlFor={`file-upload-${index}`}
                        className="cursor-pointer h-52 w-52 object-cover rounded-full bg-gray-200 flex items-center justify-center text-center text-gray-600 border-dashed border-2 border-gray-300"
                    >
                        <span>Haz clic para subir una imagen</span>
                    </label>
                    </div>
                </div>
                
                ) : (
                <div className="flex flex-col my-2 items-center justify-center w-full relative">
                    <img
                    src={mascota.urlFoto}
                    alt={`Mascota ${index + 1}`}
                    className="h-52 w-52 object-cover rounded-full"
                    />
                    {/* Botón de eliminar imagen */}
                    <button
                    onClick={() => handleRemoveImage(index)}
                    className="bg-w-full text-red-600 py-2 px-2 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition"
                    >
                    Eliminar Imagen
                    </button>
                </div>
                )}

              {[
                ['nombre', 'Nombre']
              ].map(([name, label]) => (
                <div key={name} className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <label htmlFor={name} className="text-gray-700 font-semibold sm:w-40 top-0 relative">{label}<span className='text-red-500'>*</span></label>
                  <div className='flex flex-col w-full'>
                    <input
                      type={name.includes("fecha") ? "date" : "text"}
                      name={name}
                      placeholder='Nombre/Nick de la mascota'
                      value={mascota[name]}
                      onChange={(e) => handleChange(index, e)}
                      className="w-full bg-gray-100 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    {name == 'nombre' && intentadoGuardar && mascota[name] == '' ? (
                      <label className='pl-4 text-red-500'>Debes ingresar el nombre de la mascota</label>
                    ): null}
                  </div>
                </div>
              ))}

              {/* Sexo Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <label className="text-gray-700 font-semibold sm:w-40">Sexo<span className='text-red-500'>*</span></label>
                <div className='flex flex-col w-full'>
                  <select
                    name="sexo"
                    value={mascota.sexo}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full bg-gray-100 px-4 py-2 border rounded-lg"
                  >
                    {sexoOptions.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                  { intentadoGuardar && (mascota.sexo == 'Seleccionar...' || mascota.sexo == '') ? (
                    <label className='pl-4 text-red-500'>Debes seleccionar un valor</label>
                  ): null}
                </div>
              </div>


              {/* Especie Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <label className="text-gray-700 font-semibold sm:w-40">Especie<span className='text-red-500'>*</span></label>
                <div className='flex flex-col w-full'>
                  <select
                    name="especie"
                    value={mascota.especie}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full bg-gray-100 px-4 py-2 border rounded-lg"
                  >
                    {especieOptions.map(op => (
                      <option key={op} value={op}>{op}</option>
                    ))}
                  </select>
                  { intentadoGuardar && (mascota.especie == 'Seleccionar...' || mascota.especie == '') ? (
                    <label className='pl-4 text-red-500'>Debes seleccionar un valor</label>
                  ): null}
                </div>
              </div>

              {/* Raza Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                <label className="text-gray-700 font-semibold sm:w-40">Raza<span className='text-red-500'>*</span></label>
                <div className='flex flex-col w-full'>
                  <select
                    name="raza"
                    value={mascota.raza}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full bg-gray-100 px-4 py-2 border rounded-lg"
                  >
                    {mascota.especie != "Seleccionar..." ? (
                      razaOptions[mascota.especie || 'Otro'].map(op => (
                        <option key={op} value={op}>{op}</option>
                      ))
                    ) : ''}
                  </select>
                  { intentadoGuardar && (mascota.raza == 'Seleccionar...' || mascota.raza == '')  ? (
                      <label className='pl-4 text-red-500'>Debes seleccionar una raza</label>
                    ): null}
                  </div>
              </div>

                {[
                ['fechaNacimiento', 'Fecha de Nacimiento'],
                ['color', 'Color'],
                ['tamano', 'Tamaño'],
                ['numeroMicrochip', 'Número de Microchip'],
                ['fechaMicrochip', 'Fecha de Microchip'],
                ['fechaDesparasitacion', 'Fecha Desparasitación'],
                ['condicionesMedicas', 'Condiciones Médicas'],
                ['nombreVeterinario', 'Nombre Veterinario'],
                ['telefonoVeterinario', 'Teléfono Veterinario'],
                ['comportamiento', 'Comportamiento'],
                ['observaciones', 'Observaciones']
              ].map(([name, label]) => {
                const today = new Date();
                const year = today.getFullYear();
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                const maxDate = `${year}-${month}-${day}`;

                return(<div key={name} className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <label htmlFor={name} className="text-gray-700 font-semibold sm:w-40">{label}{label == 'Fecha de Nacimiento' ? (<span className='text-red-500'>*</span>): null}</label>
                  <input
                    type={name.includes("fecha") ? "date" : "text"}
                    name={name}
                    max={name.includes("fecha") ? maxDate : undefined}
                    placeholder={
                        label.includes("Color") ? "Negro,Blanco,Café,Dorado..." : 
                        label.includes("Tamaño") ? 'Pequeño,Mediano,Grande': 
                        label.includes("Número de Microchip") ? '123456789123456' : 
                        label.includes("Condiciones Médicas") ? 'Ingresa condiciones médicas si existen' :
                        label.includes("Nombre Veterinario") ? 'Ingresa el nombre del veterinario' :
                        label.includes("Teléfono Veterinario") ? 'Ingresa el número de teléfono del veterinario':
                        label.includes("Comportamiento") ? 'Pasivo,Cariñoso,Agresivo,Indiferente...':
                        label.includes("Observaciones") ? 'Ingresa alguna observación' : '' 
                    }
                    value={mascota[name]}
                    onChange={(e) => handleChange(index, e)}
                    className="w-full bg-gray-100 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  
                </div>)
              })}

              

              {/* Checkbox */}
              <div className="flex items-center space-x-2">
                <label className="text-gray-700 font-semibold">Esterilizado</label>
                <input
                  type="checkbox"
                  name="esterilizado"
                  checked={mascota.esterilizado}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-gray-700 font-semibold">Vacunas al Día</label>
                <input
                  type="checkbox"
                  name="vacunasAlDia"
                  checked={mascota.vacunasAlDia}
                  onChange={(e) => handleChange(index, e)}
                />
              </div>

            </form>
          ) : null
        )}

        {/* Guardar todas las mascotas */}
        <div className="pt-6">
          <button
            onClick={mascotas.length == 0 ? agregarMascota: guardarMascotas}
            className="w-full bg-musgo text-black py-2 rounded-lg font-semibold hover:bg-musgo2 transition duration-200"
          >
            {mascotas.length == 0 ? 'Agregar mascota': mascotas.length > 1 ? "Registrar todas las mascotas": "Registrar mascota"}
          </button>
        </div>
        <Modal isOpen={isModalOpen} onClose={() => closeModalHandler()}>
          
          <div className='mb-6'>
            <div className='flex justify-center items-center gap-2'>
              <FaCheck />
              <h2 className="text-xl font-bold ">
                {mascotas.length > 1 ? "Registro exitoso de mascotas!" : "Registro exitoso de mascota"}
              </h2>
            </div>
            <div className=' text-xs p-4'>
              <p> Ahora puedes descargar las imágenes QR de cada mascota o descargar un archivo
              comprimido con todas las imágenes.
              </p>
              <p>No te preocupes, puedes descargar los QR en otro momento desde el listado de mascotas!</p>
            </div>
          </div>
          <div className='flex flex-col h-40 overflow-y-auto'>
            {registroResponse.map((mascota) =>(
              <div key={mascota.idMascota} className='py-2'>
                <div className='flex justify-between items-center'>
                  <p className='pl-4'>{mascota.nombre}</p>
                  <button onClick={() =>descargarQR(mascota)} className="px-4 py-2 bg-blue-400 text-white rounded-lg font-semibold hover:bg-green-600" >Descargar QR</button>
                </div>
              </div>
            ))}
          </div>
          { registroResponse.length > 1 ? (
            <div className='flex justify-center pt-8'>
              <button onClick={() => generarZipConQRs()} className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600" >Descargar QR's en ZIP</button>
            </div>
            ) : null }
            <div className='flex mt-16 justify-center h-14 gap-2'>
              <button className='w-50 hover:bg-blue-600 hover:text-white rounded-lg p-2   cursor-pointer' 
                      title='Registrar Mascota'
                      onClick={() =>closeModalHandler()}>
                        <span>Registrar mas mascotas</span>
              </button>
              <button className='w-50 hover:bg-blue-600 hover:text-white rounded-lg p-2 bg-blue-300 cursor-pointer' 
                      title='Ir al menu principal'
                      onClick={() =>navigate('/mapa')}>
                        <div className='flex justify-center items-center'>
                          <span>Ir al menu principal</span>
                        </div>
              </button>
            </div>
        </Modal>
      </div>
    </div>
  );
};

export default RegistrarMascota;
