import mqtt, { MqttClient } from 'mqtt';
import pool from '../db'; // Pool de conexión a PostgreSQL
import { QueryResult } from 'pg';
import { io } from '../server'; // Importar la instancia 'io' de Socket.IO desde server.ts

let client: MqttClient | null = null;

interface MqttMessagePayload {
  flujo_instantaneo: number;
  volumen_totalizado: number;
  fecha_medicion: string; // Se espera en formato ISO 8601
}

interface DispositivoInfo {
    id: number;
    empresa_id: number;
    nombre_dispositivo: string;
    nombre_area: string | null;
}

// Modificado para devolver más información del dispositivo
const getDispositivoInfoByTopic = async (topic: string): Promise<DispositivoInfo | null> => {
  try {
    const result: QueryResult = await pool.query(
      'SELECT id, empresa_id, nombre_dispositivo, nombre_area FROM dispositivos WHERE clave_identificador = $1 AND activo = TRUE',
      [topic]
    );
    if (result.rows.length > 0) {
      return result.rows[0] as DispositivoInfo;
    }
    return null;
  } catch (error) {
    console.error(`[MQTT Service] Error al buscar dispositivo por topic '${topic}':`, error);
    return null;
  }
};

const handleIncomingMessage = async (topic: string, messageString: string): Promise<void> => {
  console.log(`[MQTT Service] Mensaje recibido en topic '${topic}': ${messageString}`);

  const dispositivoInfo = await getDispositivoInfoByTopic(topic);
  if (!dispositivoInfo) {
    console.warn(`[MQTT Service] No se encontró dispositivo activo o información completa para el topic '${topic}'. Mensaje ignorado.`);
    return;
  }

  try {
    const message: MqttMessagePayload = JSON.parse(messageString);

    if (typeof message.flujo_instantaneo !== 'number' ||
        typeof message.volumen_totalizado !== 'number' ||
        typeof message.fecha_medicion !== 'string') {
      console.warn(`[MQTT Service] Payload inválido o campos faltantes en topic '${topic}':`, message);
      return;
    }
    const fechaMedicionDate = new Date(message.fecha_medicion);
    if (isNaN(fechaMedicionDate.getTime())) {
        console.warn(`[MQTT Service] Formato de fecha_medicion inválido ('${message.fecha_medicion}') en topic '${topic}'.`);
        return;
    }

    const fechaRecepcion = new Date(); // Fecha y hora actual para fecha_recepcion

    const dbQuery = `
      INSERT INTO lecturas_flujo (dispositivo_id, flujo_instantaneo, volumen_totalizado, fecha_medicion, fecha_recepcion)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, fecha_creacion_db;
    `;
    const values = [dispositivoInfo.id, message.flujo_instantaneo, message.volumen_totalizado, fechaMedicionDate, fechaRecepcion];

    const dbResult: QueryResult = await pool.query(dbQuery, values);
    const savedReadingId = dbResult.rows[0].id;
    // const fechaCreacionDb = dbResult.rows[0].fecha_creacion_db; // Si se necesita para el evento
    console.log(`[MQTT Service] Lectura guardada con ID ${savedReadingId} para dispositivo ID ${dispositivoInfo.id} (topic '${topic}')`);

    // Preparar datos para emitir por Socket.IO
    const lecturaDataParaSocket = {
      id: savedReadingId, // ID de la lectura en la BD
      dispositivoId: dispositivoInfo.id,
      nombreDispositivo: dispositivoInfo.nombre_dispositivo,
      nombreArea: dispositivoInfo.nombre_area,
      flujoInstantaneo: message.flujo_instantaneo,
      volumenTotalizado: message.volumen_totalizado,
      fechaMedicion: fechaMedicionDate.toISOString(), // Enviar en formato ISO
      fechaRecepcion: fechaRecepcion.toISOString(), // Enviar en formato ISO
      // fechaCreacionDb: fechaCreacionDb.toISOString(), // Opcional
      empresaId: dispositivoInfo.empresa_id, // Necesario para enrutar al room correcto
    };

    // Emitir a la sala de la empresa específica
    const roomName = `empresa_${dispositivoInfo.empresa_id}`;
    io.to(roomName).emit('nueva_lectura', lecturaDataParaSocket);
    console.log(`[MQTT Service] Emitido evento 'nueva_lectura' a la sala ${roomName}:`, {
        dispositivoId: lecturaDataParaSocket.dispositivoId,
        flujo: lecturaDataParaSocket.flujoInstantaneo,
        volumen: lecturaDataParaSocket.volumenTotalizado,
        fecha_medicion: lecturaDataParaSocket.fechaMedicion
    });

  } catch (error: any) {
    if (error instanceof SyntaxError) {
        console.error(`[MQTT Service] Error al parsear JSON del mensaje en topic '${topic}': ${error.message}. Payload: ${messageString}`);
    } else {
        console.error(`[MQTT Service] Error al procesar mensaje de topic '${topic}' y guardar/emitir:`, error);
    }
  }
};

