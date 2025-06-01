import React from 'react';
import RegistroUsuarioForm from '@/components/auth/RegistroUsuarioForm'; // Usando alias @
import { Link } from 'react-router-dom'; // Para navegación

const RegistroUsuarioPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Crear Cuenta de Usuario</h1>
      </div>
      <RegistroUsuarioForm />
      <p className="mt-8 text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Inicia sesión aquí
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-gray-600">
        ¿Necesitas registrar una empresa primero?{' '}
        <Link to="/registrar-empresa" className="font-medium text-primary hover:underline">
          Registra tu empresa
        </Link>
      </p>
    </div>
  );
};

export default RegistroUsuarioPage;
