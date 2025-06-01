import { Request, Response } from 'express';
import empresasService, { RegistrarEmpresaData } from './empresas.service';

const handleRegistrarEmpresa = async (req: Request, res: Response): Promise<void> => {
  try {
    const empresaData: RegistrarEmpresaData = req.body;

    // Validación básica en el controlador (aunque el servicio también valida)
    if (!empresaData.nombre || typeof empresaData.nombre !== 'string' || empresaData.nombre.trim() === '') {
      res.status(400).json({ message: 'El nombre de la empresa es requerido y debe ser una cadena de texto no vacía.' });
      return;
    }
    if (empresaData.email_contacto && (typeof empresaData.email_contacto !== 'string' || !empresaData.email_contacto.includes('@'))) {
      // Validación muy simple de email, se podría usar una librería más robusta
      res.status(400).json({ message: 'El email de contacto proporcionado no es válido.' });
      return;
    }

    const nuevaEmpresa = await empresasService.registrarEmpresa(empresaData);
    res.status(201).json({ message: 'Empresa registrada exitosamente.', empresa: nuevaEmpresa });

  } catch (error: any) {
    console.error('Error al registrar empresa:', error.message);

    if (error.message.includes('ya está en uso')) {
      res.status(409).json({ message: error.message }); // 409 Conflict
    } else if (error.message.includes('es requerido')) {
      res.status(400).json({ message: error.message }); // 400 Bad Request
    }
    else {
      res.status(500).json({ message: 'Error interno del servidor al registrar la empresa.' });
    }
  }
};

export default {
  handleRegistrarEmpresa,
};
