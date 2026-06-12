import { useAuth } from '@/contexts/AuthContext';
import { useImportCsv } from '../hooks/useImportCsv';
import { customerService } from '../services';
import { useRef, useState } from 'react';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportCsvModal = ({ isOpen, onClose }: ImportCsvModalProps) => {
  const { canEdit } = useAuth();
  const importCsv = useImportCsv();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [lastResult, setLastResult] = useState<{
    imported: number;
    skipped: number;
    errors: { row: number; message: string }[];
  } | null>(null);

  if (!isOpen || !canEdit) return null;

  const handleFile = (file: File) => {
    setFileName(file.name);
    setLastResult(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(String(e.target?.result ?? ''));
    reader.readAsText(file, 'UTF-8');
  };

  const handleImport = () => {
    if (!preview) return;
    importCsv.mutate(preview, {
      onSuccess: (result) => {
        setLastResult(result);
        if (result.errors.length === 0) {
          setPreview(null);
          setFileName('');
        }
      },
    });
  };

  const handleDownloadTemplate = async () => {
    const blob = await customerService.downloadImportTemplate();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'import-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setPreview(null);
    setFileName('');
    setLastResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-slate-900/50 dark:bg-black/60" aria-label="Đóng" onClick={handleClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto card p-6">
        <h2 className="page-title text-lg">Import khách hàng từ CSV</h2>
        <p className="page-subtitle mt-1">
          Cột bắt buộc: Họ tên, Email, SĐT. Tùy chọn: Công ty, Địa chỉ, Nhóm, Trạng thái.
        </p>

        <button type="button" onClick={handleDownloadTemplate} className="btn-secondary mt-4">
          Tải file mẫu
        </button>

        <div className="mt-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-secondary w-full justify-center border-dashed py-8"
          >
            {fileName || 'Chọn file CSV...'}
          </button>
        </div>

        {lastResult && lastResult.errors.length > 0 && (
          <div className="mt-4 max-h-40 overflow-y-auto rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {lastResult.imported} import, {lastResult.skipped} lỗi:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-400">
              {lastResult.errors.slice(0, 10).map((err) => (
                <li key={err.row}>Dòng {err.row}: {err.message}</li>
              ))}
              {lastResult.errors.length > 10 && (
                <li>...và {lastResult.errors.length - 10} lỗi khác</li>
              )}
            </ul>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={handleClose} className="btn-secondary">
            {lastResult?.imported ? 'Đóng' : 'Hủy'}
          </button>
          <button
            type="button"
            onClick={handleImport}
            disabled={!preview || importCsv.isPending}
            className="btn-primary"
          >
            {importCsv.isPending ? 'Đang import...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};
