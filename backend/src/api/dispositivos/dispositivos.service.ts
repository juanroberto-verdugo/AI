import pool from '../../db';
import { QueryResult } from 'pg';
import { subscribeToTopic, unsubscribeFromTopic } from '../../services/mqttService'; // Importar funciones MQTT

// Interfaces
export interface Dispositivo {
  id: number;
  empresa_id: number;
  nombre_dispositivo: string;
  clave_identificador: string;
  nombre_area?: string | null;
  activo: boolean;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface DispositivoData {
  nombre_dispositivo: string;
  clave_identificador: string;
  nombre_area?: string;
  activo?: boolean;
}

// Servicio
const crearDispositivo = async (data: DispositivoData, empresaIdAuth: number): Promise<Dispositivo> => {
  const { nombre_dispositivo, clave_identificador, nombre_area, activo = true } = data;

  if (!nombre_dispositivo || !clave_identificador) {
    throw new Error('Nombre del dispositivo y clave identificadora son requeridos.');
  }

  const query = `
    INSERT INTO dispositivos (empresa_id, nombre_dispositivo, clave_identificador, nombre_area, activo)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [empresaIdAuth, nombre_dispositivo, clave_identificador, nombre_area, activo];

  try {
    const result: QueryResult<Dispositivo> = await pool.query(query, values);
    const nuevoDispositivo = result.rows[0];

    if (nuevoDispositivo.activo) {
      subscribeToTopic(nuevoDispositivo.clave_identificador);
    }
    return nuevoDispositivo;
  } catch (error: any) {
    if (error.code === '23505' && error.constraint === 'dispositivos_clave_identificador_key') {
      throw new Error(`La clave identificadora '${clave_identificador}' ya está en uso.`);
    }
    console.error("Error en crearDispositivo:", error);
    throw error;
  }
};

const obtenerDispositivosPorEmpresa = async (empresaIdAuth: number): Promise<Dispositivo[]> => {
  const query = 'SELECT * FROM dispositivos WHERE empresa_id = $1 ORDER BY fecha_creacion DESC;';
  const result: QueryResult<Dispositivo> = await pool.query(query, [empresaIdAuth]);
  return result.rows;
};

// Esta función auxiliar no necesita interactuar con MQTT directamente.
const obtenerDispositivoPorIdInterno = async (id: number): Promise<Dispositivo | null> => {
    const query = 'SELECT * FROM dispositivos WHERE id = $1;';
    const result: QueryResult<Dispositivo> = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
};


const obtenerDispositivoPorId = async (id: number, empresaIdAuth: number): Promise<Dispositivo | null> => {
  const dispositivo = await obtenerDispositivoPorIdInterno(id);
  if (!dispositivo) {
    return null;
  }
  if (dispositivo.empresa_id !== empresaIdAuth) {
    return null;
  }
  return dispositivo;
};

const actualizarDispositivo = async (id: number, data: Partial<Omit<DispositivoData, 'empresa_id'>>, empresaIdAuth: number): Promise<Dispositivo | null> => {
  const dispositivoExistente = await obtenerDispositivoPorId(id, empresaIdAuth);
  if (!dispositivoExistente) {
    return null;
  }

  // Guardar estado original para comparación
  const claveOriginal = dispositivoExistente.clave_identificador;
  const activoOriginal = dispositivoExistente.activo;

  // Construir la consulta de actualización dinámicamente (igual que antes)
  const fieldsToUpdate: string[] = [];
  const values: any[] = [];
  let valueCount = 1;

  // ... (lógica de construcción de query idéntica a la versión anterior)
  if (data.nombre_dispositivo !== undefined) {
    fieldsToUpdate.push(`nombre_dispositivo = $${valueCount++}`);
    values.push(data.nombre_dispositivo);
  }
  if (data.clave_identificador !== undefined) {
    fieldsToUpdate.push(`clave_identificador = $${valueCount++}`);
    values.push(data.clave_identificador);
  }
  if (data.nombre_area !== undefined) {
    fieldsToUpdate.push(`nombre_area = $${valueCount++}`);
    values.push(data.nombre_area);
  }
  if (data.activo !== undefined) {
    fieldsToUpdate.push(`activo = $${valueCount++}`);
    values.push(data.activo);
  }

  if (fieldsToUpdate.length === 0) {
    return dispositivoExistente;
  }

  const query = `
    UPDATE dispositivos
    SET ${fieldsToUpdate.join(', ')}
    WHERE id = $${valueCount++} AND empresa_id = $${valueCount++}
    RETURNING *;
  `;
  values.push(id, empresaIdAuth);

  try {
    const result: QueryResult<Dispositivo> = await pool.query(query, values);
    if (result.rows.length === 0) return null;

    const dispositivoActualizado = result.rows[0];

    // Lógica de suscripción/desuscripción MQTT
    const claveNueva = dispositivoActualizado.clave_identificador;
    const activoNuevo = dispositivoActualizado.activo;

    if (claveOriginal !== claveNueva) {
      if (activoOriginal) { // Si estaba activo con la clave vieja
        unsubscribeFromTopic(claveOriginal);
      }
      if (activoNuevo) { // Si está activo con la clave nueva
        subscribeToTopic(claveNueva);
      }
    } else { // La clave no cambió, solo pudo cambiar el estado activo
      if (activoOriginal !== activoNuevo) {
        if (activoNuevo) {
          subscribeToTopic(claveNueva); // Se activó
        } else {
          unsubscribeFromTopic(claveNueva); // Se desactivó
        }
      }
    }
    return dispositivoActualizado;
  } catch (error: any) {
    if (error.code === '23505' && error.constraint === 'dispositivos_clave_identificador_key') {
      throw new Error(`La clave identificadora '${data.clave_identificador}' ya está en uso por otro dispositivo.`);
    }
    console.error("Error en actualizarDispositivo:", error);
    throw error;
  }
};

const eliminarDispositivo = async (id: number, empresaIdAuth: number): Promise<boolean> => {
  const dispositivoExistente = await obtenerDispositivoPorId(id, empresaIdAuth);
  if (!dispositivoExistente) {
    return false;
  }

  const query = 'DELETE FROM dispositivos WHERE id = $1 AND empresa_id = $2;';
  const result: QueryResult = await pool.query(query, [id, empresaIdAuth]);

  if (result.rowCount !== null && result.rowCount > 0) {
    if (dispositivoExistente.activo) {
      unsubscribeFromTopic(dispositivoExistente.clave_identificador);
    }
    return true;
  }
  return false;
};

export default {
  crearDispositivo,
  obtenerDispositivosPorEmpresa,
  obtenerDispositivoPorId,
  actualizarDispositivo,
  eliminarDispositivo,
};
