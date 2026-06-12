import { v4 as uuidv4 } from 'uuid';
import type { JsonStore } from '../storage/jsonStore.js';
import type {
  CreateTableNoteDto,
  RestaurantTable,
  TableNote,
  TableNoteStatus,
  UpdateTableNoteDto,
} from '../types/table.types.js';

export const createTableNoteRepository = (
  store: JsonStore<TableNote[]>,
  tableStore: JsonStore<RestaurantTable[]>,
) => ({
  async findAllRaw(): Promise<TableNote[]> {
    return store.read();
  },

  async findByTable(tableId: string, sessionId?: string): Promise<TableNote[]> {
    const notes = await store.read();
    return notes
      .filter((n) => {
        if (n.tableId !== tableId) return false;
        if (sessionId) return n.sessionId === sessionId;
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findPending(kitchenOnly = false): Promise<(TableNote & { tableLabel?: string })[]> {
    const [notes, tables] = await Promise.all([store.read(), tableStore.read()]);
    const tableMap = new Map(tables.map((t) => [t.id, t.label]));
    return notes
      .filter((n) => {
        if (n.status !== 'pending') return false;
        if (kitchenOnly && (n.type === 'billing' || n.type === 'service')) return false;
        if (kitchenOnly && n.type !== 'food' && n.type !== 'allergy') return false;
        return true;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((n) => ({ ...n, tableLabel: tableMap.get(n.tableId) }));
  },

  async create(dto: CreateTableNoteDto, createdBy: string): Promise<TableNote> {
    const tables = await tableStore.read();
    const table = tables.find((t) => t.id === dto.tableId);
    if (!table) throw new Error('TABLE_NOT_FOUND');
    if (!table.currentSessionId) throw new Error('TABLE_NOT_OCCUPIED');

    const now = new Date().toISOString();
    const note: TableNote = {
      id: uuidv4(),
      tableId: dto.tableId,
      sessionId: table.currentSessionId,
      type: dto.type,
      content: dto.content.trim(),
      status: 'pending',
      createdBy,
      createdAt: now,
      updatedAt: now,
    };

    return store.transaction((notes) => {
      notes.push(note);
      return { next: notes, result: note };
    });
  },

  async createLinkedOrder(
    dto: { tableId: string; sessionId: string; content: string; orderId: string },
    createdBy: string,
  ): Promise<TableNote> {
    const now = new Date().toISOString();
    const note: TableNote = {
      id: uuidv4(),
      tableId: dto.tableId,
      sessionId: dto.sessionId,
      type: 'food',
      content: dto.content,
      status: 'pending',
      orderId: dto.orderId,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };

    return store.transaction((notes) => {
      notes.push(note);
      return { next: notes, result: note };
    });
  },

  async update(id: string, dto: UpdateTableNoteDto): Promise<TableNote | null> {
    return store.transaction((notes) => {
      const index = notes.findIndex((n) => n.id === id);
      if (index === -1) return { next: notes, result: null };

      notes[index] = {
        ...notes[index],
        ...dto,
        updatedAt: new Date().toISOString(),
      };

      return { next: notes, result: notes[index] };
    });
  },

  async markDone(id: string): Promise<TableNote | null> {
    const note = await this.update(id, { status: 'done' as TableNoteStatus });
    return note;
  },

  async findById(id: string): Promise<TableNote | null> {
    const notes = await store.read();
    return notes.find((note) => note.id === id) ?? null;
  },

  async findByOrderId(orderId: string): Promise<TableNote | null> {
    const notes = await store.read();
    return notes.find((note) => note.orderId === orderId) ?? null;
  },

  async delete(id: string): Promise<boolean> {
    return store.transaction((notes) => {
      const filtered = notes.filter((n) => n.id !== id);
      if (filtered.length === notes.length) return { next: notes, result: false };
      return { next: filtered, result: true };
    });
  },

  async deleteByTable(tableId: string): Promise<number> {
    return store.transaction((notes) => {
      const filtered = notes.filter((n) => n.tableId !== tableId);
      const removed = notes.length - filtered.length;
      return { next: filtered, result: removed };
    });
  },
});

export type TableNoteRepository = ReturnType<typeof createTableNoteRepository>;
