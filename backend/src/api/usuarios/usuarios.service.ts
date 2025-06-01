import pool from '../../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { QueryResult } from 'pg';

// Interfaces (pueden moverse a un archivo de tipos dedicado más adelante)
export interface Usuario {
  id: number;
  empresa_id: number;
  nombre_completo: string;
  email: string;
  rol: string;
  activo: boolean;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface RegistrarUsuarioData {
  empresa_id: number;
  nombre_completo: string;
  email: string;
  password_sin_hash: string; // Renombrado para claridad
  rol?: string;
}

export interface LoginUsuarioData {
  email: string;
  password_sin_hash: string; // Renombrado para claridad
}

export interface LoginResponse {
  token: string;
  usuario: Omit<Usuario, 'password_hash'>;
}

const SALT_ROUNDS = 10; // Para bcrypt

// Verificar si una empresa existe
const verificarEmpresaExiste = async (empresa_id: number): Promise<boolean> => {
  const result: QueryResult = await pool.query('SELECT id FROM empresas WHERE id = $1', [empresa_id]);
  return result.rows.length > 0;
};

const registrarUsuario = async (data: RegistrarUsuarioData): Promise<Omit<Usuario, 'password_hash'>> => {
  const { empresa_id, nombre_completo, email, password_sin_hash, rol = 'usuario' } = data;

  if (!empresa_id || !nombre_completo || !email || !password_sin_hash) {
    throw new Error('Faltan campos requeridos para el registro de usuario.');
  }

  const empresaExiste = await verificarEmpresaExiste(empresa_id);
  if (!empresaExiste) {
    throw new Error(`La empresa con ID ${empresa_id} no existe.`);
  }

  const password_hash = await bcrypt.hash(password_sin_hash, SALT_ROUNDS);

  const query = `
    INSERT INTO usuarios (empresa_id, nombre_completo, email, password_hash, rol)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, empresa_id, nombre_completo, email, rol, activo, fecha_creacion, fecha_actualizacion;
  `;
  const values = [empresa_id, nombre_completo, email, password_hash, rol];

  try {
    const result: QueryResult<Omit<Usuario, 'password_hash'>> = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('No se pudo registrar el usuario.');
    }
    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505' && error.constraint === 'usuarios_email_key') {
      throw new Error(`El email '${email}' ya está en uso.`);
    }
    throw error;
  }
};

const loginUsuario = async (data: LoginUsuarioData): Promise<LoginResponse> => {
  const { email, password_sin_hash } = data;

  if (!email || !password_sin_hash) {
    throw new Error('El email y la contraseña son requeridos para el login.');
  }

  const query = 'SELECT * FROM usuarios WHERE email = $1 AND activo = TRUE;'; // Solo usuarios activos pueden loguearse
  const result: QueryResult<Usuario & { password_hash: string }> = await pool.query(query, [email]);

  if (result.rows.length === 0) {
    throw new Error('Credenciales inválidas o usuario inactivo.'); // Mensaje genérico
  }

  const usuario = result.rows[0];
  const passwordValido = await bcrypt.compare(password_sin_hash, usuario.password_hash);

  if (!passwordValido) {
    throw new Error('Credenciales inválidas o usuario inactivo.'); // Mensaje genérico
  }

  if (!process.env.JWT_SECRET) {
    console.error('Error: JWT_SECRET no está definido en las variables de entorno.');
    throw new Error('Error de configuración del servidor al intentar generar el token.');
  }

  const tokenPayload = {
    userId: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    empresaId: usuario.empresa_id,
  };

  const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...usuarioSinPassword } = usuario;

  return { token, usuario: usuarioSinPassword };
};

export default {
  registrarUsuario,
  loginUsuario,
  verificarEmpresaExiste, // Exportar si se necesita en otros lugares, ej. middleware
};
