import type { TableInvoice } from '../types/invoice.types';

const formatMoney = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const NOTE_TYPE_LABELS: Record<string, string> = {
  food: 'Món ăn',
  allergy: 'Dị ứng',
  service: 'Dịch vụ',
  billing: 'Thanh toán',
};

const noteTypeLabel = (type: string) => NOTE_TYPE_LABELS[type] ?? type;

export const printInvoice = (invoice: TableInvoice): void => {
  const rows = invoice.items
    .map(
      (item) => `
      <tr>
        <td>${item.description}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${formatMoney(item.unitPrice)}</td>
        <td style="text-align:right">${formatMoney(item.quantity * item.unitPrice)}</td>
      </tr>`,
    )
    .join('');

  const notes = invoice.notes ?? [];
  const notesSection =
    notes.length > 0
      ? `
  <h2 style="font-size:15px;margin:20px 0 8px">Ghi chú phục vụ</h2>
  <ul style="margin:0;padding-left:18px;font-size:13px;color:#333">
    ${notes
      .map(
        (note) =>
          `<li><strong>${noteTypeLabel(note.type)}</strong>: ${note.content}</li>`,
      )
      .join('')}
  </ul>`
      : '';

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>${invoice.invoiceNumber}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
    h1 { font-size: 20px; margin: 0 0 4px; }
    .meta { color: #555; font-size: 13px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { border-bottom: 1px solid #ddd; padding: 8px 4px; }
    th { text-align: left; background: #f8fafc; }
    .totals { margin-top: 16px; width: 100%; max-width: 280px; margin-left: auto; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .totals .grand { font-weight: bold; font-size: 16px; border-top: 2px solid #111; margin-top: 8px; padding-top: 8px; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <h1>HÓA ĐƠN NHÀ HÀNG</h1>
  <div class="meta">
    <div><strong>${invoice.invoiceNumber}</strong></div>
    <div>Bàn: ${invoice.tableLabel} · ${invoice.guestCount} khách</div>
    <div>${new Date(invoice.createdAt).toLocaleString('vi-VN')}</div>
    <div>Thu ngân: ${invoice.createdBy}</div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Món / Dịch vụ</th>
        <th style="text-align:center">SL</th>
        <th style="text-align:right">Đơn giá</th>
        <th style="text-align:right">Thành tiền</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  ${notesSection}
  <div class="totals">
    <div><span>Tạm tính</span><span>${formatMoney(invoice.subtotal)}</span></div>
    ${invoice.tax > 0 ? `<div><span>Thuế / phí</span><span>${formatMoney(invoice.tax)}</span></div>` : ''}
    <div class="grand"><span>Tổng cộng</span><span>${formatMoney(invoice.total)}</span></div>
  </div>
  <p style="margin-top:24px;text-align:center;font-size:13px;color:#666">Cảm ơn quý khách!</p>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=800,height=900');
  if (!win) return;
  win.document.write(html);
  win.document.close();
};
