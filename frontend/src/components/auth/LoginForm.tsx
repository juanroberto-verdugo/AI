import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { login as authServiceLogin, LoginCredentials, LoginResponse } from '@/services/authService'; // Renombrar login para evitar conflicto
import { useAuth } from '@/contexts/AuthContext'; // Importar useAuth
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // const [message, setMessage] = useState<string | null>(null); // Mensaje de éxito ya no es tan necesario aquí

  const navigate = useNavigate(); // Hook para navegación
  const { login: contextLogin } = useAuth(); // Obtener función login del contexto

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    // setMessage(null);
    setLoading(true);

    if (!email || !password) {
      setError('Por favor, ingresa tu email y contraseña.');
      setLoading(false);
      return;
    }

    const credentials: LoginCredentials = { email, password_sin_hash: password };

    try {
      const response: LoginResponse = await authServiceLogin(credentials);
      // Llamar al login del contexto para actualizar el estado global y localStorage
      contextLogin(response.usuario, response.token);
      // setMessage(`Login exitoso! Redirigiendo...`); // Opcional: mostrar mensaje antes de redirigir
      console.log('Usuario logueado:', response.usuario);
      navigate('/dashboard'); // Redirigir al dashboard
    } catch (err: any) {
      console.error('Error de login:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Ocurrió un error desconocido durante el login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder a tu cuenta.</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch">
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {/* {message && <p className="text-green-500 text-sm mb-4 text-center">{message}</p>} */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
