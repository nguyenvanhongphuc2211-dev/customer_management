import { Router, type Request, type Response } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { param } from '../utils/params.js';
import type { CustomerGroupRepository } from '../repositories/customerGroupRepository.js';
import type { CustomerRepository } from '../repositories/customerRepository.js';

export const createCustomerGroupRoutes = (
  groupRepo: CustomerGroupRepository,
  customerRepo: CustomerRepository,
) => {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    try {
      const groups = await groupRepo.findAll();
      const withCounts = await Promise.all(
        groups.map(async (group) => ({
          ...group,
          customerCount: await customerRepo.countByGroup(group.id),
        })),
      );
      res.json(withCounts);
    } catch {
      res.status(500).json({ message: 'Không thể tải danh sách nhóm khách hàng' });
    }
  });

  router.post('/', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { name, description, color } = req.body;
      if (!name || !color) {
        res.status(400).json({ message: 'Tên và màu nhóm là bắt buộc' });
        return;
      }
      const group = await groupRepo.create({ name, description, color });
      res.status(201).json({ ...group, customerCount: 0 });
    } catch {
      res.status(500).json({ message: 'Không thể tạo nhóm khách hàng' });
    }
  });

  router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const group = await groupRepo.update(param(req.params.id), req.body);
      if (!group) {
        res.status(404).json({ message: 'Không tìm thấy nhóm khách hàng' });
        return;
      }
      const customerCount = await customerRepo.countByGroup(group.id);
      res.json({ ...group, customerCount });
    } catch {
      res.status(500).json({ message: 'Không thể cập nhật nhóm khách hàng' });
    }
  });

  router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const count = await customerRepo.countByGroup(param(req.params.id));
      if (count > 0) {
        res.status(400).json({
          message: `Không thể xóa nhóm đang có ${count} khách hàng`,
        });
        return;
      }
      const deleted = await groupRepo.delete(param(req.params.id));
      if (!deleted) {
        res.status(404).json({ message: 'Không tìm thấy nhóm khách hàng' });
        return;
      }
      res.status(204).send();
    } catch {
      res.status(500).json({ message: 'Không thể xóa nhóm khách hàng' });
    }
  });

  return router;
};
