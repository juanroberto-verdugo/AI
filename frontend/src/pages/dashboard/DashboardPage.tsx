import React from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // Usando alias @
import { Button } from '@/components/ui/button'; // Asumiendo que tienes un componente Button
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardPage: React.FC = () => {
  const { authState, logout: contextLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    contextLogout();
    navigate('/login'); // Redirige al login después del logout
  };

  // ProtectedRoute ya debería encargarse de esto, pero es una doble verificación.
  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido al Dashboard, {authState.user?.nombre_completo}!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Estás logueado como: {authState.user?.rol}</p>
          <p>Empresa ID: {authState.user?.empresa_id}</p>
          <p className="mt-4">Desde aquí podrás gestionar diferentes aspectos de tu cuenta y empresa.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Gestionar Dispositivos</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Administra los dispositivos IoT de tu empresa.</p>
            <Button asChild className="mt-4 w-full">
              <Link to="/dashboard/dispositivos">Ir a Dispositivos</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Placeholder para otras funcionalidades del dashboard */}
        <Card>
          <CardHeader>
            <CardTitle>Ver Datos (Próximamente)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Visualiza los datos recolectados por tus dispositivos.</p>
            <Button disabled className="mt-4 w-full">Próximamente</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración (Próximamente)</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ajusta la configuración de tu cuenta y empresa.</p>
            <Button disabled className="mt-4 w-full">Próximamente</Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button variant="destructive" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
};

export default DashboardPage;
