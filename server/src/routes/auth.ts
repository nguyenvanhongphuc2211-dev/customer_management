import { Router, type Request, type Response } from 'express';
import { authenticate, signToken } from '../middleware/auth.js';
import type { AuthRepository } from '../repositories/authRepository.js';

export const createAuthRoutes = (authRepo: AuthRepository) => {
  const router = Router();

  router.post('/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ message: 'Email và mật khẩu là bắt buộc' });
        return;
      }

      const user = await authRepo.validateLogin({ email, password });
      if (!user) {
        res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
        return;
      }

      const token = signToken(user);
      res.json({ token, user });
    } catch {
      res.status(500).json({ message: 'Không thể đăng nhập' });
    }
  });

  router.get('/me', authenticate, (req: Request, res: Response) => {
    res.json(req.user);
  });

  return router;
};
