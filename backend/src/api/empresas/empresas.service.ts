import pool from '../../db'; // Ajusta la ruta según tu estructura de db.ts
import { QueryResult } from 'pg';

export interface Empresa {
  id: number;
  nombre: string;
  identificador_fiscal?: string | null;
  direccion?: string | null;
  telefono?: string | null;
  email_contacto?: string | null;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface RegistrarEmpresaData {
  nombre: string;
  identificador_fiscal?: string;
  direccion?: string;
  telefono?: string;
  email_contacto?: string;
}

const registrarEmpresa = async (data: RegistrarEmpresaData): Promise<Empresa> => {
  const { nombre, identificador_fiscal, direccion, telefono, email_contacto } = data;

  if (!nombre) {
    throw new Error('El nombre de la empresa es requerido.');
  }
  // Aquí podrías añadir más validaciones, como para el formato del email_contacto si se provee.

  const query = `
    INSERT INTO empresas (nombre, identificador_fiscal, direccion, telefono, email_contacto)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [nombre, identificador_fiscal, direccion, telefono, email_contacto];

  try {
    const result: QueryResult<Empresa> = await pool.query(query, values);
    if (result.rows.length === 0) {
      // Esto no debería ocurrir con RETURNING * en una inserción exitosa, pero es una comprobación de seguridad.
      throw new Error('No se pudo registrar la empresa.');
    }
    return result.rows[0];
  } catch (error: any) {
    // Manejar errores específicos de la base de datos, como violación de unicidad.
    if (error.code === '23505') { // Código de error de PostgreSQL para violación de unicidad
      if (error.constraint === 'empresas_nombre_key') {
        throw new Error(`El nombre de empresa '${nombre}' ya está en uso.`);
      }
      if (error.constraint === 'empresas_email_contacto_key') {
        throw new Error(`El email de contacto '${email_contacto}' ya está en uso.`);
      }
      if (error.constraint === 'empresas_identificador_fiscal_key') {
        throw new Error(`El identificador fiscal '${identificador_fiscal}' ya está en uso.`);
      }
    }
    // Re-lanzar el error si no es uno de los esperados o para que lo maneje el controller.
    throw error;
  }
};

export default {
  registrarEmpresa,
};
