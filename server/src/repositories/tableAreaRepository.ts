import type { JsonStore } from '../storage/jsonStore.js';
import type { TableArea } from '../types/table.types.js';

export const createTableAreaRepository = (store: JsonStore<TableArea[]>) => ({
  async findAll(): Promise<TableArea[]> {
    const areas = await store.read();
    return [...areas].sort((a, b) => a.sortOrder - b.sortOrder);
  },

  async findById(id: string): Promise<TableArea | undefined> {
    const areas = await store.read();
    return areas.find((a) => a.id === id);
  },
});

export type TableAreaRepository = ReturnType<typeof createTableAreaRepository>;
