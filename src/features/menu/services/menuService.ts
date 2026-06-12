import type { AxiosInstance } from 'axios';
import type { CreateMenuItemDto, MenuItem, UpdateMenuItemDto } from '../types/menu.types';

export const createMenuService = (httpClient: AxiosInstance) => ({
  list: async (): Promise<MenuItem[]> => {
    const { data } = await httpClient.get<MenuItem[]>('/menu');
    return data;
  },

  create: async (dto: CreateMenuItemDto): Promise<MenuItem> => {
    const { data } = await httpClient.post<MenuItem>('/menu', dto);
    return data;
  },

  update: async (id: string, dto: UpdateMenuItemDto): Promise<MenuItem> => {
    const { data } = await httpClient.patch<MenuItem>(`/menu/${id}`, dto);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`/menu/${id}`);
  },
});

export type MenuService = ReturnType<typeof createMenuService>;
