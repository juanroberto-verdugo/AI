import { Pool } from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en un entorno de ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined, // Ejemplo para SSL
});

pool.on('connect', () => {
  console.log('Connected to the database pool.');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client in pool', err);
  // No es recomendable process.exit() aquí en un servidor real,
  // pero para desarrollo puede ser útil si la BD es crítica al inicio.
  // process.exit(-1);
});

export const runMigrations = async () => {
  let client;
  try {
    client = await pool.connect();
    // Ajustar la ruta al archivo migrations.sql.
    // Si db.ts está en src/ y migrations.sql en src/database/
    const migrationsFilePath = path.join(__dirname, './database/migrations.sql');

    // Verificar si el archivo existe antes de intentar leerlo
    if (!fs.existsSync(migrationsFilePath)) {
      console.error(`Migration file not found at: ${migrationsFilePath}`);
      // Considerar si lanzar un error o simplemente advertir y continuar.
      // Por ahora, advertiremos y el servidor podría fallar más tarde si las tablas no existen.
      return;
    }

    const sql = fs.readFileSync(migrationsFilePath, 'utf8');
    await client.query(sql);
    console.log('Migrations executed successfully or tables already exist.');
  } catch (error) {
    console.error('Error running migrations:', error);
    // No salir del proceso para permitir que el servidor intente iniciar.
    // En un entorno de producción, esto debería manejarse de forma más robusta.
  } finally {
    if (client) {
      client.release();
    }
  }
};

export default pool;
