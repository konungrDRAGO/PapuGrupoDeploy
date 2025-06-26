import React, { useState,useEffect } from 'react';
import { obtenerMascotaQR,reportarMascota } from '../services/mascota.service.js';
import { useParams } from 'react-router-dom';
import ModalReporte from '../components/ModalReporte.jsx';
import Spinner from '../components/Spinner.jsx';

const ReportarMascota = () => {

    const params = useParams();
    const idMascota = params.uuid ?? '';

    const [formData, setFormData] = useState({
        latitud: '0.0000',
        longitud: '0.0000',
        nombreMascota: '',
        raza: '',
        edad: '',
        imagenBase64: '',
        nombreDueno: '',
        telefonoDueno: '' 
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [cargando, setCargando] = useState(true);

    const fetchMascota = async () => {
        try {
            const data = await obtenerMascotaQR(idMascota);
            console.log(data);

            // Calcular edad
            const edadCalculada = calcularEdad(data.fechaNacimiento);

            // Actualizar datos en formData
            setFormData(prev => ({
                ...prev, // mantiene latitud y longitud actual
                nombreMascota: data.nombre || '',
                raza: data.raza || '',
                edad: edadCalculada,
                imagenBase64: data.urlFoto || '',
                nombreDueno: data.nombreDueno || '',  // Nuevos campos
                telefonoDueno: data.telefonoDueno || ''
            }));

        } catch (err) {
            console.error('Error al obtener la mascota:', err);
        }
    };

    const handleOpenModal = (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitSuccess('');
        setShowModal(true);
    };

    const handleConfirmReport = async (nombreReportante, comentario) => {
        setSubmitError('');
        setSubmitSuccess('');

        try {
            setIsSubmitting(true);
            await reportarMascota(
                idMascota,
                Number(formData.latitud),
                Number(formData.longitud),
                nombreReportante || '',
                comentario || '' 
            );
            setSubmitSuccess('Ubicación y detalles registrados exitosamente');
            setShowModal(false);
        } catch (error) {
            console.error('Error al reportar:', error);
            setSubmitError('Error al reportar ubicación de mascota. Intente nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };


    /*const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitSuccess('');

        try {
            setIsSubmitting(true);
            await reportarMascota(idMascota,Number(formData.latitud),Number(formData.longitud));
            setSubmitSuccess('Ubicación registrada exitosamente');
        } catch (error) {
            console.error('Error al reportar:', error);
            setSubmitError('Error al reportar ubicación de mascota. Intente nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };*/

    useEffect(() => {
        const pedirUbicacionYFetchMascota = async () => {
            if (!navigator.geolocation) {
                console.error('Geolocalización no soportada');
                fetchMascota(); 
                return;
            }
    
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    console.log('Latitud:', latitude, 'Longitud:', longitude);
    
                    setFormData(prev => ({
                        ...prev,
                        latitud: latitude.toString(),
                        longitud: longitude.toString(),
                    }));
                    
                    fetchMascota();
                    setCargando(false);
                },
                (error) => {
                    console.error('Error de ubicación:', error);
                    fetchMascota(); 
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        };
    
        pedirUbicacionYFetchMascota();
    }, [idMascota]);
    
    

    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return 'Null';

        const fechaNac = new Date(fechaNacimiento); // Si viene como timestamp compatible
        const hoy = new Date();

        let edad = hoy.getFullYear() - fechaNac.getFullYear();
        const mes = hoy.getMonth() - fechaNac.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
            edad--;
        }

        return `${edad} años`;
    };

    return (
        <div className="min-h-screen w-full bg-[url('/assets/fondo.png')] flex items-center justify-center p-4 md:p-8">
            {cargando && (  
                <Spinner mensaje="Cargando ubicacion..." />
            )}
            <div className="bg-white bg-opacity-95 p-5 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-md">

                
                <div className="flex justify-center mb-4">
                    {formData.imagenBase64 !== '' && (
                        <img 
                        src={formData.imagenBase64} 
                        alt="Imagen de mascota" 
                        className="w-fit h-[15vh] object-contain rounded-2xl"
                        />
                    )}
                </div>

                <form className="space-y-4" onSubmit={handleOpenModal}>
                    <div className="text-center text-gray-600 font-semibold">
                        Información de ubicación
                    </div>

                    <div className="flex space-x-2 items-center">
                        <p className='w-1/4'>Latitud</p>
                        <input
                            type="text"
                            name="latitud"
                            value={formData.latitud}
                            disabled
                            className="w-1/2 p-2 border rounded-lg bg-gray-100 text-gray-500"
                        />
                        <p className='w-1/4'>Longitud</p>
                        <input
                            type="text"
                            name="longitud"
                            value={formData.longitud}
                            disabled
                            className="w-1/2 p-2 border rounded-lg bg-gray-100 text-gray-500"
                        />
                    </div>

                    <div className="text-center text-gray-600 font-semibold pt-4">
                        Información de Mascota
                    </div>
                    <div className='flex flex-row items-center w-full'>
                        <p className='w-1/4'>Nombre</p>
                        <input
                            type="text"
                            name="nombreMascota"
                            value={formData.nombreMascota}
                            disabled
                            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500"
                        />
                    </div>
                    <div className='flex flex-row items-center w-full'>
                        <p className='w-1/4'>Raza</p>
                        <input
                            type="text"
                            name="raza"
                            value={formData.raza}
                            disabled
                            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500"
                        />
                    </div>
                    <div className='flex flex-row items-center w-full'>
                        <p className='w-1/4'>Edad</p>
                        <input
                            type="text"
                            name="edad"
                            value={formData.edad}
                            disabled
                            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500"
                        />
                    </div>
                    
                    <div className="text-center text-gray-600 font-semibold pt-4">
                        Información del Dueño
                    </div>
                    <div className='flex flex-row items-center w-full'>
                        <p className='w-1/4'>Nombre</p>
                        <input
                            type="text"
                            name="nombreDueno"
                            value={formData.nombreDueno}
                            disabled
                            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500"
                        />
                    </div>
                    <div className='flex flex-row items-center w-full'>
                        <p className='w-1/4'>Teléfono</p>
                        <input
                            type="text"
                            name="telefonoDueno"
                            value={formData.telefonoDueno}
                            disabled
                            className="w-full p-2 border rounded-lg bg-gray-100 text-gray-500"
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit" // Mantener como submit para que `onSubmit` del form se active
                            disabled={isSubmitting}
                            className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-green-200 hover:bg-green-300'} text-black py-2 rounded-lg font-semibold transition duration-200`}
                        >
                            {isSubmitting ? 'Cargando...' : 'Reportar Ubicación'}
                        </button>
                    </div>
                    <div className='h-[5vh]'>
                    {submitSuccess && (
                        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg text-center">
                            {submitSuccess}
                        </div>
                    )}
                    {submitError && (
                        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg text-center">
                            {submitError}
                        </div>
                    )}
                    </div>
                </form>
                <ModalReporte
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onConfirm={handleConfirmReport}
                    initialData={formData} // Pasa formData al modal si necesitas mostrar algo de la mascota allí
                    isSubmitting={isSubmitting}
                />
            </div>
        </div>
    );
};

export default ReportarMascota;
