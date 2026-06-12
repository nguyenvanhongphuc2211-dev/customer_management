import { Router, type Request, type Response } from 'express';
import { requireRoles } from '../middleware/auth.js';
import { param } from '../utils/params.js';
import type { TableNoteRepository } from '../repositories/tableNoteRepository.js';
import type { TableOrderRepository } from '../repositories/tableOrderRepository.js';
import type { TableRepository } from '../repositories/tableRepository.js';
import type { TableNoteType, TableStatus } from '../types/table.types.js';

const VALID_STATUSES: TableStatus[] = ['empty', 'occupied', 'reserved', 'cleaning', 'billing'];
const VALID_NOTE_TYPES: TableNoteType[] = ['food', 'allergy', 'service', 'billing'];

const TABLE_VIEW_ROLES = ['admin', 'staff', 'cashier'] as const;
const KITCHEN_ROLES = ['admin', 'staff', 'kitchen', 'head_chef'] as const;
const TABLE_MANAGE_ROLES = ['admin', 'staff'] as const;
const MARK_DONE_ROLES = ['admin', 'staff', 'head_chef'] as const;

function handleError(error: unknown, res: Response): void {
  const msg = (error as Error).message;
  const map: Record<string, { status: number; message: string }> = {
    TABLE_NOT_FOUND: { status: 404, message: 'Không tìm thấy bàn' },
    TABLE_NOT_AVAILABLE: { status: 400, message: 'Bàn không sẵn sàng để mở' },
    TABLE_NOT_OCCUPIED: { status: 400, message: 'Bàn chưa có khách, không thể thêm ghi chú' },
    TABLE_HAS_ACTIVE_SESSION: { status: 400, message: 'Bàn đang có phiên phục vụ' },
    INVALID_STATUS_TRANSITION: { status: 400, message: 'Không thể chuyển trạng thái này' },
    ORDER_ITEMS_REQUIRED: { status: 400, message: 'Chọn ít nhất một món để order' },
    ORDER_ITEMS_INVALID: { status: 400, message: 'Số lượng món không hợp lệ' },
    TABLE_NOT_ORDERABLE: { status: 400, message: 'Bàn chưa sẵn sàng để order món' },
    MENU_ITEM_NOT_FOUND: { status: 404, message: 'Không tìm thấy món trong thực đơn' },
    RESERVATION_INVALID: { status: 400, message: 'Thông tin đặt bàn không hợp lệ' },
    ORDER_NOT_CANCELLABLE: { status: 400, message: 'Không thể hủy order này' },
  };
  const mapped = map[msg];
  if (mapped) {
    res.status(mapped.status).json({ message: mapped.message });
    return;
  }
  res.status(500).json({ message: 'Có lỗi xảy ra' });
}

