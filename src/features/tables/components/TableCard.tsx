import type { TableWithMeta } from '../types/table.types';
import { TABLE_STATUS_COLORS, TABLE_STATUS_LABELS } from '../types/table.types';

interface TableCardProps {
  table: TableWithMeta;
  onClick: (table: TableWithMeta) => void;
}

export const TableCard = ({ table, onClick }: TableCardProps) => (
  <button
    type="button"
    onClick={() => onClick(table)}
    className={`relative flex min-h-[88px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-2 transition-colors duration-200 hover:shadow-md ${TABLE_STATUS_COLORS[table.status]}`}
    aria-label={`Bàn ${table.label}, ${TABLE_STATUS_LABELS[table.status]}`}
  >
    <span className="text-lg font-bold">{table.label}</span>
    <span className="mt-0.5 text-[10px] font-medium uppercase opacity-80">
      {TABLE_STATUS_LABELS[table.status]}
    </span>
    {table.currentSession && (
      <span className="mt-1 text-xs opacity-90">{table.currentSession.guestCount} khách</span>
    )}
    {table.pendingNotesCount > 0 && (
      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
        {table.pendingNotesCount}
      </span>
    )}
  </button>
);
