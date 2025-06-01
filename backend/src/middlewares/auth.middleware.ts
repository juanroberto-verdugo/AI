import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interfaz para el payload del token
export interface JwtPayload {
  userId: number;
  email: string;
  rol: string;
  empresaId: number;
  iat?: number; // Issued at (timestamp)
  exp?: number; // Expiration time (timestamp)
}

// Extender la interfaz Request de Express para incluir 'user'
export interface RequestWithUser extends Request {
  user?: JwtPayload; // El payload del token decodificado
}

const authenticateToken = (req: RequestWithUser, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (!token) {
    res.status(401).json({ message: 'Acceso no autorizado. Token no proporcionado.' });
    return;
  }

  if (!process.env.JWT_SECRET) {
    console.error('Error crítico: JWT_SECRET no está definido en el servidor.');
    res.status(500).json({ message: 'Error de configuración del servidor: no se puede verificar el token.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    req.user = decoded; // Añadir el payload decodificado al objeto request
    next(); // Continuar al siguiente middleware o controlador
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).json({ message: 'Acceso prohibido. Token expirado.' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: 'Acceso prohibido. Token inválido.' });
    } else {
      console.error('Error al verificar token:', error);
      res.status(500).json({ message: 'Error interno al verificar el token.' });
    }
  }
};

export default {
  authenticateToken,
};
