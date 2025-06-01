import React from 'react';
import LoginForm from '@/components/auth/LoginForm'; // Usando alias @

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="mb-8 text-center">
        {/* Podrías añadir un logo o título de la aplicación aquí */}
        <h1 className="text-3xl font-bold text-gray-800">Bienvenido</h1>
      </div>
      <LoginForm />
      <p className="mt-8 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{' '}
        <a href="/registrar-empresa" className="font-medium text-primary hover:underline">
          Regístrate aquí
        </a>
        {/* Cambiar a Link de react-router-dom si se usa dentro de un BrowserRouter */}
      </p>
    </div>
  );
};

export default LoginPage;
