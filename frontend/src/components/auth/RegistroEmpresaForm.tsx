import React, { useState } from 'react';
import { registrarEmpresa, EmpresaData } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const RegistroEmpresaForm: React.FC = () => {
  const [formData, setFormData] = useState<EmpresaData>({
    nombre: '',
    identificador_fiscal: '',
    direccion: '',
    telefono: '',
    email_contacto: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!formData.nombre) {
      setError('El nombre de la empresa es obligatorio.');
      setLoading(false);
      return;
    }
    if (formData.email_contacto && !formData.email_contacto.includes('@')) {
        setError('Por favor, introduce un email de contacto válido.');
        setLoading(false);
        return;
    }

    try {
      const response = await registrarEmpresa(formData);
      setMessage(response.message || '¡Empresa registrada exitosamente!');
      console.log('Empresa registrada:', response.empresa);
      // Aquí podrías redirigir al siguiente paso, como registrar un usuario administrador para esta empresa,
      // o a una página de éxito.
      // Ejemplo: history.push(`/registrar-usuario?empresa_id=${response.empresa.id}`);
    } catch (err: any) {
      console.error('Error en registro de empresa:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido durante el registro de la empresa.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Registrar Nueva Empresa</CardTitle>
        <CardDescription>Completa los datos para crear una cuenta de empresa.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de la Empresa <span className="text-red-500">*</span></Label>
            <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} disabled={loading} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="identificador_fiscal">Identificador Fiscal (CIF/NIF)</Label>
              <Input id="identificador_fiscal" name="identificador_fiscal" value={formData.identificador_fiscal} onChange={handleChange} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email_contacto">Email de Contacto</Label>
              <Input id="email_contacto" name="email_contacto" type="email" value={formData.email_contacto} onChange={handleChange} disabled={loading} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} disabled={loading} />
            {/* Podría ser un textarea si se prefiere */}
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} disabled={loading} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch">
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {message && <p className="text-green-500 text-sm mb-4 text-center">{message}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Empresa'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegistroEmpresaForm;
