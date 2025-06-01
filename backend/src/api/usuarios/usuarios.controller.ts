import { Request, Response } from 'express';
import usuariosService, { RegistrarUsuarioData, LoginUsuarioData } from './usuarios.service';

const handleRegistrarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { empresa_id, nombre_completo, email, password, rol } = req.body;

    // Validaciones básicas (se pueden mejorar con librerías como Joi o class-validator)
    if (!empresa_id || typeof empresa_id !== 'number') {
      res.status(400).json({ message: 'El campo empresa_id es requerido y debe ser un número.' });
      return;
    }
    if (!nombre_completo || typeof nombre_completo !== 'string' || nombre_completo.trim() === '') {
      res.status(400).json({ message: 'El nombre_completo es requerido.' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ message: 'El email es requerido y debe ser una dirección válida.' });
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ message: 'La contraseña es requerida y debe tener al menos 6 caracteres.' });
      return;
    }
    if (rol && typeof rol !== 'string') {
        res.status(400).json({ message: 'El rol, si se proporciona, debe ser una cadena de texto.' });
        return;
    }

    const usuarioData: RegistrarUsuarioData = { empresa_id, nombre_completo, email, password_sin_hash: password, rol };
    const nuevoUsuario = await usuariosService.registrarUsuario(usuarioData);

    res.status(201).json({ message: 'Usuario registrado exitosamente.', usuario: nuevoUsuario });

  } catch (error: any) {
    console.error('Error al registrar usuario:', error.message);
    if (error.message.includes('La empresa con ID') && error.message.includes('no existe')) {
      res.status(404).json({ message: error.message }); // 404 Not Found
    } else if (error.message.includes('ya está en uso')) {
      res.status(409).json({ message: error.message }); // 409 Conflict
    } else if (error.message.includes('Faltan campos requeridos')) {
      res.status(400).json({ message: error.message }); // 400 Bad Request
    } else {
      res.status(500).json({ message: 'Error interno del servidor al registrar el usuario.' });
    }
  }
};

const handleLoginUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ message: 'El email es requerido y debe ser una dirección válida.' });
      return;
    }
    if (!password || typeof password !== 'string') {
      res.status(400).json({ message: 'La contraseña es requerida.' });
      return;
    }

    const loginData: LoginUsuarioData = { email, password_sin_hash: password };
    const loginResponse = await usuariosService.loginUsuario(loginData);

    res.status(200).json(loginResponse);

  } catch (error: any) {
    console.error('Error en login de usuario:', error.message);
    if (error.message.includes('Credenciales inválidas') || error.message.includes('usuario inactivo')) {
      res.status(401).json({ message: 'Credenciales inválidas o usuario inactivo.' }); // 401 Unauthorized
    } else if (error.message.includes('requeridos para el login')) {
        res.status(400).json({ message: error.message });
    } else if (error.message.includes('Error de configuración del servidor')) {
        res.status(500).json({ message: error.message });
    }
    else {
      res.status(500).json({ message: 'Error interno del servidor durante el login.' });
    }
  }
};

export default {
  handleRegistrarUsuario,
  handleLoginUsuario,
};
