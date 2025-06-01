import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '@/services/api'; // Para configurar cabeceras globales si es necesario

// Definición del usuario (ajustar según lo que devuelve tu API)
export interface User {
  id: number;
  nombre_completo: string;
  email: string;
  rol: string;
  empresa_id: number;
  // ...otros campos que puedas tener
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType {
  authState: AuthState;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Cargar token y usuario desde localStorage al iniciar la app
    const token = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (token && storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        setAuthState({
          user: user,
          token: token,
          isAuthenticated: true,
        });
        // El interceptor de apiClient ya debería estar manejando la adición del token a las cabeceras
      } catch (error) {
        console.error("Error al parsear usuario desde localStorage:", error);
        // Limpiar localStorage si los datos están corruptos
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(userData));
    setAuthState({
      user: userData,
      token: token,
      isAuthenticated: true,
    });
    // El interceptor de apiClient se encarga de añadir el token a las futuras solicitudes
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    // El interceptor de apiClient dejará de añadir el token porque no lo encontrará en localStorage
    // Opcionalmente, podrías querer forzar la eliminación de la cabecera por defecto si la configuraste manualmente:
    // delete apiClient.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
