import { useAuth } from '@/contexts/AuthContext';
import { formatDate, formatVND } from '@/utils/format';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CustomerGroupBadge } from '../components/CustomerGroupBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useContactNotes, useCreateContactNote } from '../hooks/useContactNotes';
import { useCustomer } from '../hooks/useCustomer';
import type { ContactNoteType } from '../types/customer.types';

const NOTE_TYPES: { value: ContactNoteType; label: string }[] = [
  { value: 'call', label: 'Gọi điện' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Họp' },
  { value: 'note', label: 'Ghi chú' },
];

const NOTE_ICONS: Record<ContactNoteType, string> = {
  call: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z',
  email: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  meeting: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  note: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125',
};

export const CustomerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { canEdit } = useAuth();
  const { data: customer, isLoading, isError } = useCustomer(id ?? null);
  const { data: notes = [], isLoading: notesLoading } = useContactNotes(id ?? '');
  const createNote = useCreateContactNote(id ?? '');

  const [noteType, setNoteType] = useState<ContactNoteType>('note');
  const [noteContent, setNoteContent] = useState('');

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="h-40 rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-600">Không tìm thấy khách hàng</p>
        <Link to="/" className="mt-4 inline-block text-sm text-primary-600 hover:underline">
          ← Quay lại danh sách
        </Link>
      </div>
    );
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    createNote.mutate(
      { type: noteType, content: noteContent.trim() },
      { onSuccess: () => setNoteContent('') },
    );
  };

  return (
    <div>
      <Link to="/" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Quay lại danh sách
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary-600">{customer.code}</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">{customer.fullName}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={customer.status} />
              <CustomerGroupBadge group={customer.group} />
            </div>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>Tạo: {formatDate(customer.createdAt)}</p>
            <p>Cập nhật: {formatDate(customer.updatedAt)}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Email', value: customer.email },
            { label: 'Số điện thoại', value: customer.phone },
            { label: 'Công ty', value: customer.company ?? '—' },
            { label: 'Địa chỉ', value: customer.address ?? '—' },
            { label: 'Doanh thu', value: formatVND(customer.totalRevenue) },
            { label: 'Giao dịch', value: String(customer.totalTransactions) },
            { label: 'Liên hệ gần nhất', value: formatDate(customer.lastContactAt) },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className="mt-1 text-sm text-slate-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold text-slate-900">Lịch sử liên hệ</h3>

        {canEdit && (
          <form onSubmit={handleAddNote} className="mt-4 space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap gap-3">
              <select
                value={noteType}
                onChange={(e) => setNoteType(e.target.value as ContactNoteType)}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                aria-label="Loại liên hệ"
              >
                {NOTE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Nhập nội dung liên hệ..."
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              aria-label="Nội dung ghi chú"
            />
            <button
              type="submit"
              disabled={createNote.isPending || !noteContent.trim()}
              className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {createNote.isPending ? 'Đang lưu...' : 'Thêm ghi chú'}
            </button>
          </form>
        )}

        <div className="mt-6 space-y-4">
          {notesLoading ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Chưa có lịch sử liên hệ</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="flex gap-3 border-l-2 border-slate-200 pl-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={NOTE_ICONS[note.type]} />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="font-medium text-slate-600">
                      {NOTE_TYPES.find((t) => t.value === note.type)?.label}
                    </span>
                    <span>·</span>
                    <span>{formatDate(note.createdAt)}</span>
                    <span>·</span>
                    <span>{note.createdBy}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{note.content}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
