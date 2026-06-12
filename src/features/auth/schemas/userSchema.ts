import { z } from 'zod';

export const createUserSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.enum(['admin', 'staff', 'cashier', 'kitchen', 'head_chef'], {
    message: 'Vui lòng chọn vai trò',
  }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
