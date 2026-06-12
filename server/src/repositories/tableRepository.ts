import { v4 as uuidv4 } from 'uuid';
import type { JsonStore } from '../storage/jsonStore.js';
import type {
  GetTablesParams,
  OpenTableDto,
  ReserveTableDto,
  RestaurantTable,
  TableSession,
  TableStatus,
  TableWithMeta,
  UpdateTableStatusDto,
} from '../types/table.types.js';
import type { TableOrderRepository } from './tableOrderRepository.js';
import type { TableAreaRepository } from './tableAreaRepository.js';
import type { TableNoteRepository } from './tableNoteRepository.js';

const closeActiveSession = async (
  sessionStore: JsonStore<TableSession[]>,
  sessionId: string | null,
  closedAt: string,
): Promise<void> => {
  if (!sessionId) return;

  const sessions = await sessionStore.read();
  const index = sessions.findIndex((s) => s.id === sessionId);
  if (index === -1 || sessions[index].closedAt) return;

  sessions[index].closedAt = closedAt;
  await sessionStore.write(sessions);
};

export const createTableRepository = (
  tableStore: JsonStore<RestaurantTable[]>,
  sessionStore: JsonStore<TableSession[]>,
  areaRepo: TableAreaRepository,
  noteRepo: TableNoteRepository,
  orderRepo: TableOrderRepository,
) => ({
  async findAll(params: GetTablesParams = {}): Promise<TableWithMeta[]> {
    const [tables, areas, sessions, notes] = await Promise.all([
      tableStore.read(),
      areaRepo.findAll(),
      sessionStore.read(),
      noteRepo.findAllRaw(),
    ]);

    const areaMap = new Map(areas.map((a) => [a.id, a]));
    const sessionMap = new Map(sessions.filter((s) => !s.closedAt).map((s) => [s.id, s]));

    let result = [...tables];

    if (params.areaId) {
      result = result.filter((t) => t.areaId === params.areaId);
    }
    if (params.status) {
      result = result.filter((t) => t.status === params.status);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          String(t.number).includes(q) ||
          (areaMap.get(t.areaId)?.name.toLowerCase().includes(q) ?? false),
      );
    }

    result.sort((a, b) => a.number - b.number);

    return result.map((table) => {
      const area = areaMap.get(table.areaId)!;
      const currentSession = table.currentSessionId
        ? (sessionMap.get(table.currentSessionId) ?? null)
        : null;
      const pendingNotesCount = notes.filter(
        (n) =>
          n.tableId === table.id &&
          n.status === 'pending' &&
          (!table.currentSessionId || n.sessionId === table.currentSessionId),
      ).length;

      return { ...table, area, pendingNotesCount, currentSession };
    });
  },

  async findById(id: string): Promise<TableWithMeta | null> {
    const all = await this.findAll();
    return all.find((t) => t.id === id) ?? null;
  },

  async openTable(id: string, dto: OpenTableDto, openedBy: string): Promise<TableWithMeta> {
    return tableStore.transaction(async (tables) => {
      const sessions = await sessionStore.read();
      const index = tables.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('TABLE_NOT_FOUND');
      if (tables[index].status !== 'empty' && tables[index].status !== 'reserved') {
        throw new Error('TABLE_NOT_AVAILABLE');
      }

      const now = new Date().toISOString();
      const session: TableSession = {
        id: uuidv4(),
        tableId: id,
        guestCount: dto.guestCount,
        openedAt: now,
        closedAt: null,
        openedBy,
        customerId: dto.customerId,
      };
      sessions.push(session);
      await sessionStore.write(sessions);

      tables[index] = {
        ...tables[index],
        status: 'occupied',
        currentSessionId: session.id,
        reservation: null,
        updatedAt: now,
      };

      return { next: tables, result: tables[index] };
    }).then(async (table) => {
      const full = await this.findById(table.id);
      if (!full) throw new Error('TABLE_NOT_FOUND');
      return full;
    });
  },

  async closeTable(id: string): Promise<TableWithMeta> {
    return tableStore.transaction(async (tables) => {
      const index = tables.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('TABLE_NOT_FOUND');

      const now = new Date().toISOString();
      await closeActiveSession(sessionStore, tables[index].currentSessionId, now);

      tables[index] = {
        ...tables[index],
        status: 'cleaning',
        currentSessionId: null,
        updatedAt: now,
      };

      return { next: tables, result: tables[index] };
    }).then(async (table) => {
      const full = await this.findById(table.id);
      if (!full) throw new Error('TABLE_NOT_FOUND');
      return full;
    });
  },

  async updateStatus(id: string, dto: UpdateTableStatusDto): Promise<TableWithMeta> {
    return tableStore.transaction(async (tables) => {
      const index = tables.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('TABLE_NOT_FOUND');

      const validTransitions: Record<TableStatus, TableStatus[]> = {
        empty: ['empty', 'reserved', 'occupied'],
        reserved: ['empty', 'occupied', 'reserved'],
        occupied: ['occupied', 'billing'],
        billing: ['billing', 'cleaning', 'occupied'],
        cleaning: ['cleaning', 'empty'],
      };

      if (!validTransitions[tables[index].status]?.includes(dto.status)) {
        throw new Error('INVALID_STATUS_TRANSITION');
      }

      const now = new Date().toISOString();
      const endsService = dto.status === 'cleaning' || dto.status === 'empty';

      if (endsService) {
        await closeActiveSession(sessionStore, tables[index].currentSessionId, now);
      }

      tables[index] = {
        ...tables[index],
        status: dto.status,
        currentSessionId: endsService ? null : tables[index].currentSessionId,
        reservation: dto.status === 'empty' ? null : tables[index].reservation ?? null,
        updatedAt: now,
      };

      if (dto.status === 'empty') {
        await noteRepo.deleteByTable(id);
        await orderRepo.deleteByTable(id);
      }

      return { next: tables, result: tables[index] };
    }).then(async (table) => {
      const full = await this.findById(table.id);
      if (!full) throw new Error('TABLE_NOT_FOUND');
      return full;
    });
  },

  async reserveTable(id: string, dto: ReserveTableDto): Promise<TableWithMeta> {
    return tableStore.transaction((tables) => {
      const index = tables.findIndex((t) => t.id === id);
      if (index === -1) throw new Error('TABLE_NOT_FOUND');
      if (tables[index].status !== 'empty') {
        throw new Error('TABLE_NOT_AVAILABLE');
      }

      const guestName = dto.guestName.trim();
      if (!guestName || !dto.guestCount || dto.guestCount < 1) {
        throw new Error('RESERVATION_INVALID');
      }

      const now = new Date().toISOString();
      tables[index] = {
        ...tables[index],
        status: 'reserved',
        reservation: {
          guestName,
          guestPhone: dto.guestPhone?.trim() || undefined,
          guestCount: dto.guestCount,
          note: dto.note?.trim() || undefined,
          reservedAt: now,
        },
        updatedAt: now,
      };

      return { next: tables, result: tables[index] };
    }).then(async (table) => {
      const full = await this.findById(table.id);
      if (!full) throw new Error('TABLE_NOT_FOUND');
      return full;
    });
  },
});

export type TableRepository = ReturnType<typeof createTableRepository>;
