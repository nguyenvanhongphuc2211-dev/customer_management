import { Router, type Request, type Response } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { param } from '../utils/params.js';
import type { ContactNoteRepository } from '../repositories/contactNoteRepository.js';
import type { ContactNoteType } from '../types/contactNote.types.js';

const VALID_TYPES: ContactNoteType[] = ['call', 'email', 'meeting', 'note'];

export const createContactNoteRoutes = (noteRepo: ContactNoteRepository) => {
  const router = Router();

  router.get('/customer/:customerId', async (req: Request, res: Response) => {
    try {
      const notes = await noteRepo.findByCustomerId(param(req.params.customerId));
      res.json(notes);
    } catch {
      res.status(500).json({ message: 'Không thể tải lịch sử liên hệ' });
    }
  });

  router.post('/', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { customerId, type, content } = req.body;
      if (!customerId || !type || !content) {
        res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        return;
      }
      if (!VALID_TYPES.includes(type)) {
        res.status(400).json({ message: 'Loại liên hệ không hợp lệ' });
        return;
      }

      const note = await noteRepo.create({
        customerId,
        type,
        content,
        createdBy: req.user?.email ?? 'unknown',
      });
      res.status(201).json(note);
    } catch (error) {
      if ((error as Error).message === 'CUSTOMER_NOT_FOUND') {
        res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        return;
      }
      res.status(500).json({ message: 'Không thể tạo ghi chú' });
    }
  });

  router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const deleted = await noteRepo.delete(param(req.params.id));
      if (!deleted) {
        res.status(404).json({ message: 'Không tìm thấy ghi chú' });
        return;
      }
      res.status(204).send();
    } catch {
      res.status(500).json({ message: 'Không thể xóa ghi chú' });
    }
  });

  return router;
};
