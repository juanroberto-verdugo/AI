import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http'; // Añadir
import { Server as SocketIOServer, Socket } from 'socket.io'; // Añadir
import jwt from 'jsonwebtoken'; // Para autenticar el handshake
import { JwtPayload } from './middlewares/auth.middleware'; // Reutilizar JwtPayload si es compatible

dotenv.config();

import empresasRouter from './api/empresas/empresas.routes';
import usuariosRouter from './api/usuarios/usuarios.routes';
import dispositivosRouter from './api/dispositivos/dispositivos.routes';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

// Rutas de la API
app.use('/api/empresas', empresasRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/dispositivos', dispositivosRouter);

app.get('/api/healthcheck', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Server is running and healthy!' });
});

// Crear servidor HTTP explícitamente
const httpServer = createServer(app);

// Configurar Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // URL del frontend
    methods: ["GET", "POST"]
  }
});

// Interfaz para el socket con usuario (similar a RequestWithUser)
interface SocketWithUser extends Socket {
    user?: JwtPayload; // El payload del token decodificado
  }

// Middleware de autenticación para Socket.IO
io.use((socket: SocketWithUser, next) => {
  const token = socket.handshake.auth.token; // Cliente debe enviar token aquí
  if (!token) {
    console.log('[Socket.IO Auth] Error: Token no proporcionado.');
    return next(new Error('Authentication error: Token not provided'));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    socket.user = decoded; // Adjuntar datos del usuario al socket
    next();
  } catch (err) {
    console.log('[Socket.IO Auth] Error: Token inválido.', err);
    return next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket: SocketWithUser) => {
  const user = socket.user; // Ahora user está tipado (aunque JwtPayload podría no ser exactamente lo que queremos, ajustaremos si es necesario)
  if (!user) {
    // Esto no debería ocurrir si el middleware de autenticación funciona
    console.error(`[Socket.IO] Conexión de socket ${socket.id} sin datos de usuario después de la autenticación.`);
    socket.disconnect(true); // Desconectar si no hay usuario
    return;
  }

  console.log(`[Socket.IO] Socket conectado: ${socket.id}, User ID: ${user.userId}, Empresa ID: ${user.empresaId}`);

  // Unir el socket a una sala basada en su empresa_id
  const roomName = `empresa_${user.empresaId}`;
  socket.join(roomName);
  console.log(`[Socket.IO] Socket ${socket.id} (User ID: ${user.userId}) se unió a la sala ${roomName}`);

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Socket desconectado: ${socket.id}, Razón: ${reason}`);
  });

  // Ejemplo: Escuchar un evento del cliente
  socket.on('client_event_example', (data) => {
    console.log(`[Socket.IO] Evento 'client_event_example' recibido de ${socket.id} (User ID: ${user.userId}):`, data);
    // Responder al cliente si es necesario
    // socket.emit('server_response_example', { received: true, data });
  });
});

// Exportar 'io' para que otros módulos (mqttService) puedan usarlo
export { io };

// Importar runMigrations desde db.ts
import { runMigrations } from './db';
// Importar connectMqtt desde mqttService.ts
import { connectMqtt } from './services/mqttService'; // Asegúrate que mqttService no importe 'io' en su nivel superior para evitar ciclo

const startServer = async () => {
  await runMigrations(); // Ejecutar migraciones

  // Conectar al broker MQTT (asegurándose que 'io' esté disponible si mqttService lo necesita al inicializar)
  // Si mqttService importa 'io' directamente, esta llamada debe estar después de la inicialización de 'io'.
  connectMqtt();

  httpServer.listen(port, () => { // Cambiar app.listen por httpServer.listen
    console.log(`Servidor (HTTP & WebSocket) escuchando en http://localhost:${port}`);
  });
};

startServer().catch(error => {
  console.error("Error al iniciar el servidor:", error);
  process.exit(1);
});
