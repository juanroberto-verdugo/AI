import apiClient from './api';

// Interfaces para datos y respuestas (pueden moverse a un archivo de tipos)
export interface EmpresaData {
  nombre: string;
  identificador_fiscal?: string;
  direccion?: string;
  telefono?: string;
  email_contacto?: string;
}

export interface UsuarioData {
  empresa_id: number;
  nombre_completo: string;
  email: string;
  password_sin_hash: string; // Coincide con el backend
  rol?: string;
}

export interface LoginCredentials {
  email: string;
  password_sin_hash: string; // Coincide con el backend
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    empresa_id: number;
    nombre_completo: string;
    email: string;
    rol: string;
    activo: boolean;
  };
}

export interface RegistroEmpresaResponse {
    message: string;
    empresa: {
        id: number;
        nombre: string;
        // ...otros campos de empresa que devuelve el backend
    };
}

export interface RegistroUsuarioResponse {
    message: string;
    usuario: {
        id: number;
        email: string;
        // ...otros campos de usuario que devuelve el backend
    };
}


// Funciones del servicio
export const registrarEmpresa = async (data: EmpresaData): Promise<RegistroEmpresaResponse> => {
  const response = await apiClient.post<RegistroEmpresaResponse>('/empresas', data); // Endpoint actualizado a /empresas
  return response.data;
};

export const registrarUsuario = async (data: UsuarioData): Promise<RegistroUsuarioResponse> => {
  const response = await apiClient.post<RegistroUsuarioResponse>('/usuarios/registrar', data);
  return response.data;
};

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>('/usuarios/login', credentials);
  // Aquí se podría guardar el token en localStorage si el login es exitoso
  // if (response.data.token) {
  //   localStorage.setItem('authToken', response.data.token);
  // }
  return response.data;
};

// Función para logout (ejemplo)
export const logout = (): void => {
  localStorage.removeItem('authToken');
  // Aquí se podría limpiar cualquier otro estado de usuario
  // y redirigir al login si es necesario.
};

// Función para obtener el usuario actual (ejemplo, si tienes un endpoint para ello)
// export const getCurrentUser = async () => {
//   return apiClient.get('/usuarios/perfil');
// };
