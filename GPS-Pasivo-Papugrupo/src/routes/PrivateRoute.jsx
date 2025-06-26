import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
//import toast from 'react-hot-toast';

export function PrivateRoute({ children }) {
  const { user, isLoading, isSessionExpired, authMessage, clearAuthMessage } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
          <p className="ml-3 text-gray-700">Cargando...</p>
      </div>
    );
  }

  if (!user || isSessionExpired) {
    console.log("PrivateRoute: Redirigiendo al landing con mensaje. User:", user, "isSessionExpired:", isSessionExpired);
    // Redirige al landing page (que es "/")
    return <Navigate 
            to="/" 
            replace
            state={{ sessionExpiredMessage: authMessage || 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.' }}
            />;
  }

  return children;
}