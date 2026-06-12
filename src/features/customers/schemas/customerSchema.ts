import { z } from 'zod';

export const customerStatusSchema = z.enum(['active', 'inactive', 'potential', 'vip']);

export const customerFormSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z
    .string()
    .min(10, 'Số điện thoại phải có ít nhất 10 số')
    .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ'),
  company: z.string().optional(),
  address: z.string().optional(),
  status: customerStatusSchema,
  groupId: z.string().min(1, 'Vui lòng chọn nhóm khách hàng'),
  lastContactAt: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerFormSchema>;

export const customerGroupFormSchema = z.object({
  name: z.string().min(2, 'Tên nhóm phải có ít nhất 2 ký tự'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Màu phải là mã hex hợp lệ'),
});

export type CustomerGroupFormValues = z.infer<typeof customerGroupFormSchema>;

export const customerSchema = z.object({
  id: z.string(),
  code: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  company: z.string().optional(),
  address: z.string().optional(),
  status: customerStatusSchema,
  group: z.object({
    id: z.string(),
    name: z.string(),
    color: z.string(),
    description: z.string().optional(),
  }),
  totalTransactions: z.number(),
  totalRevenue: z.number(),
  lastContactAt: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export const paginatedCustomerSchema = z.object({
  data: z.array(customerSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});
