import { v4 as uuidv4 } from 'uuid';
import type { JsonStore } from '../storage/jsonStore.js';
import type {
  CreateTableOrderDto,
  RestaurantTable,
  TableNote,
  TableOrder,
  TableOrderItem,
} from '../types/table.types.js';
import type { MenuRepository } from './menuRepository.js';
import type { TableNoteRepository } from './tableNoteRepository.js';

const formatOrderContent = (items: TableOrderItem[], note?: string): string => {
  const lines = items.map((item) => `${item.quantity}× ${item.menuItemName}`).join(', ');
  let content = `Order: ${lines}`;
  if (note?.trim()) {
    content += ` — ${note.trim()}`;
  }
  return content;
};

export const createTableOrderRepository = (
  store: JsonStore<TableOrder[]>,
  tableStore: JsonStore<RestaurantTable[]>,
  menuRepo: MenuRepository,
  noteRepo: TableNoteRepository,
) => ({
  async findByTable(tableId: string, sessionId?: string): Promise<TableOrder[]> {
    const orders = await store.read();
    return orders
      .filter((order) => {
        if (order.tableId !== tableId) return false;
        if (sessionId) return order.sessionId === sessionId;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async create(
    tableId: string,
    dto: CreateTableOrderDto,
    createdBy: string,
  ): Promise<{ order: TableOrder; note: TableNote }> {
    if (!dto.items?.length) throw new Error('ORDER_ITEMS_REQUIRED');

    const tables = await tableStore.read();
    const table = tables.find((t) => t.id === tableId);
    if (!table) throw new Error('TABLE_NOT_FOUND');
    if (!table.currentSessionId) throw new Error('TABLE_NOT_OCCUPIED');
    if (table.status !== 'occupied' && table.status !== 'billing') {
      throw new Error('TABLE_NOT_ORDERABLE');
    }

    const menuItems = await menuRepo.findAll();
    const menuMap = new Map(menuItems.map((item) => [item.id, item]));
    const resolvedItems: TableOrderItem[] = [];

    for (const line of dto.items) {
      const quantity = Number(line.quantity);
      if (!line.menuItemId || !quantity || quantity < 1) {
        throw new Error('ORDER_ITEMS_INVALID');
      }

      const menuItem = menuMap.get(line.menuItemId);
      if (!menuItem) throw new Error('MENU_ITEM_NOT_FOUND');

      resolvedItems.push({
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        quantity,
        unitPrice: menuItem.price,
      });
    }

    const now = new Date().toISOString();
    const orderId = uuidv4();
    const order: TableOrder = {
      id: orderId,
      tableId,
      sessionId: table.currentSessionId,
      items: resolvedItems,
      status: 'pending',
      note: dto.note?.trim() || undefined,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await store.transaction((orders) => {
      orders.push(order);
      return { next: orders, result: order };
    });

    const note = await noteRepo.createLinkedOrder(
      {
        tableId,
        sessionId: table.currentSessionId,
        content: formatOrderContent(resolvedItems, dto.note),
        orderId,
      },
      createdBy,
    );

    return { order, note };
  },

  async markDone(orderId: string): Promise<TableOrder | null> {
    return store.transaction((orders) => {
      const index = orders.findIndex((order) => order.id === orderId);
      if (index === -1) return { next: orders, result: null };

      orders[index] = {
        ...orders[index],
        status: 'done',
        updatedAt: new Date().toISOString(),
      };

      return { next: orders, result: orders[index] };
    });
  },

  async cancel(orderId: string): Promise<TableOrder | null> {
    const orders = await store.read();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;
    if (order.status !== 'pending') throw new Error('ORDER_NOT_CANCELLABLE');

    const updated = await store.transaction((all) => {
      const index = all.findIndex((o) => o.id === orderId);
      if (index === -1) return { next: all, result: null };

      all[index] = {
        ...all[index],
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      };

      return { next: all, result: all[index] };
    });

    if (updated) {
      const note = await noteRepo.findByOrderId(orderId);
      if (note && note.status === 'pending') {
        await noteRepo.update(note.id, {
          status: 'done',
          content: `[ĐÃ HỦY] ${note.content}`,
        });
      }
    }

    return updated;
  },

  async deleteByTable(tableId: string): Promise<number> {
    return store.transaction((orders) => {
      const filtered = orders.filter((order) => order.tableId !== tableId);
      const removed = orders.length - filtered.length;
      return { next: filtered, result: removed };
    });
  },
});

export type TableOrderRepository = ReturnType<typeof createTableOrderRepository>;
