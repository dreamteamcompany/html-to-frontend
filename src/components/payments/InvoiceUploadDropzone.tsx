import { useState, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ACCEPT_ATTR = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

interface InvoiceUploadDropzoneProps {
  fileUrl?: string | null;
  fileName?: string | null;
  isUploading?: boolean;
  onFileSelected: (file: File) => void;
  onRemove?: () => void;
  onError?: (message: string) => void;
  label?: string;
}

const getDisplayName = (fileUrl: string): string => {
  const raw = fileUrl.split('/').pop() || 'Файл';
  const parts = raw.split('_');
  return parts.length > 2 ? parts.slice(2).join('_') : raw;
};

const InvoiceUploadDropzone = ({
  fileUrl,
  fileName,
  isUploading,
  onFileSelected,
  onRemove,
  onError,
  label = 'Загрузка счёта',
}: InvoiceUploadDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndPick = (file: File | null) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      onError?.('Допустимы только PDF, JPG и PNG');
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      onError?.(`Размер файла превышает 20 МБ (${(file.size / 1024 / 1024).toFixed(1)} МБ)`);
      return;
    }
    onFileSelected(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndPick(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndPick(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openDialog = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const displayName = fileName || (fileUrl ? getDisplayName(fileUrl) : '');

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={handleFileChange}
        className="hidden"
      />

      {fileUrl && !isUploading ? (
        <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center gap-3 min-w-0">
            <Icon name="FileText" size={22} className="text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold break-words">{displayName || 'Файл загружен'}</p>
              <p className="text-xs text-muted-foreground">PDF / JPG / PNG</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <Icon name="Eye" size={14} />
              Открыть
            </a>
            <a
              href={fileUrl}
              download
              className="flex items-center gap-1 text-xs font-semibold text-foreground/70 hover:text-foreground"
            >
              <Icon name="Download" size={14} />
              Скачать
            </a>
            <button
              type="button"
              onClick={openDialog}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline ml-auto"
            >
              <Icon name="RefreshCw" size={14} />
              Заменить
            </button>
            {onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
              >
                <Icon name="Trash2" size={14} />
                Удалить
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={openDialog}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${isUploading ? 'border-primary/40 bg-primary/5 cursor-wait' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${isDragging ? 'border-primary bg-primary/5' : ''}
          `}
        >
          {isUploading ? (
            <div className="space-y-2">
              <Icon name="Loader2" size={36} className="mx-auto animate-spin text-primary" />
              <p className="text-sm font-semibold text-primary">Загружаю файл...</p>
              <p className="text-xs text-muted-foreground">Сохраняю документ в хранилище</p>
            </div>
          ) : (
            <div className="space-y-2">
              <Icon name="Upload" size={36} className="mx-auto text-muted-foreground" />
              <p className="text-sm font-semibold">Перетащите файл счёта сюда</p>
              <p className="text-xs text-muted-foreground">
                или нажмите для выбора (JPG, PNG, PDF · до 20 МБ)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceUploadDropzone;
