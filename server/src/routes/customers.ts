import { Router, type Request, type Response } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import type { createCsvImportService } from '../services/csvImportService.js';
import { param } from '../utils/params.js';
import type { CustomerRepository } from '../repositories/customerRepository.js';
import type { CustomerStatus, GetCustomersParams } from '../types/customer.types.js';

const VALID_STATUSES: CustomerStatus[] = ['active', 'inactive', 'potential', 'vip'];

function parseParams(req: Request): GetCustomersParams {
  const deletedParam = req.query.deleted;
  return {
    page: req.query.page ? parseInt(String(req.query.page), 10) : 1,
    limit: req.query.limit ? parseInt(String(req.query.limit), 10) : 10,
    search: req.query.search ? String(req.query.search) : undefined,
    status: VALID_STATUSES.includes(req.query.status as CustomerStatus)
      ? (req.query.status as CustomerStatus)
      : undefined,
    groupId: req.query.groupId ? String(req.query.groupId) : undefined,
    sortBy: req.query.sortBy ? String(req.query.sortBy) : undefined,
    sortOrder: req.query.sortOrder === 'desc' ? 'desc' : 'asc',
    deleted: deletedParam === 'only' ? 'only' : 'exclude',
  };
}

function handleCustomerError(error: unknown, res: Response): void {
  const message = (error as Error).message;
  if (message === 'GROUP_NOT_FOUND') {
    res.status(400).json({ message: 'Nhóm khách hàng không tồn tại' });
    return;
  }
  if (message === 'DUPLICATE_CUSTOMER') {
    res.status(409).json({ message: 'Email hoặc số điện thoại đã tồn tại' });
    return;
  }
  res.status(500).json({ message: 'Có lỗi xảy ra' });
}

export const createCustomerRoutes = (
  customerRepo: CustomerRepository,
  csvImportService: ReturnType<typeof createCsvImportService>,
) => {
  const router = Router();

  router.get('/export', async (req: Request, res: Response) => {
    try {
      const customers = await customerRepo.findAllFiltered(parseParams(req));
      const csv = customerRepo.exportToCsv(customers);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
      res.send(csv);
    } catch {
      res.status(500).json({ message: 'Không thể xuất dữ liệu' });
    }
  });

  router.get('/export-template', (_req: Request, res: Response) => {
    const template =
      '\uFEFFHọ tên,Email,SĐT,Công ty,Địa chỉ,Nhóm,Trạng thái\n"Nguyễn Văn A","a@example.com","0901234567","Acme Corp","Hà Nội","Doanh nghiệp","active"';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="import-template.csv"');
    res.send(template);
  });

  router.post('/import', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { csv } = req.body;
      if (!csv || typeof csv !== 'string') {
        res.status(400).json({ message: 'Nội dung CSV không hợp lệ' });
        return;
      }
      const result = await csvImportService.importFromCsv(csv);
      res.json(result);
    } catch {
      res.status(500).json({ message: 'Không thể import CSV' });
    }
  });

  router.post('/bulk', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { action, ids, status, groupId } = req.body;
      if (!action || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ message: 'Thiếu thông tin thao tác hàng loạt' });
        return;
      }
      const result = await customerRepo.bulkAction({ action, ids, status, groupId });
      res.json(result);
    } catch {
      res.status(500).json({ message: 'Không thể thực hiện thao tác hàng loạt' });
    }
  });

  router.get('/', async (req: Request, res: Response) => {
    try {
      const result = await customerRepo.findAll(parseParams(req));
      res.json(result);
    } catch {
      res.status(500).json({ message: 'Không thể tải danh sách khách hàng' });
    }
  });

  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const customer = await customerRepo.findById(param(req.params.id));
      if (!customer) {
        res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        return;
      }
      res.json(customer);
    } catch {
      res.status(500).json({ message: 'Không thể tải thông tin khách hàng' });
    }
  });

  router.post('/', requireAdmin, async (req: Request, res: Response) => {
    try {
      const { fullName, email, phone, company, address, status, groupId, lastContactAt } =
        req.body;

      if (!fullName || !email || !phone || !status || !groupId) {
        res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        return;
      }

      const customer = await customerRepo.create({
        fullName,
        email,
        phone,
        company,
        address,
        status,
        groupId,
        lastContactAt,
      });
      res.status(201).json(customer);
    } catch (error) {
      handleCustomerError(error, res);
    }
  });

  router.put('/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const customer = await customerRepo.update(param(req.params.id), req.body);
      if (!customer) {
        res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        return;
      }
      res.json(customer);
    } catch (error) {
      handleCustomerError(error, res);
    }
  });

  router.post('/:id/restore', requireAdmin, async (req: Request, res: Response) => {
    try {
      const customer = await customerRepo.restore(param(req.params.id));
      if (!customer) {
        res.status(404).json({ message: 'Không tìm thấy khách hàng trong thùng rác' });
        return;
      }
      res.json(customer);
    } catch (error) {
      handleCustomerError(error, res);
    }
  });

  router.delete('/:id/permanent', requireAdmin, async (req: Request, res: Response) => {
    try {
      const deleted = await customerRepo.permanentDelete(param(req.params.id));
      if (!deleted) {
        res.status(404).json({ message: 'Không tìm thấy khách hàng trong thùng rác' });
        return;
      }
      res.status(204).send();
    } catch {
      res.status(500).json({ message: 'Không thể xóa vĩnh viễn' });
    }
  });

  router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const deleted = await customerRepo.softDelete(param(req.params.id));
      if (!deleted) {
        res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        return;
      }
      res.status(204).send();
    } catch {
      res.status(500).json({ message: 'Không thể xóa khách hàng' });
    }
  });

  return router;
};
