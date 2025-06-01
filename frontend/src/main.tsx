import React from 'react'; // Importar React explícitamente
import ReactDOM from 'react-dom/client'; // Cambiar importación de createRoot
import App from './App';
import './index.css'; // Tailwind styles
import { AuthProvider } from './contexts/AuthContext'; // Asegurar ruta correcta

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
