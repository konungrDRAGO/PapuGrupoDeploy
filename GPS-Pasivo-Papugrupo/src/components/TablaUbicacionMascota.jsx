// src/components/TablaUbicacionMascota.jsx
import React, { useState, useMemo } from 'react';
import ModalVerReporte from './ModalVerReporte.jsx';

const TablaUbicacionMascota = ({ datos, mascotas }) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [sortAsc, setSortAsc] = useState(true);
    const itemsPerPage = 10;
    const [reporteParaModalReporte, setReporteParaModalReporte] = useState('');
    const [nombreParaModalReporte, setNombreParaModalReporte] = useState('');


    const sortedDatos = useMemo(() => {
        return [...datos].sort((a, b) => {
            const fechaA = new Date(`${a.anio}-${a.mes}-${a.dia}T${a.hora}:${a.minuto}:${a.segundo}`);
            const fechaB = new Date(`${b.anio}-${b.mes}-${b.dia}T${b.hora}:${b.minuto}:${b.segundo}`);
            return sortAsc ? fechaA - fechaB : fechaB - fechaA;
        });
    }, [datos, sortAsc]);

    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = sortedDatos.slice(startIndex, endIndex);

    const totalPages = Math.ceil(datos.length / itemsPerPage);

    const handleNext = () => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };

    const handlePrevious = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    const toggleSort = () => {
        setSortAsc(!sortAsc);
    };

    const abrirModalReporte = (reporte, nombreMascota) => {
        setReporteParaModalReporte(reporte); 
        setNombreParaModalReporte(nombreMascota || ''); // Asegurarse de que el nombre esté definido
    }

    const cerrarModalReporte = () => {
        setReporteParaModalReporte(''); 
    }
    
    return (
        <div className="overflow-x-auto">
          <div className="border border-gray-200 rounded-md bg-white">
            {/* Contenedor para la tabla con scroll */}
            <div className="max-h-80 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-700 cursor-pointer w-[28%]"
                      onClick={toggleSort}
                    >
                      Fecha {sortAsc ? '↑' : '↓'}
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[32%]">Coordenadas</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[20%]">Mascota</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-[20%]">Acciones</th>
                  </tr>
                </thead>
                
                {/* Cuerpo de la tabla sin clases de overflow */}
                <tbody className="divide-y divide-gray-200">
                  {pageData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-700 w-[28%]">
                        {`${item.dia}/${item.mes}/${item.anio} ${item.hora}:${item.minuto}:${item.segundo}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 w-[32%]">{item.latitud},{item.longitud}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 w-[20%]">{mascotas[item.mascotaId]?.nombre || 'Desconocida'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 w-[20%]">
                        <button 
                          onClick={() => abrirModalReporte(item, mascotas[item.mascotaId]?.nombre)} 
                          className="text-blue-600 hover:underline"
                        >
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      
            {/* Footer de paginación */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
              <button
                onClick={handlePrevious}
                disabled={currentPage === 0}
                className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {currentPage + 1} de {totalPages}
              </span>
              <button
                onClick={handleNext}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
          </div>
          
          {/* Modal */}
          {reporteParaModalReporte && (
            <ModalVerReporte 
              reporte={reporteParaModalReporte} 
              closeModal={cerrarModalReporte} 
              nombreMascota={nombreParaModalReporte} 
            />
          )}
        </div>
      );
    
};
    
export default TablaUbicacionMascota;