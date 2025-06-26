import axios from 'axios';
import Cookies from 'js-cookie';

const axiosAuth = axios.create({
  baseURL: import.meta.env.VITE_API_BACKEND,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosAuth.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const setupAxiosAuthInterceptors = (onSessionExpired) => {
    // Si ya existe un interceptor de respuesta, lo removemos para evitar duplicados
    // Esto es útil si la función se llama varias veces (aunque no debería en este caso)
    axiosAuth.interceptors.response.eject(axiosAuth.interceptors.response.handlers[0]?.id); // Ejecta el primer handler si existe

    axiosAuth.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                console.log("401 detectado por axiosAuth interceptor. Llamando onSessionExpired.");
                onSessionExpired('Tu sesión ha caducado. Por favor, inicia sesión de nuevo.');
                // No es necesario lanzar el error, onSessionExpired ya maneja la redirección y el estado.
                // Sin embargo, si quieres que los componentes que hacen la llamada también manejen el error,
                // puedes devolver Promise.reject(error);
            }
            return Promise.reject(error); // Rechaza la promesa para que el error se propague a la capa de servicio si es necesario
        }
    );
};

export default axiosAuth;