// Las funciones subscribeToTopic, unsubscribeFromTopic, subscribeToAllDeviceTopics y connectMqtt permanecen igual que antes.
// Solo se ha modificado getDispositivoIdByTopic (ahora getDispositivoInfoByTopic) y handleIncomingMessage.

const subscribeToTopic = (topic: string): void => {
  if (client && client.connected) {
    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`[MQTT Service] Error al suscribirse al topic '${topic}':`, err);
      } else {
        console.log(`[MQTT Service] Suscrito exitosamente al topic '${topic}'`);
      }
    });
  } else {
    console.warn(`[MQTT Service] No se puede suscribir. Cliente MQTT no conectado. Topic: ${topic}`);
  }
};

const unsubscribeFromTopic = (topic: string): void => {
  if (client && client.connected) {
    client.unsubscribe(topic, (err) => {
      if (err) {
        console.error(`[MQTT Service] Error al desuscribirse del topic '${topic}':`, err);
      } else {
        console.log(`[MQTT Service] Desuscrito exitosamente del topic '${topic}'`);
      }
    });
  } else {
    console.warn(`[MQTT Service] No se puede desuscribir. Cliente MQTT no conectado. Topic: ${topic}`);
  }
};

const subscribeToAllDeviceTopics = async (): Promise<void> => {
  console.log('[MQTT Service] Obteniendo todos los topics de dispositivos activos para suscripción...');
  try {
    const result: QueryResult = await pool.query(
      "SELECT clave_identificador FROM dispositivos WHERE activo = TRUE"
    );
    if (result.rows.length === 0) {
        console.log('[MQTT Service] No hay dispositivos activos para suscribirse inicialmente.');
        return;
    }
    result.rows.forEach((row: { clave_identificador: string }) => {
      subscribeToTopic(row.clave_identificador);
    });
  } catch (error) {
    console.error('[MQTT Service] Error al obtener topics de dispositivos de la BD:', error);
  }
};

const connectMqtt = (): void => {
  if (client && client.connected) {
    console.log('[MQTT Service] Cliente MQTT ya está conectado.');
    return;
  }

  const brokerUrl = process.env.MQTT_BROKER_URL;
  if (!brokerUrl) {
    console.error('[MQTT Service] Error: MQTT_BROKER_URL no está definido en las variables de entorno. El servicio MQTT no se iniciará.');
    return;
  }

  const options: mqtt.IClientOptions = {
    clientId: process.env.MQTT_CLIENT_ID || `flujo_backend_${Math.random().toString(16).substring(2, 8)}`,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    reconnectPeriod: 5000,
    connectTimeout: 10000,
  };
  if (!options.username) delete options.username;
  if (!options.password) delete options.password;

  console.log(`[MQTT Service] Conectando a Broker MQTT en ${brokerUrl}...`);
  client = mqtt.connect(brokerUrl, options);

  client.on('connect', () => {
    console.log('[MQTT Service] Conectado exitosamente al Broker MQTT.');
    subscribeToAllDeviceTopics();
  });

  client.on('error', (err) => {
    console.error('[MQTT Service] Error de conexión MQTT:', err.message);
  });

  client.on('reconnect', () => {
    console.log('[MQTT Service] Intentando reconectar al Broker MQTT...');
  });

  client.on('close', () => {
    console.log('[MQTT Service] Conexión MQTT cerrada.');
  });

  client.on('message', handleIncomingMessage);
};

// Exportar getDispositivoInfoByTopic en lugar de getDispositivoIdByTopic si es necesario en otros módulos
export { connectMqtt, subscribeToTopic, unsubscribeFromTopic, getDispositivoInfoByTopic };
