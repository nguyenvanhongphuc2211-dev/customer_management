import type { CustomerStatus } from '../types/customer.types';
import type { CustomerGroupWithCount } from '../types/customer.types';

interface CustomerFiltersProps {
  search: string;
  status: CustomerStatus | '';
  groupId: string;
  groups: CustomerGroupWithCount[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CustomerStatus | '') => void;
  onGroupChange: (value: string) => void;
}

export const CustomerFilters = ({
  search,
  status,
  groupId,
  groups,
  onSearchChange,
  onStatusChange,
  onGroupChange,
}: CustomerFiltersProps) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
    <div className="relative flex-1">
      <label htmlFor="customer-search" className="sr-only">
        Tìm kiếm khách hàng
      </label>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        id="customer-search"
        type="search"
        placeholder="Tìm theo tên, email, SĐT, mã KH..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      />
    </div>

    <div className="flex gap-3">
      <div>
        <label htmlFor="status-filter" className="sr-only">
          Lọc theo trạng thái
        </label>
        <select
          id="status-filter"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as CustomerStatus | '')}
          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="inactive">Ngừng HĐ</option>
          <option value="potential">Tiềm năng</option>
          <option value="vip">VIP</option>
        </select>
      </div>

      <div>
        <label htmlFor="group-filter" className="sr-only">
          Lọc theo nhóm
        </label>
        <select
          id="group-filter"
          value={groupId}
          onChange={(e) => onGroupChange(e.target.value)}
          className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option value="">Tất cả nhóm</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);
