import apiClient from './api';

// Interfaces
export interface Dispositivo {
  id: number;
  empresa_id: number;
  nombre_dispositivo: string;
  clave_identificador: string;
  nombre_area?: string | null;
  activo: boolean;
  fecha_creacion: string; // Mantener como string si la API devuelve así, o convertir a Date
  fecha_actualizacion: string;
}

export interface CreateDispositivoData {
  nombre_dispositivo: string;
  clave_identificador: string;
  nombre_area?: string;
  activo?: boolean;
}

export interface UpdateDispositivoData {
  nombre_dispositivo?: string;
  clave_identificador?: string;
  nombre_area?: string;
  activo?: boolean;
}

// Funciones del Servicio
export const crearDispositivo = async (data: CreateDispositivoData): Promise<Dispositivo> => {
  // El backend espera que el servicio envíe un objeto con la propiedad 'dispositivo'
  // según el controlador handleCrearDispositivo, pero el servicio backend
  // en sí devuelve directamente el dispositivo. Ajustamos aquí para que coincida con la respuesta esperada por el frontend.
  // La respuesta del backend es: { message: 'Dispositivo creado exitosamente.', dispositivo: nuevoDispositivo }
  const response = await apiClient.post<{ message: string, dispositivo: Dispositivo }>('/dispositivos', data);
  return response.data.dispositivo;
};

export const obtenerDispositivos = async (): Promise<Dispositivo[]> => {
  const response = await apiClient.get<Dispositivo[]>('/dispositivos');
  return response.data;
};

export const obtenerDispositivoPorId = async (id: string | number): Promise<Dispositivo> => {
  const response = await apiClient.get<Dispositivo>(`/dispositivos/${id}`);
  return response.data;
};

export const actualizarDispositivo = async (id: string | number, data: UpdateDispositivoData): Promise<Dispositivo> => {
  // Similar a crearDispositivo, ajustamos para la estructura de respuesta esperada.
  // La respuesta del backend es: { message: 'Dispositivo actualizado exitosamente.', dispositivo: dispositivoActualizado }
  const response = await apiClient.put<{ message: string, dispositivo: Dispositivo }>(`/dispositivos/${id}`, data);
  return response.data.dispositivo;
};

export const eliminarDispositivo = async (id: string | number): Promise<void> => {
  await apiClient.delete(`/dispositivos/${id}`);
  // No hay contenido en la respuesta (204)
};
