import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ROLE_LABELS } from '../constants/roles';
import { useCreateUser, useUsers } from '../hooks/useUsers';
import { createUserSchema, type CreateUserFormValues } from '../schemas/userSchema';

const defaultValues: CreateUserFormValues = {
  fullName: '',
  email: '',
  password: '',
  role: 'staff',
};

export const UserManagement = () => {
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  });

  const onSubmit = (values: CreateUserFormValues) => {
    createUser.mutate(values, {
      onSuccess: () => {
        reset(defaultValues);
        setShowForm(false);
      },
    });
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="page-title">Quản lý tài khoản</h2>
          <p className="page-subtitle mt-1">Tạo tài khoản cho nhân viên hoặc quản trị viên</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="btn-primary shrink-0"
        >
          {showForm ? 'Đóng form' : 'Tạo tài khoản'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <div>
            <label htmlFor="user-fullName" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Họ tên
            </label>
            <input id="user-fullName" {...register('fullName')} className="input-field w-full" />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
          </div>
          <div>
            <label htmlFor="user-email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Email
            </label>
            <input id="user-email" type="email" {...register('email')} className="input-field w-full" />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="user-password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Mật khẩu
            </label>
            <input id="user-password" type="password" {...register('password')} className="input-field w-full" />
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="user-role" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Vai trò
            </label>
            <select id="user-role" {...register('role')} className="select-field w-full">
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
          </div>
          <button type="submit" disabled={createUser.isPending} className="btn-primary w-full">
            {createUser.isPending ? 'Đang tạo...' : 'Tạo tài khoản'}
          </button>
        </form>
      )}

      <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-700">
        {isLoading ? (
          <div className="py-4 text-sm text-slate-400">Đang tải...</div>
        ) : users.length === 0 ? (
          <div className="py-4 text-sm text-slate-400">Chưa có tài khoản nào</div>
        ) : (
          users.map((account) => (
            <div key={account.id} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{account.fullName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{account.email}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  account.role === 'admin'
                    ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {ROLE_LABELS[account.role]}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
