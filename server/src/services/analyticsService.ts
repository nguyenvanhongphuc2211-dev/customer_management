import type { CustomerGroupRepository } from '../repositories/customerGroupRepository.js';
import type { CustomerRepository } from '../repositories/customerRepository.js';
import type { AnalyticsData, CustomerStatus } from '../types/customer.types.js';

export const createAnalyticsService = (
  customerRepo: CustomerRepository,
  groupRepo: CustomerGroupRepository,
) => ({
  async getAnalytics(): Promise<AnalyticsData> {
    const [records, groups] = await Promise.all([
      customerRepo.getActiveRecords(),
      groupRepo.findAll(),
    ]);

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const byStatus: Record<CustomerStatus, number> = {
      active: 0,
      inactive: 0,
      potential: 0,
      vip: 0,
    };

    const monthMap = new Map<string, { revenue: number; count: number }>();

    for (const r of records) {
      byStatus[r.status]++;
      const month = r.createdAt.slice(0, 7);
      const entry = monthMap.get(month) ?? { revenue: 0, count: 0 };
      entry.revenue += r.totalRevenue;
      entry.count++;
      monthMap.set(month, entry);
    }

    const byGroup = groups.map((g) => {
      const groupCustomers = records.filter((c) => c.groupId === g.id);
      return {
        groupId: g.id,
        name: g.name,
        color: g.color,
        count: groupCustomers.length,
        revenue: groupCustomers.reduce((s, c) => s + c.totalRevenue, 0),
      };
    });

    const revenueByMonth = [...monthMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => ({ month, ...data }));

    return {
      totalCustomers: records.length,
      activeCustomers: byStatus.active,
      vipCustomers: byStatus.vip,
      totalRevenue: records.reduce((s, c) => s + c.totalRevenue, 0),
      newCustomersLast30Days: records.filter(
        (c) => new Date(c.createdAt) >= thirtyDaysAgo,
      ).length,
      byStatus,
      byGroup,
      revenueByMonth,
    };
  },
});
