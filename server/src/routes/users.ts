import { Router, type Request, type Response } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import type { AuthRepository } from '../repositories/authRepository.js';
import { ALL_ROLES } from '../types/permissions.js';
import type { UserRole } from '../types/auth.types.js';

const VALID_ROLES: UserRole[] = ALL_ROLES;

function handleError(error: unknown, res: Response): void {
  const msg = (error as Error).message;
  const map: Record<string, { status: number; message: string }> = {
    EMAIL_EXISTS: { status: 409, message: 'Email đã được sử dụng' },
    PASSWORD_TOO_SHORT: { status: 400, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
    INVALID_ROLE: { status: 400, message: 'Vai trò không hợp lệ' },
    INVALID_USER_DATA: { status: 400, message: 'Thiếu thông tin bắt buộc' },
  };
  const mapped = map[msg];
  if (mapped) {
    res.status(mapped.status).json({ message: mapped.message });
    return;
  }
  res.status(500).json({ message: 'Không thể xử lý yêu cầu' });
}

export const createUserRoutes = (authRepo: AuthRepository) => {
  const router = Router();

  router.get('/', requireAdmin, async (_req: Request, res: Response) => {
    try {
      const users = await authRepo.findAll();
      res.json(users);
    } catch {
      res.status(500).json({ message: 'Không thể tải danh sách tài khoản' });
    }
  });

  router.post('/', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { email, password, fullName, role } = req.body;
      if (!email || !password || !fullName || !role) {
        res.status(400).json({ message: 'Email, mật khẩu, họ tên và vai trò là bắt buộc' });
        return;
      }
      if (!VALID_ROLES.includes(role)) {
        res.status(400).json({ message: 'Vai trò không hợp lệ' });
        return;
      }

      const user = await authRepo.createUser({ email, password, fullName, role });
      res.status(201).json(user);
    } catch (error) {
      handleError(error, res);
    }
  });

  return router;
};
