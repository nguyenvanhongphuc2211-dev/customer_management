import { Router, type Request, type Response } from 'express';
import { requireRoles } from '../middleware/auth.js';
import { param } from '../utils/params.js';
import type { MenuRepository } from '../repositories/menuRepository.js';

const MENU_VIEW_ROLES = ['admin', 'staff', 'cashier', 'kitchen', 'head_chef'] as const;
const MENU_MANAGE_ROLES = ['admin', 'head_chef'] as const;

function handleError(error: unknown, res: Response): void {
  const msg = (error as Error).message;
  const map: Record<string, { status: number; message: string }> = {
    MENU_NAME_REQUIRED: { status: 400, message: 'Tên món không được để trống' },
    MENU_PRICE_INVALID: { status: 400, message: 'Giá món phải >= 0' },
    MENU_NAME_EXISTS: { status: 409, message: 'Món ăn đã có trong thực đơn' },
  };
  const mapped = map[msg];
  if (mapped) {
    res.status(mapped.status).json({ message: mapped.message });
    return;
  }
  res.status(500).json({ message: 'Không thể xử lý thực đơn' });
}

export const createMenuRoutes = (menuRepo: MenuRepository) => {
  const router = Router();

  router.get('/', requireRoles(...MENU_VIEW_ROLES), async (_req: Request, res: Response) => {
    try {
      const items = await menuRepo.findAll();
      res.json(items);
    } catch {
      res.status(500).json({ message: 'Không thể tải thực đơn' });
    }
  });

  router.post('/', requireRoles(...MENU_MANAGE_ROLES), async (req: Request, res: Response) => {
    try {
      const { name, price, description, category } = req.body;
      if (!name || price == null) {
        res.status(400).json({ message: 'Tên món và giá là bắt buộc' });
        return;
      }

      const item = await menuRepo.create({ name, price: Number(price), description, category });
      res.status(201).json(item);
    } catch (error) {
      handleError(error, res);
    }
  });

  router.patch('/:id', requireRoles(...MENU_MANAGE_ROLES), async (req: Request, res: Response) => {
    try {
      const item = await menuRepo.update(param(req.params.id), req.body);
      if (!item) {
        res.status(404).json({ message: 'Không tìm thấy món ăn' });
        return;
      }
      res.json(item);
    } catch (error) {
      handleError(error, res);
    }
  });

  router.delete('/:id', requireRoles(...MENU_MANAGE_ROLES), async (req: Request, res: Response) => {
    try {
      const deleted = await menuRepo.delete(param(req.params.id));
      if (!deleted) {
        res.status(404).json({ message: 'Không tìm thấy món ăn' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      handleError(error, res);
    }
  });

  return router;
};
