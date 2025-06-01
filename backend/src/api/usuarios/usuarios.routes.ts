import { Router } from 'express';
import usuariosController from './usuarios.controller';

const router = Router();

// POST /api/usuarios/registrar
router.post('/registrar', usuariosController.handleRegistrarUsuario);

// POST /api/usuarios/login
router.post('/login', usuariosController.handleLoginUsuario);

// Aquí se podrían añadir más rutas para usuarios (GET, PUT, DELETE, etc.)
// Por ejemplo, una ruta para obtener el perfil del usuario actual (protegida)
// router.get('/perfil', authMiddleware.authenticateToken, usuariosController.handleObtenerPerfil);

export default router;
