
import React, { useState, useEffect } from 'react';

const ReportConfirmationModal = ({ isOpen, onClose, onConfirm, initialData, isSubmitting }) => {
    const [reporterName, setReporterName] = useState('');
    const [reportComment, setReportComment] = useState('');

    // Sincroniza los datos iniciales (ej. latitud y longitud) para mostrar
    useEffect(() => {
        if (initialData) {
            setReporterName(initialData.nombreMascota || ''); // Puedes mostrar el nombre de la mascota por defecto o dejarlo vacío
            // Podrías cargar otros datos si fueran relevantes para mostrar en el modal
        }
    }, [initialData]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        onConfirm(reporterName, reportComment);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm relative">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                >
                    &times;
                </button>
                <h2 className="text-xl font-semibold mb-4 text-center">Confirmar Reporte de Ubicación</h2>

                <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                        Por favor, verifica la ubicación y, si lo deseas, añade información adicional.
                    </p>
                    <div className="flex flex-col">
                        <label htmlFor="reporterName" className="text-sm font-medium text-gray-700 mb-1">
                            Tu nombre (opcional):
                        </label>
                        <input
                            type="text"
                            id="reporterName"
                            value={reporterName}
                            onChange={(e) => setReporterName(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej. Juan Pérez"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="reportComment" className="text-sm font-medium text-gray-700 mb-1">
                            Comentario (opcional):
                        </label>
                        <textarea
                            id="reportComment"
                            rows="3"
                            value={reportComment}
                            onChange={(e) => setReportComment(e.target.value)}
                            className="p-2 border border-gray-300 rounded-md resize-y focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Ej. La encontré cerca del parque..."
                            disabled={isSubmitting}
                        ></textarea>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={isSubmitting}
                            className={`px-4 py-2 ${isSubmitting ? 'bg-green-400' : 'bg-green-500 hover:bg-green-600'} text-white rounded-md font-semibold transition duration-200`}
                        >
                            {isSubmitting ? 'Confirmando...' : 'Confirmar Reporte'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportConfirmationModal;