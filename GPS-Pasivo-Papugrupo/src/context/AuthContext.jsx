import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Importa js-cookie
import axiosAuth, { setupAxiosAuthInterceptors } from '../api/axiosAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Para manejar el estado de carga inicial
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const [authMessage, setAuthMessage] = useState('');


  const logout = useCallback(() => {
    console.log('Cerrando sesión...');
    Cookies.remove('token');
    localStorage.removeItem('userEmail');
    setUser(null);
    setIsSessionExpired(false);
    setAuthMessage('');
  },[]);

  const setSessionExpired = useCallback((message= 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.') => {
    console.log('Sesión expirada', message);
    setIsSessionExpired(true);
    setAuthMessage(message);
    logout();
  }, [logout]);
  
  const clearAuthMessage = useCallback(() => {
    setAuthMessage('');
    setIsSessionExpired(false); // Asegúrate de que el estado de expiración se reinicie
  }, []);

  useEffect(() => {
      // Pasa la función setSessionExpired al configurador de interceptores
      setupAxiosAuthInterceptors(setSessionExpired);
      // No es necesario retornar una función de limpieza específica aquí
      // porque setupAxiosAuthInterceptors ya maneja la eyección de handlers.
  }, [setSessionExpired]); // Dependencia: setSessionExpired

  // Verificar si hay sesión al cargar
  useEffect(() => {
    // Verificar el token al cargar la aplicación
    const token = Cookies.get('token');
    if (token) {
      // Aquí podrías también verificar la validez del token con una petición al backend
      // Por ahora asumimos que si hay token, el usuario está autenticado
      setUser({ email: localStorage.getItem('userEmail') || 'usuario' });
    }
    setIsLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    // Guardar email en localStorage si está disponible
    if (userData?.email) {
      localStorage.setItem('userEmail', userData.email);
    }
    Cookies.set('token', token, { expires: 7 }); // Guardar el token en cookies con expiración de 7 días
    setIsSessionExpired(false);
    setAuthMessage(''); // Limpiar mensaje de autenticación
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, isSessionExpired, authMessage, clearAuthMessage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}