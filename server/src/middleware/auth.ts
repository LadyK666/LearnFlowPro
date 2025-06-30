import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// TODO: Move to .env alongside the one in auth.ts
// const JWT_SECRET = 'd1a9b3f8e7c6d5a4b3f2e1c0d9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error('JWT Verification Error:', err.message); // 澧炲己鏃ュ織
      return res.sendStatus(403); // Forbidden
    }
    req.user = user as { userId: number };
    next();
  });
}; 