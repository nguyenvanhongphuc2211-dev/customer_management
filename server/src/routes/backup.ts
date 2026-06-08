import { Router, type Request, type Response } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { param } from '../utils/params.js';
import type { createBackupService } from '../services/backupService.js';

export const createBackupRoutes = (backupService: ReturnType<typeof createBackupService>) => {
  const router = Router();

  router.get('/', requireAdmin, async (_req: Request, res: Response) => {
    try {
      const backups = await backupService.listBackups();
      res.json(backups);
    } catch {
      res.status(500).json({ message: 'Không thể liệt kê backup' });
    }
  });

  router.post('/', requireAdmin, async (_req: Request, res: Response) => {
    try {
      const id = await backupService.createBackup();
      res.status(201).json({ id, message: 'Backup thành công' });
    } catch {
      res.status(500).json({ message: 'Không thể tạo backup' });
    }
  });

  router.post('/restore/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      await backupService.restoreBackup(param(req.params.id));
      res.json({ message: 'Khôi phục dữ liệu thành công' });
    } catch (error) {
      if ((error as Error).message === 'BACKUP_NOT_FOUND') {
        res.status(404).json({ message: 'Không tìm thấy bản backup' });
        return;
      }
      res.status(500).json({ message: 'Không thể khôi phục dữ liệu' });
    }
  });

  return router;
};
