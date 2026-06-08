import type { CustomerGroupWithCount, CustomerStatus } from '../types/customer.types';

interface BulkActionBarProps {
  selectedCount: number;
  groups: CustomerGroupWithCount[];
  onClear: () => void;
  onDelete: () => void;
  onUpdateStatus: (status: CustomerStatus) => void;
  onUpdateGroup: (groupId: string) => void;
  isLoading?: boolean;
}

export const BulkActionBar = ({
  selectedCount,
  groups,
  onClear,
  onDelete,
  onUpdateStatus,
  onUpdateGroup,
  isLoading,
}: BulkActionBarProps) => (
  <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3">
    <span className="text-sm font-medium text-primary-700">
      Đã chọn {selectedCount} khách hàng
    </span>
    <select
      aria-label="Đổi trạng thái hàng loạt"
      defaultValue=""
      disabled={isLoading}
      onChange={(e) => {
        if (e.target.value) onUpdateStatus(e.target.value as CustomerStatus);
        e.target.value = '';
      }}
      className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm disabled:opacity-50"
    >
      <option value="">Đổi trạng thái...</option>
      <option value="active">Hoạt động</option>
      <option value="inactive">Ngừng HĐ</option>
      <option value="potential">Tiềm năng</option>
      <option value="vip">VIP</option>
    </select>
    <select
      aria-label="Đổi nhóm hàng loạt"
      defaultValue=""
      disabled={isLoading}
      onChange={(e) => {
        if (e.target.value) onUpdateGroup(e.target.value);
        e.target.value = '';
      }}
      className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm disabled:opacity-50"
    >
      <option value="">Đổi nhóm...</option>
      {groups.map((g) => (
        <option key={g.id} value={g.id}>{g.name}</option>
      ))}
    </select>
    <button
      type="button"
      onClick={onDelete}
      disabled={isLoading}
      className="cursor-pointer rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
    >
      Xóa đã chọn
    </button>
    <button
      type="button"
      onClick={onClear}
      className="cursor-pointer text-sm text-slate-500 hover:text-slate-700"
    >
      Bỏ chọn
    </button>
  </div>
);
