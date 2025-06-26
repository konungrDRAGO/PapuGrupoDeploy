import React from 'react';

const Spinner = ({ mensaje = "Cargando..." }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-75">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      <p className="mt-4 text-gray-600 text-sm">{mensaje}</p>
    </div>
  );
};

export default Spinner;
