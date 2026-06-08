import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthUser } from '../types/auth.types.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'crm-dev-secret-change-in-production';

export const signToken = (user: AuthUser): string =>
  jwt.sign({ id: user.id, email: user.email, fullName: user.fullName, role: user.role }, JWT_SECRET, {
    expiresIn: '8h',
  });

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Vui lòng đăng nhập' });
    return;
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET) as AuthUser;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' });
    return;
  }
  next();
};
