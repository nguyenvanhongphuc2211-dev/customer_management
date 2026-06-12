import { v4 as uuidv4 } from 'uuid';
import type { JsonStore } from '../storage/jsonStore.js';
import type { CreateMenuItemDto, MenuItem, UpdateMenuItemDto } from '../types/menu.types.js';

export const createMenuRepository = (store: JsonStore<MenuItem[]>) => ({
  async findAll(): Promise<MenuItem[]> {
    const items = await store.read();
    return items.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  },

  async findById(id: string): Promise<MenuItem | null> {
    const items = await store.read();
    return items.find((item) => item.id === id) ?? null;
  },

  async create(dto: CreateMenuItemDto): Promise<MenuItem> {
    const name = dto.name.trim();
    if (!name) throw new Error('MENU_NAME_REQUIRED');
    if (dto.price == null || Number(dto.price) < 0) throw new Error('MENU_PRICE_INVALID');

    return store.transaction(async (items) => {
      if (items.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('MENU_NAME_EXISTS');
      }

      const now = new Date().toISOString();
      const item: MenuItem = {
        id: uuidv4(),
        name,
        price: Number(dto.price),
        description: dto.description?.trim() || undefined,
        category: dto.category?.trim() || 'Món chính',
        createdAt: now,
        updatedAt: now,
      };

      items.push(item);
      return { next: items, result: item };
    });
  },

  async update(id: string, dto: UpdateMenuItemDto): Promise<MenuItem | null> {
    return store.transaction((items) => {
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return { next: items, result: null };

      const name = dto.name?.trim();
      if (name && items.some((item, i) => i !== index && item.name.toLowerCase() === name.toLowerCase())) {
        throw new Error('MENU_NAME_EXISTS');
      }
      if (dto.price != null && Number(dto.price) < 0) {
        throw new Error('MENU_PRICE_INVALID');
      }

      items[index] = {
        ...items[index],
        ...(name ? { name } : {}),
        ...(dto.price != null ? { price: Number(dto.price) } : {}),
        ...(dto.description !== undefined ? { description: dto.description.trim() || undefined } : {}),
        ...(dto.category !== undefined ? { category: dto.category.trim() || 'Món chính' } : {}),
        updatedAt: new Date().toISOString(),
      };

      return { next: items, result: items[index] };
    });
  },

  async delete(id: string): Promise<boolean> {
    return store.transaction((items) => {
      const filtered = items.filter((item) => item.id !== id);
      if (filtered.length === items.length) return { next: items, result: false };
      return { next: filtered, result: true };
    });
  },
});

export type MenuRepository = ReturnType<typeof createMenuRepository>;
