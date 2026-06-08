import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import {
  useCreateCustomerGroup,
  useCustomerGroups,
  useDeleteCustomerGroup,
  useUpdateCustomerGroup,
} from '../hooks/useCustomerGroups';
import {
  customerGroupFormSchema,
  type CustomerGroupFormValues,
} from '../schemas/customerSchema';
import type { CustomerGroupWithCount } from '../types/customer.types';
import { CustomerGroupBadge } from './CustomerGroupBadge';
import { DeleteConfirmModal } from './DeleteConfirmModal';

export const CustomerGroupManagement = () => {
  const { canEdit } = useAuth();
  const { data: groups = [], isLoading } = useCustomerGroups();
  const createGroup = useCreateCustomerGroup();
  const updateGroup = useUpdateCustomerGroup();
  const deleteGroup = useDeleteCustomerGroup();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomerGroupWithCount | null>(null);
  const [deletingGroup, setDeletingGroup] = useState<CustomerGroupWithCount | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerGroupFormValues>({
    resolver: zodResolver(customerGroupFormSchema),
    defaultValues: { name: '', description: '', color: '#4F46E5' },
  });

  const openCreate = () => {
    setEditingGroup(null);
    reset({ name: '', description: '', color: '#4F46E5' });
    setIsFormOpen(true);
  };

  const openEdit = (group: CustomerGroupWithCount) => {
    setEditingGroup(group);
    reset({ name: group.name, description: group.description ?? '', color: group.color });
    setIsFormOpen(true);
  };

  const onSubmit = (values: CustomerGroupFormValues) => {
    if (editingGroup) {
      updateGroup.mutate(
        { id: editingGroup.id, payload: values },
        { onSuccess: () => setIsFormOpen(false) },
      );
    } else {
      createGroup.mutate(values, { onSuccess: () => setIsFormOpen(false) });
    }
  };

  return (
    <section id="groups" className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Nhóm khách hàng</h2>
          <p className="text-sm text-slate-500">Quản lý phân loại khách hàng</p>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={openCreate}
            className="cursor-pointer rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Thêm nhóm
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200" />
            ))
          : groups.map((group) => (
              <div
                key={group.id}
                className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <CustomerGroupBadge group={group} />
                  {group.description && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">{group.description}</p>
                  )}
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {group.customerCount} khách hàng
                  </p>
                </div>
                {canEdit && (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(group)}
                      aria-label={`Sửa nhóm ${group.name}`}
                      className="cursor-pointer rounded p-1 text-slate-400 hover:text-primary-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingGroup(group)}
                      aria-label={`Xóa nhóm ${group.name}`}
                      className="cursor-pointer rounded p-1 text-slate-400 hover:text-red-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 bg-slate-900/50" aria-label="Đóng" onClick={() => setIsFormOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingGroup ? 'Sửa nhóm' : 'Thêm nhóm mới'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label htmlFor="group-name" className="block text-sm font-medium text-slate-700">Tên nhóm</label>
                <input id="group-name" {...register('name')} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="group-desc" className="block text-sm font-medium text-slate-700">Mô tả</label>
                <input id="group-desc" {...register('description')} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
              </div>
              <div>
                <label htmlFor="group-color" className="block text-sm font-medium text-slate-700">Màu badge</label>
                <input id="group-color" type="color" {...register('color')} className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-slate-200" />
                {errors.color && <p className="mt-1 text-xs text-red-600">{errors.color.message}</p>}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</button>
                <button type="submit" disabled={createGroup.isPending || updateGroup.isPending} className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50">Lưu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deletingGroup}
        title="Xóa nhóm khách hàng"
        message={`Bạn có chắc muốn xóa nhóm "${deletingGroup?.name}"?`}
        isLoading={deleteGroup.isPending}
        onCancel={() => setDeletingGroup(null)}
        onConfirm={() => {
          if (deletingGroup) {
            deleteGroup.mutate(deletingGroup.id, {
              onSuccess: () => setDeletingGroup(null),
            });
          }
        }}
      />
    </section>
  );
};
