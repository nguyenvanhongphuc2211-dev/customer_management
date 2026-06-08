import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { customerFormSchema as schema, type CustomerFormValues } from '../schemas/customerSchema';
import type { Customer, CustomerGroupWithCount } from '../types/customer.types';

interface CustomerFormProps {
  isOpen: boolean;
  customer?: Customer | null;
  groups: CustomerGroupWithCount[];
  isLoading?: boolean;
  onSubmit: (values: CustomerFormValues) => void;
  onClose: () => void;
}

const defaultValues: CustomerFormValues = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  address: '',
  status: 'active',
  groupId: '',
};

export const CustomerForm = ({
  isOpen,
  customer,
  groups,
  isLoading,
  onSubmit,
  onClose,
}: CustomerFormProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (customer) {
      reset({
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
        company: customer.company ?? '',
        address: customer.address ?? '',
        status: customer.status,
        groupId: customer.group.id,
        lastContactAt: customer.lastContactAt.split('T')[0],
      });
    } else {
      reset({
        ...defaultValues,
        groupId: groups[0]?.id ?? '',
      });
    }
  }, [customer, groups, reset, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customer-form-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50"
        aria-label="Đóng"
        onClick={onClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 id="customer-form-title" className="text-lg font-semibold text-slate-900">
          {customer ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
              Họ tên <span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              {...register('fullName')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                {...register('phone')}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-slate-700">
              Công ty
            </label>
            <input
              id="company"
              {...register('company')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-slate-700">
              Địa chỉ
            </label>
            <input
              id="address"
              {...register('address')}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-slate-700">
                Trạng thái <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                {...register('status')}
                className="mt-1 w-full cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng HĐ</option>
                <option value="potential">Tiềm năng</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div>
              <label htmlFor="groupId" className="block text-sm font-medium text-slate-700">
                Nhóm KH <span className="text-red-500">*</span>
              </label>
              <select
                id="groupId"
                {...register('groupId')}
                className="mt-1 w-full cursor-pointer rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">-- Chọn nhóm --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
              {errors.groupId && (
                <p className="mt-1 text-xs text-red-600">{errors.groupId.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {isLoading ? 'Đang lưu...' : customer ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
