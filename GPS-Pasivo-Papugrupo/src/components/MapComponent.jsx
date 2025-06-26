import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapComponent = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // Tu API key de MapTiler
  const apiKey = import.meta.env.VITE_MAPTILER_KEY; 

  const puntos = [
    { lng: -71.23025, lat: -35.00155 },
    { lng: -71.25, lat: -35.01 },
    { lng: -71.22, lat: -34.99 },
  ];

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      console.log("Inicializando mapa...");
      
      try {
        // Especificar la URL del estilo correctamente
        const styleUrl = `https://api.maptiler.com/maps/streets/style.json?key=${apiKey}`;
        
        map.current = new maplibregl.Map({
          container: mapContainer.current,
          style: styleUrl, // URL completa al archivo style.json con la API key
          center: [-71.23025198746762, -35.00155919995224], 
          zoom: 9
        });
        
        console.log("Mapa inicializado");
        
        // Añadir controles de navegación
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        
        // Manejar eventos
        map.current.on('load', () => {
          console.log("Mapa cargado completamente");
    
            puntos.forEach((punto) => {
              // Crear un elemento HTML por punto
              const marcador = document.createElement('div');
              marcador.className = 'w-15 h-15 bg-no-repeat bg-contain cursor-pointer rounded-full border border-3 border-red-500';
              marcador.style.backgroundImage = 'url(/assets/marcador.webp)';
            
              new maplibregl.Marker({ element: marcador })
                .setLngLat([punto.lng, punto.lat])
                .addTo(map.current);
            });
        });
        
        map.current.on('error', (e) => {
          console.error("Error en el mapa:", e);
        });
      } catch (error) {
        console.error("Error al inicializar mapa:", error);
      }
    }
    
    return () => {
      if (map.current) {
        console.log("Eliminando mapa");
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div style={{width: '100%', height: '500px', position: 'relative'}}>
      <div 
        ref={mapContainer} 
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          border: '1px solid #ddd',
          borderRadius: '4px'
        }} 
      />
    </div>
  );
};

export default MapComponent;