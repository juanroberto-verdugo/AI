import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Usando alias @

const ProtectedRoute: React.FC = () => {
  const { authState } = useAuth();
  const location = useLocation();

  if (!authState.isAuthenticated) {
    // Si el usuario no está autenticado, redirigir a la página de login.
    // Guardar la ubicación actual para que podamos redirigir de vuelta después del login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si el usuario está autenticado, renderizar el contenido de la ruta solicitada.
  return <Outlet />;
  // Alternativamente, si se usa la API de `children`:
  // return <>{children}</>;
};

export default ProtectedRoute;
