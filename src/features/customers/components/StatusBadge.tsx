import type { CustomerStatus } from '../types/customer.types';

const STATUS_STYLES: Record<CustomerStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  inactive: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  potential: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  vip: 'bg-violet-50 text-violet-700 ring-violet-600/20',
};

const STATUS_LABELS: Record<CustomerStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Ngừng HĐ',
  potential: 'Tiềm năng',
  vip: 'VIP',
};

interface StatusBadgeProps {
  status: CustomerStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
  >
    {STATUS_LABELS[status]}
  </span>
);
