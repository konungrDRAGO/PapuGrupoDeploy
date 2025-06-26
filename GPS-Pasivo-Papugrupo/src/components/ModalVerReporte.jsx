import React, { useRef, useEffect } from 'react';

const ModalVerReporte = ({ reporte, closeModal, nombreMascota }) => {
  const modalRef = useRef(null);

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

        <div className="flex flex-col sm:flex-row">

          {/* Datos de la mascota */}
          <div className="w-full  p-4">
            <h2 className="text-2xl font-semibold mb-4 text-center">Reporte de ubicación</h2>
            <h2 className="text-2xl font-semibold mb-4 text-center">{nombreMascota}</h2>

            <div className="space-y-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Fecha:</strong> {`${reporte.dia}/${reporte.mes}/${reporte.anio} ${reporte.hora}:${reporte.minuto}:${reporte.segundo}`}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Coordenadas:</strong> {reporte.latitud || 'N/A'}, {reporte.longitud || 'N/A'}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Nombre reportante:</strong> {reporte.nombreReportante || 'N/A'}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                    <strong>Comentario:</strong> 
                    <div className="break-words whitespace-pre-wrap">
                        {reporte.comentario || 'N/A'}
                    </div>
                </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default ModalVerReporte;