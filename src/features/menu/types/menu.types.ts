export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMenuItemDto {
  name: string;
  price: number;
  description?: string;
  category?: string;
}

export interface UpdateMenuItemDto {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
}
