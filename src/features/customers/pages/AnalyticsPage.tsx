import { formatVND } from '@/utils/format';
import { useAnalytics } from '../hooks/useAnalytics';
import { StatusBadge } from '../components/StatusBadge';
import type { CustomerStatus } from '../types/customer.types';

const STATUS_ORDER: CustomerStatus[] = ['active', 'vip', 'potential', 'inactive'];

export const AnalyticsPage = () => {
  const { data, isLoading, isError } = useAnalytics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Không thể tải dữ liệu thống kê
      </div>
    );
  }

  const maxGroupCount = Math.max(...data.byGroup.map((g) => g.count), 1);
  const maxMonthRevenue = Math.max(...data.revenueByMonth.map((m) => m.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Tổng KH', value: data.totalCustomers },
          { label: 'Đang hoạt động', value: data.activeCustomers },
          { label: 'VIP', value: data.vipCustomers },
          { label: 'KH mới (30 ngày)', value: data.newCustomersLast30Days },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">Tổng doanh thu</p>
        <p className="mt-1 text-3xl font-bold text-slate-900">{formatVND(data.totalRevenue)}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-slate-900">Theo trạng thái</h3>
          <div className="space-y-3">
            {STATUS_ORDER.map((status) => {
              const count = data.byStatus[status];
              const pct = data.totalCustomers > 0 ? (count / data.totalCustomers) * 100 : 0;
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between">
                    <StatusBadge status={status} />
                    <span className="text-sm text-slate-600">{count} ({pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-primary-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-slate-900">Theo nhóm KH</h3>
          <div className="space-y-4">
            {data.byGroup.map((g) => (
              <div key={g.groupId}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium" style={{ color: g.color }}>{g.name}</span>
                  <span className="text-slate-500">{g.count} KH · {formatVND(g.revenue)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{ width: `${(g.count / maxGroupCount) * 100}%`, backgroundColor: g.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-semibold text-slate-900">Doanh thu theo tháng tạo KH</h3>
        <div className="flex items-end gap-2 overflow-x-auto pb-2" style={{ minHeight: 160 }}>
          {data.revenueByMonth.map((m) => (
            <div key={m.month} className="flex min-w-[48px] flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-primary-500 transition-all"
                style={{ height: `${Math.max(8, (m.revenue / maxMonthRevenue) * 120)}px` }}
                title={formatVND(m.revenue)}
              />
              <span className="text-[10px] text-slate-400">{m.month.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
