import { Router, type Request, type Response } from 'express';
import type { TableAreaRepository } from '../repositories/tableAreaRepository.js';

export const createTableAreaRoutes = (areaRepo: TableAreaRepository) => {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    try {
      const areas = await areaRepo.findAll();
      res.json(areas);
    } catch {
      res.status(500).json({ message: 'Không thể tải danh sách khu vực' });
    }
  });

  return router;
};
