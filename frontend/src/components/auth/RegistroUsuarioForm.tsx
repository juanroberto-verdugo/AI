import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // Para leer empresa_id de la URL
import { registrarUsuario, UsuarioData } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const RegistroUsuarioForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<Omit<UsuarioData, 'password_sin_hash'> & { password: '', confirm_password: '' }>({
    empresa_id: parseInt(searchParams.get('empresa_id') || '', 10) || 0,
    nombre_completo: '',
    email: '',
    password: '',
    confirm_password: '',
    rol: 'admin_empresa', // Por defecto, el primer usuario de una empresa podría ser admin
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const empresaIdFromUrl = searchParams.get('empresa_id');
    if (empresaIdFromUrl) {
      setFormData(prev => ({ ...prev, empresa_id: parseInt(empresaIdFromUrl, 10) }));
    }
  }, [searchParams]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: name === 'empresa_id' ? parseInt(value, 10) || 0 : value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (!formData.empresa_id) {
      setError('El ID de la empresa es obligatorio. Si registraste una empresa, su ID debería aparecer aquí.');
      setLoading(false);
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }
    if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
    }
    if (!formData.email.includes('@')) {
        setError('Por favor, introduce un email válido.');
        setLoading(false);
        return;
    }

    const finalUsuarioData: UsuarioData = {
      empresa_id: formData.empresa_id,
      nombre_completo: formData.nombre_completo,
      email: formData.email,
      password_sin_hash: formData.password,
      rol: formData.rol,
    };

    try {
      const response = await registrarUsuario(finalUsuarioData);
      setMessage(response.message || '¡Usuario registrado exitosamente!');
      console.log('Usuario registrado:', response.usuario);
      // Aquí podrías redirigir al login o a un dashboard si el login es automático
      // window.location.href = '/login';
    } catch (err: any) {
      console.error('Error en registro de usuario:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido durante el registro del usuario.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Registrar Nuevo Usuario</CardTitle>
        <CardDescription>
          Completa tus datos para crear una cuenta. {formData.empresa_id ? `Asociado a Empresa ID: ${formData.empresa_id}` : 'Necesitas un ID de empresa.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="empresa_id">ID de Empresa <span className="text-red-500">*</span></Label>
            <Input id="empresa_id" name="empresa_id" type="number" value={formData.empresa_id || ''} onChange={handleChange} disabled={loading || searchParams.get('empresa_id') !== null} required />
            <p className="text-xs text-muted-foreground">Este ID lo obtienes al registrar tu empresa.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nombre_completo">Nombre Completo <span className="text-red-500">*</span></Label>
            <Input id="nombre_completo" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} disabled={loading} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={loading} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} disabled={loading} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmar Contraseña <span className="text-red-500">*</span></Label>
              <Input id="confirm_password" name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} disabled={loading} required />
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="rol">Rol (ej. admin_empresa, usuario)</Label>
            <Input id="rol" name="rol" value={formData.rol} onChange={handleChange} disabled={loading} placeholder="usuario" />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch">
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {message && <p className="text-green-500 text-sm mb-4 text-center">{message}</p>}
          <Button type="submit" className="w-full" disabled={loading || !formData.empresa_id}>
            {loading ? 'Registrando...' : 'Registrar Usuario'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default RegistroUsuarioForm;
