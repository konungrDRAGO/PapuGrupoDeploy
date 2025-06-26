import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Spinner from '../components/Spinner.jsx';

// Fix para los iconos por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapMascotaComponent = ({ mascotas, puntos, ultimaUbicacionGlobal, botonUltimaUbicacion }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [cargando, setCargando] = useState(true);
  const animationIntervalsRef = useRef({});
  const polylineRefs = useRef({});

  console.log(puntos);

  // Función para iniciar o reiniciar la animación
  const startLineAnimation = (orderedPoints, mascotaId) => {
    const intervalId = `animationInterval-${mascotaId}`;

    // Limpiar cualquier intervalo existente para esta mascota
    if (animationIntervalsRef.current[intervalId]) {
      clearInterval(animationIntervalsRef.current[intervalId]);
    }

    if (orderedPoints.length > 1) {
      let currentIndex = 0;

      // Crear o resetear la polilínea para esta mascota
      if (polylineRefs.current[mascotaId]) {
        map.current.removeLayer(polylineRefs.current[mascotaId]);
      }

      const initialLatLng = L.latLng(orderedPoints[0].latitud, orderedPoints[0].longitud);
      polylineRefs.current[mascotaId] = L.polyline([initialLatLng], {
        color: 'red',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      }).addTo(map.current);

      animationIntervalsRef.current[intervalId] = setInterval(() => {
        currentIndex = (currentIndex + 1) % orderedPoints.length;
        const currentLatLng = L.latLng(orderedPoints[currentIndex].latitud, orderedPoints[currentIndex].longitud);

        if (polylineRefs.current[mascotaId]) {
          const latlngs = polylineRefs.current[mascotaId].getLatLngs();
          
          if (latlngs.length <= currentIndex) {
            latlngs.push(currentLatLng);
          } else {
            // Reconstruir las coordenadas hasta el punto actual
            const newLatLngs = orderedPoints.slice(0, currentIndex + 1).map(p => 
              L.latLng(p.latitud, p.longitud)
            );
            polylineRefs.current[mascotaId].setLatLngs(newLatLngs);
            return;
          }
          
          polylineRefs.current[mascotaId].setLatLngs(latlngs);
        }
      }, 800);
    }
  };

  useEffect(() => {
    if (mapContainer.current && !map.current) {
      console.log("Inicializando mapa...");
      setCargando(true);

      try {
        console.log("ultimaUbicacionGlobal", ultimaUbicacionGlobal);
        const ubicacionCentro = ultimaUbicacionGlobal || {
          latitud: -35.41963979516562,
          longitud: -71.6741795041245,
        };

        let zoom = 9;
        if (botonUltimaUbicacion) {
          zoom = 15;
        }

        // Inicializar el mapa con Leaflet
        map.current = L.map(mapContainer.current).setView(
          [ubicacionCentro.latitud, ubicacionCentro.longitud], 
          zoom
        );

        // Agregar capa de tiles de OpenStreetMap (gratuita)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19
        }).addTo(map.current);

        // Alternativas de tiles gratuitos:
        // Carto Light: https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png
        // Carto Dark: https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png
        // Stamen Terrain: https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg

        console.log("Mapa inicializado");

        // Simular el evento 'load' después de un breve delay
        setTimeout(() => {
          console.log("Mapa cargado completamente");

          // Crea una copia invertida para no modificar el prop 'puntos' directamente
          const puntosInvertidos = [...puntos].reverse();

          // Agrupar los puntos por mascotaId
          const puntosPorMascota = puntosInvertidos.reduce((acc, punto) => {
            if (!acc[punto.mascotaId]) {
              acc[punto.mascotaId] = [];
            }
            acc[punto.mascotaId].push(punto);
            return acc;
          }, {});

          // Añadir marcadores para todos los puntos
          puntosInvertidos.forEach((punto) => {
            const urlFoto = mascotas[punto.mascotaId]?.urlFoto || '/assets/mascotaPorDefecto.png';
            
            // Crear icono personalizado con la foto de la mascota
            const customIcon = L.divIcon({
              html: `
                <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; border: 4px solid red; background-image: url(${urlFoto}); background-size: cover; background-position: center; cursor: pointer;"></div>
                  <div style="font-size: 12px; background: white; padding: 2px 4px; border-radius: 4px; margin-top: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                    ${punto.dia}/${punto.mes} ${punto.hora}:${punto.minuto}
                  </div>
                </div>
              `,
              className: 'custom-marker',
              iconSize: [40, 60],
              iconAnchor: [20, 60]
            });

            L.marker([punto.latitud, punto.longitud], { icon: customIcon })
              .addTo(map.current);
          });

          // Inicializar animaciones para cada mascota
          Object.keys(puntosPorMascota).forEach(mascotaId => {
            const puntosDeEstaMascota = puntosPorMascota[mascotaId];
            startLineAnimation(puntosDeEstaMascota, mascotaId);
          });

          setCargando(false);
        }, 500);

      } catch (error) {
        console.error("Error al inicializar mapa:", error);
        setCargando(false);
      }
    }

    return () => {
      if (map.current) {
        console.log("Eliminando mapa");
        // Limpiar todos los intervalos de animación
        Object.values(animationIntervalsRef.current).forEach(clearInterval);
        animationIntervalsRef.current = {};
        polylineRefs.current = {};
        map.current.remove();
        map.current = null;
      }
    };
  }, [mascotas, puntos]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {cargando && (
        <Spinner mensaje="Cargando ubicaciones..." />
      )}
      <div
        ref={mapContainer}
        style={{
          zIndex:5,
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

export default MapMascotaComponent;