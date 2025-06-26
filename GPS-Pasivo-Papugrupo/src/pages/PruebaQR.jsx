import React, { useState, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react'; 



const PruebaQR = () => {
  const [inputTexto, setInputTexto] = useState('');
  const [textoQR, setTextoQR] = useState('');
  const qrRef = useRef(null);

  const generarQR = () => {
    setTextoQR(inputTexto);
  };

  const descargarQR = () => {
    const canvas = qrRef.current.querySelector('canvas');
    const url = canvas.toDataURL('image/png');

    const link = document.createElement('a');
    link.href = url;
    link.download = `qr-${textoQR || 'vacio'}.png`;
    link.click();
  };

  return (
    <div className="p-4 flex flex-col items-center gap-4">
      <h2 className="text-xl font-semibold">QR</h2>

      <input
        type="text"
        placeholder="Escribe el texto para el QR"
        value={inputTexto}
        onChange={(e) => setInputTexto(e.target.value)}
        className="border px-4 py-2 rounded w-full max-w-md"
      />

      <button
        onClick={generarQR}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Generar QR
      </button>

      {textoQR && (
        <>
          <div ref={qrRef} className="mt-4">
            <QRCodeCanvas value={textoQR} size={256} includeMargin />
          </div>
          <button
            onClick={descargarQR}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Descargar QR
          </button>
        </>
      )}
    </div>
  );
};

export default PruebaQR;
