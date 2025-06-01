-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.fecha_actualizacion = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Tabla Empresas
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    identificador_fiscal VARCHAR(100) UNIQUE,
    direccion TEXT,
    telefono VARCHAR(50),
    email_contacto VARCHAR(255) UNIQUE,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE TRIGGER update_empresas_updated_at
BEFORE UPDATE ON empresas
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabla Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    nombre_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'usuario', -- e.g., 'admin_empresa', 'operador'
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_empresa
        FOREIGN KEY(empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE
);

CREATE OR REPLACE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para campos buscados frecuentemente
CREATE INDEX IF NOT EXISTS idx_empresas_nombre ON empresas(nombre);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_id ON usuarios(empresa_id);

-- Tabla Dispositivos
CREATE TABLE IF NOT EXISTS dispositivos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    nombre_dispositivo VARCHAR(255) NOT NULL,
    clave_identificador VARCHAR(255) NOT NULL UNIQUE, -- Podría ser el topic MQTT o un ID único del HW
    nombre_area VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_empresa_dispositivo
        FOREIGN KEY(empresa_id)
        REFERENCES empresas(id)
        ON DELETE CASCADE
);

CREATE OR REPLACE TRIGGER update_dispositivos_updated_at
BEFORE UPDATE ON dispositivos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Índices para dispositivos
CREATE INDEX IF NOT EXISTS idx_dispositivos_empresa_id ON dispositivos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_dispositivos_clave_identificador ON dispositivos(clave_identificador);

-- Tabla Lecturas de Flujo
CREATE TABLE IF NOT EXISTS lecturas_flujo (
    id SERIAL PRIMARY KEY,
    dispositivo_id INTEGER NOT NULL,
    flujo_instantaneo DECIMAL(10, 3) NOT NULL,
    volumen_totalizado DECIMAL(15, 3) NOT NULL,
    fecha_medicion TIMESTAMPTZ NOT NULL, -- Enviada por el medidor
    fecha_recepcion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Puesta por la aplicación al recibir
    fecha_creacion_db TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, -- Puesta por la BD al insertar registro
    CONSTRAINT fk_dispositivo_lectura
        FOREIGN KEY(dispositivo_id)
        REFERENCES dispositivos(id)
        ON DELETE CASCADE -- Si se borra un dispositivo, se borran sus lecturas
);

-- Índices para lecturas_flujo
CREATE INDEX IF NOT EXISTS idx_lecturas_dispositivo_id ON lecturas_flujo(dispositivo_id);
CREATE INDEX IF NOT EXISTS idx_lecturas_fecha_medicion ON lecturas_flujo(fecha_medicion);
CREATE INDEX IF NOT EXISTS idx_lecturas_fecha_recepcion ON lecturas_flujo(fecha_recepcion);
