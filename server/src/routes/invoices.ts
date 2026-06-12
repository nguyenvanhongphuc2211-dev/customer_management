import { Router, type Request, type Response } from 'express';
import { requireRoles } from '../middleware/auth.js';
import { param } from '../utils/params.js';
import type { InvoiceRepository } from '../repositories/invoiceRepository.js';

function handleError(error: unknown, res: Response): void {
  const msg = (error as Error).message;
  const map: Record<string, { status: number; message: string }> = {
    TABLE_NOT_FOUND: { status: 404, message: 'Không tìm thấy bàn' },
    TABLE_NOT_BILLING: { status: 400, message: 'Bàn chưa ở trạng thái thanh toán' },
    INVOICE_ITEMS_REQUIRED: { status: 400, message: 'Hóa đơn cần ít nhất một dòng hợp lệ' },
    INVOICE_NOT_FOUND: { status: 404, message: 'Không tìm thấy hóa đơn' },
  };
  const mapped = map[msg];
  if (mapped) {
    res.status(mapped.status).json({ message: mapped.message });
    return;
  }
  res.status(500).json({ message: 'Không thể xử lý hóa đơn' });
}

export const createInvoiceRoutes = (invoiceRepo: InvoiceRepository) => {
  const router = Router();

  router.use(requireRoles('admin', 'cashier'));

  router.get('/', async (_req: Request, res: Response) => {
    try {
      const invoices = await invoiceRepo.findAll();
      res.json(invoices);
    } catch {
      res.status(500).json({ message: 'Không thể tải hóa đơn' });
    }
  });

  router.get('/draft/:tableId', async (req: Request, res: Response) => {
    try {
      const items = await invoiceRepo.buildDraftItems(param(req.params.tableId));
      res.json({ items });
    } catch (error) {
      handleError(error, res);
    }
  });

  router.get('/:id/export', async (req: Request, res: Response) => {
    try {
      const invoice = await invoiceRepo.findById(param(req.params.id));
      if (!invoice) {
        res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        return;
      }

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${invoice.invoiceNumber}.json"`,
      );
      res.send(JSON.stringify(invoice, null, 2));
    } catch {
      res.status(500).json({ message: 'Không thể xuất hóa đơn' });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const invoice = await invoiceRepo.findById(param(req.params.id));
      if (!invoice) {
        res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        return;
      }
      res.json(invoice);
    } catch {
      res.status(500).json({ message: 'Không thể tải hóa đơn' });
    }
  });

  router.post('/', async (req: Request, res: Response) => {
    try {
      const { tableId, items, tax } = req.body;
      if (!tableId || !Array.isArray(items)) {
        res.status(400).json({ message: 'Thiếu thông tin hóa đơn' });
        return;
      }

      const invoice = await invoiceRepo.create(
        { tableId, items, tax: tax != null ? Number(tax) : 0 },
        req.user?.email ?? 'unknown',
      );
      res.status(201).json(invoice);
    } catch (error) {
      handleError(error, res);
    }
  });

  return router;
};
