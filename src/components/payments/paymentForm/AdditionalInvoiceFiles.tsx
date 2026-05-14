import { useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import type { AdditionalFileProgress } from '@/hooks/paymentForm/useInvoiceFileUpload';

interface AdditionalInvoiceFilesProps {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
  progress?: Record<number, AdditionalFileProgress>;
}

const statusLabel = (p?: AdditionalFileProgress): string => {
  if (!p) return '';
  switch (p.status) {
    case 'pending':
      return 'В очереди';
    case 'uploading':
      return `Загрузка ${p.percent}%`;
    case 'attaching':
      return 'Прикрепление...';
    case 'done':
      return 'Готово';
    case 'error':
      return p.errorMessage || 'Ошибка';
    default:
      return '';
  }
};

const statusIcon = (p?: AdditionalFileProgress) => {
  if (!p) return null;
  if (p.status === 'done') return <Icon name="CheckCircle2" size={14} className="text-green-500 flex-shrink-0" />;
  if (p.status === 'error') return <Icon name="AlertCircle" size={14} className="text-red-500 flex-shrink-0" />;
  if (p.status === 'uploading' || p.status === 'attaching') return <Icon name="Loader2" size={14} className="text-primary animate-spin flex-shrink-0" />;
  return <Icon name="Clock" size={14} className="text-muted-foreground flex-shrink-0" />;
};

const AdditionalInvoiceFiles = ({ files, onAdd, onRemove, disabled, progress }: AdditionalInvoiceFilesProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (list && list.length) {
      onAdd(Array.from(list));
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const openDialog = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2 mt-3">
      <div className="flex items-center justify-between">
        <Label>Дополнительные файлы счёта</Label>
        <span className="text-xs text-muted-foreground">{files.length}</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
        multiple
        onChange={handleChange}
        className="hidden"
      />

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => {
            const p = progress?.[idx];
            const isActive = p?.status === 'uploading' || p?.status === 'attaching';
            const isDone = p?.status === 'done';
            const isError = p?.status === 'error';
            const showProgress = !!p && p.status !== 'done';
            return (
              <div
                key={`${file.name}-${idx}`}
                className={`px-3 py-2 rounded-lg border bg-muted/30 ${
                  isError ? 'border-red-500/40' : isDone ? 'border-green-500/40' : 'border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon name="FileText" size={18} className="text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium break-words">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} МБ
                    </p>
                  </div>
                  {p && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {statusIcon(p)}
                      <span
                        className={`text-xs whitespace-nowrap ${
                          isError ? 'text-red-500' : isDone ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                        }`}
                      >
                        {statusLabel(p)}
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onRemove(idx)}
                    disabled={disabled || isActive}
                    className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Удалить файл"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
                {showProgress && (
                  <div className="mt-2">
                    <Progress
                      value={p?.percent ?? 0}
                      className={`h-1.5 ${isError ? '[&>div]:bg-red-500' : ''}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button
        type="button"
        onClick={openDialog}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary/50 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center"
      >
        <Icon name="Plus" size={16} />
        Добавить ещё файл (PDF, JPG, PNG)
      </button>

      <p className="text-xs text-muted-foreground">
        Эти файлы прикрепятся к платежу после его создания
      </p>
    </div>
  );
};

export default AdditionalInvoiceFiles;