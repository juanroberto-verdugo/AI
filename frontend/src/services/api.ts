import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // Configurar VITE_API_BASE_URL en .env
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token JWT a las solicitudes
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // O donde sea que guardes el token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta (opcional, pero útil)
// Por ejemplo, para desloguear al usuario si el token es inválido (401 o 403)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Aquí podrías, por ejemplo, limpiar el localStorage y redirigir al login
      // localStorage.removeItem('authToken');
      // window.location.href = '/login';
      console.error("Error de autenticación/autorización. Token podría ser inválido o expirado.");
    }
    return Promise.reject(error);
  }
);

export default apiClient;
