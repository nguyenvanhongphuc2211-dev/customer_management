import { z } from 'zod';

export const menuItemSchema = z.object({
  name: z.string().min(2, 'Tên món phải có ít nhất 2 ký tự'),
  price: z.coerce.number().min(0, 'Giá phải >= 0'),
  description: z.string().optional(),
  category: z.string().optional(),
});

export type MenuItemFormValues = z.infer<typeof menuItemSchema>;
