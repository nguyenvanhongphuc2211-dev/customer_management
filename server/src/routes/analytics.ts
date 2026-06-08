import { Router, type Response } from 'express';
import type { createAnalyticsService } from '../services/analyticsService.js';

export const createAnalyticsRoutes = (
  analyticsService: ReturnType<typeof createAnalyticsService>,
) => {
  const router = Router();

  router.get('/', async (_req, res: Response) => {
    try {
      const data = await analyticsService.getAnalytics();
      res.json(data);
    } catch {
      res.status(500).json({ message: 'Không thể tải dữ liệu thống kê' });
    }
  });

  return router;
};
