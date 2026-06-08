import type { CustomerGroup } from '../types/customer.types';

interface CustomerGroupBadgeProps {
  group: CustomerGroup;
}

export const CustomerGroupBadge = ({ group }: CustomerGroupBadgeProps) => (
  <span
    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
    style={{
      backgroundColor: `${group.color}18`,
      color: group.color,
      borderColor: `${group.color}40`,
    }}
  >
    {group.name}
  </span>
);