export const createTableRoutes = (
  tableRepo: TableRepository,
  noteRepo: TableNoteRepository,
  orderRepo: TableOrderRepository,
) => {
  const router = Router();

  router.get('/', requireRoles(...TABLE_VIEW_ROLES), async (req: Request, res: Response) => {
    try {
      const status = VALID_STATUSES.includes(req.query.status as TableStatus)
        ? (req.query.status as TableStatus)
        : undefined;
      const tables = await tableRepo.findAll({
        areaId: req.query.areaId ? String(req.query.areaId) : undefined,
        status,
        search: req.query.search ? String(req.query.search) : undefined,
      });
      res.json(tables);
    } catch {
      res.status(500).json({ message: 'Không thể tải sơ đồ bàn' });
    }
  });

  router.get('/notes/pending', requireRoles(...KITCHEN_ROLES), async (req: Request, res: Response) => {
    try {
      const kitchenOnly = req.user?.role === 'kitchen' || req.user?.role === 'head_chef';
      const notes = await noteRepo.findPending(kitchenOnly);
      res.json(notes);
    } catch {
      res.status(500).json({ message: 'Không thể tải ghi chú' });
    }
  });

  router.get('/:id', requireRoles(...TABLE_VIEW_ROLES), async (req: Request, res: Response) => {
    try {
      const table = await tableRepo.findById(param(req.params.id));
      if (!table) {
        res.status(404).json({ message: 'Không tìm thấy bàn' });
        return;
      }
      const notes = table.currentSessionId
        ? await noteRepo.findByTable(table.id, table.currentSessionId)
        : [];
      const orders = table.currentSessionId
        ? await orderRepo.findByTable(table.id, table.currentSessionId)
        : [];
      res.json({ ...table, notes, orders });
    } catch {
      res.status(500).json({ message: 'Không thể tải thông tin bàn' });
    }
  });

  router.post('/:id/open', requireRoles(...TABLE_MANAGE_ROLES), async (req: Request, res: Response) => {
    try {
      const { guestCount, customerId } = req.body;
      if (!guestCount || guestCount < 1) {
        res.status(400).json({ message: 'Số khách phải >= 1' });
        return;
      }
      const table = await tableRepo.openTable(
        param(req.params.id),
        { guestCount: Number(guestCount), customerId },
        req.user?.email ?? 'unknown',
      );
      res.json(table);
    } catch (error) {
      handleError(error, res);
    }
  });

  router.post('/:id/close', requireRoles(...TABLE_MANAGE_ROLES), async (req: Request, res: Response) => {
    try {
      const table = await tableRepo.closeTable(param(req.params.id));
      res.json(table);
    } catch (error) {
      handleError(error, res);
    }
  });

  router.patch('/:id/status', requireRoles(...TABLE_MANAGE_ROLES), async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      if (!VALID_STATUSES.includes(status)) {
        res.status(400).json({ message: 'Trạng thái không hợp lệ' });
        return;
      }
      const table = await tableRepo.updateStatus(param(req.params.id), { status });
      res.json(table);
    } catch (error) {
      handleError(error, res);
    }
  });

  router.get('/:id/notes', requireRoles(...TABLE_VIEW_ROLES, ...KITCHEN_ROLES), async (req: Request, res: Response) => {
    try {
      const notes = await noteRepo.findByTable(param(req.params.id));
      res.json(notes);
    } catch {
      res.status(500).json({ message: 'Không thể tải ghi chú' });
    }
  });

  router.post('/:id/notes', requireRoles(...TABLE_MANAGE_ROLES), async (req: Request, res: Response) => {
    try {
      const { type, content } = req.body;
      if (!type || !content) {
        res.status(400).json({ message: 'Thiếu loại hoặc nội dung ghi chú' });
        return;
      }
      if (!VALID_NOTE_TYPES.includes(type)) {
        res.status(400).json({ message: 'Loại ghi chú không hợp lệ' });
        return;
      }
      const note = await noteRepo.create(
        { tableId: param(req.params.id), type, content },
        req.user?.email ?? 'unknown',
      );
      res.status(201).json(note);
    } catch (error) {
      handleError(error, res);
    }
  });

  router.post('/:id/orders', requireRoles(...TABLE_MANAGE_ROLES), async (req: Request, res: Response) => {
    try {
      const { items, note } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        res.status(400).json({ message: 'Chọn ít nhất một món để order' });
        return;
      }

      const result = await orderRepo.create(
        param(req.params.id),
        { items, note },
        req.user?.email ?? 'unknown',
      );
      res.status(201).json(result);
    } catch (error) {
      handleError(error, res);
    }
  });

  router.post('/:id/reserve', requireRoles(...TABLE_MANAGE_ROLES), async (req: Request, res: Response) => {
    try {
      const { guestName, guestPhone, guestCount, note } = req.body;
      if (!guestName || !guestCount) {
        res.status(400).json({ message: 'Tên khách và số khách là bắt buộc' });
        return;
      }
      const table = await tableRepo.reserveTable(param(req.params.id), {
        guestName,
        guestPhone,
        guestCount: Number(guestCount),
        note,
      });
      res.json(table);
    } catch (error) {
      handleError(error, res);
    }
  });

  return router;
};

export const createTableOrderRoutes = (orderRepo: TableOrderRepository) => {
  const router = Router();

  router.post('/:id/cancel', requireRoles(...TABLE_MANAGE_ROLES), async (req: Request, res: Response) => {
    try {
      const order = await orderRepo.cancel(param(req.params.id));
      if (!order) {
        res.status(404).json({ message: 'Không tìm thấy order' });
        return;
      }
      res.json(order);
    } catch (error) {
      handleError(error, res);
    }
  });

  return router;
};

export const createTableNoteRoutes = (
  noteRepo: TableNoteRepository,
  orderRepo: TableOrderRepository,
) => {
  const router = Router();

  router.patch('/:id', requireRoles(...TABLE_MANAGE_ROLES), async (req: Request, res: Response) => {
    try {
      const note = await noteRepo.update(param(req.params.id), req.body);
      if (!note) {
        res.status(404).json({ message: 'Không tìm thấy ghi chú' });
        return;
      }
      res.json(note);
    } catch {
      res.status(500).json({ message: 'Không thể cập nhật ghi chú' });
    }
  });

  router.post('/:id/done', requireRoles(...MARK_DONE_ROLES), async (req: Request, res: Response) => {
    try {
      const existing = await noteRepo.findById(param(req.params.id));
      if (!existing) {
        res.status(404).json({ message: 'Không tìm thấy ghi chú' });
        return;
      }

      const note = await noteRepo.markDone(existing.id);
      if (!note) {
        res.status(404).json({ message: 'Không tìm thấy ghi chú' });
        return;
      }

      if (existing.orderId) {
        await orderRepo.markDone(existing.orderId);
      }

      res.json(note);
    } catch {
      res.status(500).json({ message: 'Không thể cập nhật ghi chú' });
    }
  });

  router.delete('/:id', requireRoles(...TABLE_MANAGE_ROLES), async (req: Request, res: Response) => {
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
