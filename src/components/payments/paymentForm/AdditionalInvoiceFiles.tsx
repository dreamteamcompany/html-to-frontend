import { useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';

interface AdditionalInvoiceFilesProps {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  disabled?: boolean;
}

const AdditionalInvoiceFiles = ({ files, onAdd, onRemove, disabled }: AdditionalInvoiceFilesProps) => {
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
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border bg-muted/30"
            >
              <Icon name="FileText" size={18} className="text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium break-words">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} МБ
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(idx)}
                disabled={disabled}
                className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-50"
                aria-label="Удалить файл"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          ))}
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
