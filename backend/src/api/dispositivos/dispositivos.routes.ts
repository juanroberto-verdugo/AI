import { Router } from 'express';
import dispositivosController from './dispositivos.controller';
import authMiddleware from '../../middlewares/auth.middleware'; // Para proteger las rutas

const router = Router();

// Todas las rutas de dispositivos requieren autenticación
router.use(authMiddleware.authenticateToken);

// POST /api/dispositivos/ - Crear un nuevo dispositivo
router.post('/', dispositivosController.handleCrearDispositivo);

// GET /api/dispositivos/ - Obtener todos los dispositivos de la empresa del usuario
router.get('/', dispositivosController.handleObtenerDispositivos);

// GET /api/dispositivos/:id - Obtener un dispositivo específico por ID
router.get('/:id', dispositivosController.handleObtenerDispositivoPorId);

// PUT /api/dispositivos/:id - Actualizar un dispositivo específico por ID
router.put('/:id', dispositivosController.handleActualizarDispositivo);

// DELETE /api/dispositivos/:id - Eliminar un dispositivo específico por ID
router.delete('/:id', dispositivosController.handleEliminarDispositivo);

export default router;
