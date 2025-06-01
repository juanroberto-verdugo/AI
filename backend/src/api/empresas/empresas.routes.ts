import { Router, Response } from 'express';
import empresasController from './empresas.controller';
import authMiddleware, { RequestWithUser } from '../../middlewares/auth.middleware'; // Importar middleware y tipo

const router = Router();

// POST /api/empresas/ - Ruta pública para registrar empresas
router.post('/', empresasController.handleRegistrarEmpresa);

// GET /api/empresas/protegido - Ruta protegida de ejemplo
router.get('/protegido', authMiddleware.authenticateToken, (req: RequestWithUser, res: Response) => {
  // Si llega aquí, el token es válido y req.user está disponible
  res.status(200).json({
    message: 'Has accedido a una ruta protegida!',
    usuarioAutenticado: req.user, // Mostrar la información del usuario del token
    empresaInfo: {
      id: req.user?.empresaId,
      mensaje: `Esta información es específica para la empresa ID ${req.user?.empresaId}.`,
    },
  });
});

// Aquí se podrían añadir más rutas para empresas (GET, PUT, DELETE, etc.),
// algunas de las cuales podrían estar protegidas también.
// Por ejemplo, para obtener detalles de una empresa específica (solo para usuarios de esa empresa):
// router.get('/:id', authMiddleware.authenticateToken, (req: RequestWithUser, res: Response) => { ... });
// (Esto requeriría lógica adicional para verificar que req.user.empresaId coincida con req.params.id)

export default router;
