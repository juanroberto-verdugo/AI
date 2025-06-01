import React from 'react';
import { BrowserRouter, Routes, Route, Link, Outlet, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistroEmpresaPage from './pages/RegistroEmpresaPage';
import RegistroUsuarioPage from './pages/RegistroUsuarioPage';
import DashboardPage from './pages/dashboard/DashboardPage'; // Importar DashboardPage
import DispositivosPage from './pages/dashboard/DispositivosPage'; // Importar DispositivosPage
import './index.css'; // Asegúrate que los estilos globales, incluyendo Tailwind, se importen

import { useAuth } from './contexts/AuthContext'; // Importar useAuth
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para el logout
import ProtectedRoute from './components/router/ProtectedRoute'; // Importar ProtectedRoute

// Un componente simple para un layout general con navegación
const MainLayout: React.FC = () => {
  const { authState, logout: contextLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    contextLogout(); // Llama al logout del contexto (que también limpia localStorage)
    navigate('/login'); // Redirige al login
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <nav className="container mx-auto flex items-center justify-between">
          <Link to={authState.isAuthenticated ? "/dashboard" : "/"} className="text-xl font-bold hover:opacity-90">
            Gestor Empresas {authState.user ? `(${authState.user.rol} ${authState.user.nombre_completo})` : ''}
          </Link>
          <div className="space-x-4">
            {authState.isAuthenticated ? (
              <>
                <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                <button onClick={handleLogout} className="hover:underline bg-transparent border-none text-primary-foreground">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">Login</Link>
                <Link to="/registrar-empresa" className="hover:underline">Registrar Empresa</Link>
                <Link to="/registrar-usuario" className="hover:underline">Registrar Usuario</Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <Outlet /> {/* Aquí se renderizarán las rutas anidadas */}
      </main>
      <footer className="bg-gray-100 text-center p-4 text-sm text-gray-600 border-t">
        &copy; {new Date().getFullYear()} Mi Proyecto. Todos los derechos reservados.
      </footer>
    </div>
  );
};

// La definición de DashboardPage se movió a su propio archivo.

function App() {
  // El AuthProvider ya está en main.tsx
  const { authState } = useAuth(); // Para la redirección inicial

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registrar-empresa" element={<RegistroEmpresaPage />} />
          <Route path="/registrar-usuario" element={<RegistroUsuarioPage />} />

          {/* Rutas Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/dispositivos" element={<DispositivosPage />} /> {/* Nueva ruta */}
            {/* <Route path="/otra-ruta-protegida" element={<OtraPaginaProtegida />} /> */}
          </Route>

          {/* Redirección inicial basada en el estado de autenticación */}
          <Route
            path="/"
            element={
              authState.isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            }
          />

          <Route path="*" element={
            <div className="text-center mt-10">
              <h1 className="text-4xl font-bold">404</h1>
              <p className="text-xl">Página No Encontrada</p>
              <Link to="/" className="text-primary hover:underline mt-4 inline-block">Volver al inicio</Link>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// El import de ProtectedRoute ya se añadió arriba.

export default App;
