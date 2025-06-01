import { Response } from 'express';
import dispositivosService, { DispositivoData } from './dispositivos.service';
import { RequestWithUser } from '../../middlewares/auth.middleware'; // Para tipar req.user

// Crear Dispositivo
const handleCrearDispositivo = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const { nombre_dispositivo, clave_identificador, nombre_area, activo } = req.body;
    const empresaIdAuth = req.user?.empresaId;

    if (!empresaIdAuth) {
      // Esto no debería ocurrir si el authMiddleware funciona correctamente
      res.status(401).json({ message: 'No autorizado: empresaId no encontrado en el token.' });
      return;
    }
    if (!nombre_dispositivo || !clave_identificador) {
      res.status(400).json({ message: 'Nombre del dispositivo y clave identificadora son requeridos.' });
      return;
    }

    const dispositivoData: DispositivoData = { nombre_dispositivo, clave_identificador, nombre_area, activo };
    const nuevoDispositivo = await dispositivosService.crearDispositivo(dispositivoData, empresaIdAuth);
    res.status(201).json({ message: 'Dispositivo creado exitosamente.', dispositivo: nuevoDispositivo });

  } catch (error: any) {
    console.error('Error al crear dispositivo:', error.message);
    if (error.message.includes('ya está en uso')) {
      res.status(409).json({ message: error.message });
    } else if (error.message.includes('requeridos')) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor al crear el dispositivo.' });
    }
  }
};

// Obtener Todos los Dispositivos de la Empresa del Usuario Autenticado
const handleObtenerDispositivos = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const empresaIdAuth = req.user?.empresaId;
    if (!empresaIdAuth) {
      res.status(401).json({ message: 'No autorizado: empresaId no encontrado en el token.' });
      return;
    }
    const dispositivos = await dispositivosService.obtenerDispositivosPorEmpresa(empresaIdAuth);
    res.status(200).json(dispositivos);
  } catch (error: any) {
    console.error('Error al obtener dispositivos:', error.message);
    res.status(500).json({ message: 'Error interno del servidor al obtener los dispositivos.' });
  }
};

// Obtener un Dispositivo por ID
const handleObtenerDispositivoPorId = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const dispositivoId = parseInt(req.params.id, 10);
    const empresaIdAuth = req.user?.empresaId;

    if (isNaN(dispositivoId)) {
        res.status(400).json({ message: 'ID de dispositivo inválido.' });
        return;
    }
    if (!empresaIdAuth) {
      res.status(401).json({ message: 'No autorizado: empresaId no encontrado en el token.' });
      return;
    }

    const dispositivo = await dispositivosService.obtenerDispositivoPorId(dispositivoId, empresaIdAuth);
    if (!dispositivo) {
      // Se devuelve 404 tanto si no existe como si no pertenece a la empresa del usuario,
      // para no revelar información sobre la existencia de recursos de otras empresas.
      res.status(404).json({ message: 'Dispositivo no encontrado o no tienes permiso para acceder a él.' });
    } else {
      res.status(200).json(dispositivo);
    }
  } catch (error: any) {
    console.error('Error al obtener dispositivo por ID:', error.message);
    res.status(500).json({ message: 'Error interno del servidor al obtener el dispositivo.' });
  }
};

// Actualizar Dispositivo
const handleActualizarDispositivo = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const dispositivoId = parseInt(req.params.id, 10);
    const empresaIdAuth = req.user?.empresaId;
    const dataToUpdate: Partial<DispositivoData> = req.body;

    if (isNaN(dispositivoId)) {
        res.status(400).json({ message: 'ID de dispositivo inválido.' });
        return;
    }
    if (!empresaIdAuth) {
      res.status(401).json({ message: 'No autorizado: empresaId no encontrado en el token.' });
      return;
    }
    if (Object.keys(dataToUpdate).length === 0) {
        res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
        return;
    }
    // Validar que no se intente cambiar empresa_id (aunque el servicio lo ignora)
    if ((dataToUpdate as any).empresa_id !== undefined) {
        res.status(400).json({ message: 'No se permite cambiar el ID de la empresa del dispositivo.' });
        return;
    }


    const dispositivoActualizado = await dispositivosService.actualizarDispositivo(dispositivoId, dataToUpdate, empresaIdAuth);
    if (!dispositivoActualizado) {
      res.status(404).json({ message: 'Dispositivo no encontrado o no tienes permiso para actualizarlo.' });
    } else {
      res.status(200).json({ message: 'Dispositivo actualizado exitosamente.', dispositivo: dispositivoActualizado });
    }
  } catch (error: any) {
    console.error('Error al actualizar dispositivo:', error.message);
    if (error.message.includes('ya está en uso')) {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Error interno del servidor al actualizar el dispositivo.' });
    }
  }
};

// Eliminar Dispositivo
const handleEliminarDispositivo = async (req: RequestWithUser, res: Response): Promise<void> => {
  try {
    const dispositivoId = parseInt(req.params.id, 10);
    const empresaIdAuth = req.user?.empresaId;

    if (isNaN(dispositivoId)) {
        res.status(400).json({ message: 'ID de dispositivo inválido.' });
        return;
    }
    if (!empresaIdAuth) {
      res.status(401).json({ message: 'No autorizado: empresaId no encontrado en el token.' });
      return;
    }

    const eliminado = await dispositivosService.eliminarDispositivo(dispositivoId, empresaIdAuth);
    if (!eliminado) {
      res.status(404).json({ message: 'Dispositivo no encontrado o no tienes permiso para eliminarlo.' });
    } else {
      res.status(204).send(); // 204 No Content para eliminación exitosa
    }
  } catch (error: any) {
    console.error('Error al eliminar dispositivo:', error.message);
    res.status(500).json({ message: 'Error interno del servidor al eliminar el dispositivo.' });
  }
};

export default {
  handleCrearDispositivo,
  handleObtenerDispositivos,
  handleObtenerDispositivoPorId,
  handleActualizarDispositivo,
  handleEliminarDispositivo,
};
