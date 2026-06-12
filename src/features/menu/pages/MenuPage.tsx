import { useAuth } from '@/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DeleteConfirmModal } from '@/features/customers/components/DeleteConfirmModal';
import { useCreateMenuItem, useDeleteMenuItem, useMenuItems, useUpdateMenuItem } from '../hooks/useMenu';
import { menuItemSchema, type MenuItemFormValues } from '../schemas/menuSchema';
import type { MenuItem } from '../types/menu.types';

const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const defaultValues: MenuItemFormValues = {
  name: '',
  price: 0,
  description: '',
  category: 'Món chính',
};

export const MenuPage = () => {
  const { permissions } = useAuth();
  const { data: items = [], isLoading } = useMenuItems();
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const deleteItem = useDeleteMenuItem();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues,
  });

  const onSubmit = (values: MenuItemFormValues) => {
    if (editingItem) {
      updateItem.mutate(
        {
          id: editingItem.id,
          dto: {
            name: values.name,
            price: values.price,
            description: values.description || undefined,
            category: values.category || undefined,
          },
        },
        {
          onSuccess: () => {
            reset(defaultValues);
            setEditingItem(null);
          },
        },
      );
      return;
    }

    createItem.mutate(
      {
        name: values.name,
        price: values.price,
        description: values.description || undefined,
        category: values.category || undefined,
      },
      {
        onSuccess: () => {
          reset(defaultValues);
          setShowForm(false);
        },
      },
    );
  };

  return (
    <div className="max-w-3xl">
      <div className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="page-title">Thực đơn</h2>
            <p className="page-subtitle mt-1">
              {permissions.canManageMenu
                ? 'Quản lý danh sách món ăn phục vụ'
                : 'Danh sách món ăn hiện có'}
            </p>
          </div>
          {permissions.canManageMenu && (
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                reset(defaultValues);
                setShowForm((v) => !v);
              }}
              className="btn-primary shrink-0"
            >
              {showForm ? 'Đóng form' : 'Thêm món'}
            </button>
          )}
        </div>

        {(permissions.canManageMenu && (showForm || editingItem)) && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-4 space-y-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700"
          >
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {editingItem ? `Sửa món: ${editingItem.name}` : 'Thêm món mới'}
            </p>
            <div>
              <label htmlFor="menu-name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tên món
              </label>
              <input id="menu-name" {...register('name')} className="input-field w-full" />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="menu-price" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Giá (VND)
                </label>
                <input id="menu-price" type="number" min={0} step={1000} {...register('price')} className="input-field w-full" />
                {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
              </div>
              <div>
                <label htmlFor="menu-category" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Loại món
                </label>
                <input id="menu-category" {...register('category')} className="input-field w-full" placeholder="Món chính" />
              </div>
            </div>
            <div>
              <label htmlFor="menu-description" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Mô tả
              </label>
              <textarea id="menu-description" rows={2} {...register('description')} className="input-field w-full" />
            </div>
            <button type="submit" disabled={createItem.isPending || updateItem.isPending} className="btn-primary w-full">
              {createItem.isPending || updateItem.isPending
                ? 'Đang lưu...'
                : editingItem
                  ? 'Cập nhật món'
                  : 'Thêm vào thực đơn'}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  reset(defaultValues);
                }}
                className="btn-secondary w-full"
              >
                Hủy sửa
              </button>
            )}
          </form>
        )}

        <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-700">
          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-400">Đang tải...</p>
          ) : items.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Thực đơn đang trống</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{item.name}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {item.category}
                    </span>
                  </div>
                  {item.description && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                  )}
                  <p className="mt-2 text-sm font-semibold text-primary-700 dark:text-primary-300">
                    {formatMoney(item.price)}
                  </p>
                </div>
                {permissions.canManageMenu && (
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(item);
                        setShowForm(false);
                        reset({
                          name: item.name,
                          price: item.price,
                          description: item.description ?? '',
                          category: item.category,
                        });
                      }}
                      className="btn-secondary text-sm"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingItem(item)}
                      className="btn-secondary text-sm text-red-600 hover:border-red-300 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={!!deletingItem}
        title="Xóa món khỏi thực đơn"
        message={`Bạn có chắc muốn xóa "${deletingItem?.name}" khỏi thực đơn?`}
        isLoading={deleteItem.isPending}
        onCancel={() => setDeletingItem(null)}
        onConfirm={() => {
          if (deletingItem) {
            deleteItem.mutate(deletingItem.id, {
              onSuccess: () => setDeletingItem(null),
            });
          }
        }}
      />
    </div>
  );
};
