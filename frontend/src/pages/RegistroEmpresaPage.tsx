import React from 'react';
import RegistroEmpresaForm from '@/components/auth/RegistroEmpresaForm'; // Usando alias @

const RegistroEmpresaPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-800">Crear Cuenta de Empresa</h1>
      </div>
      <RegistroEmpresaForm />
      <p className="mt-8 text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{' '}
        <a href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión aquí
        </a>
      </p>
    </div>
  );
};

export default RegistroEmpresaPage;
