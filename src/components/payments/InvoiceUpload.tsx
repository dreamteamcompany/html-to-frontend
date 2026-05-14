import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';

interface InvoiceUploadProps {
  onFileSelect: (file: File | null) => void;
  onExtractData: () => void;
  isProcessing: boolean;
  isUploading?: boolean;
  previewUrl: string | null;
  fileName?: string;
  fileType?: string;
  existingFileUrl?: string;
  onExtraFiles?: (files: File[]) => void;
}

const InvoiceUpload = ({ onFileSelect, onExtractData, isProcessing, isUploading, previewUrl, fileName, fileType, existingFileUrl, onExtraFiles }: InvoiceUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type?: string) => {
    if (!type) return 'File';
    if (type.startsWith('image/')) return 'Image';
    if (type === 'application/pdf') return 'FileText';
    return 'File';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const acceptFiles = (rawFiles: FileList | File[]) => {
    const filtered = Array.from(rawFiles).filter(
      (f) => f.type === 'application/pdf' || f.type.startsWith('image/'),
    );
    if (filtered.length === 0) return;
    const [first, ...rest] = filtered;
    onFileSelect(first);
    if (rest.length > 0 && onExtraFiles) {
      onExtraFiles(rest);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length) {
      acceptFiles(files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      acceptFiles(files);
    }
    e.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (previewUrl && replacing) setReplacing(false);
  }, [previewUrl, replacing]);

  const hasFile = !!previewUrl || (!!existingFileUrl && !replacing);
  const displayName = fileName
    || (existingFileUrl ? existingFileUrl.split('/').pop()?.split('_').slice(2).join('_') || existingFileUrl.split('/').pop() : undefined)
    || 'Файл загружен';

  return (
    <div className="space-y-4">
      <Label>Загрузка счёта</Label>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={hasFile || isUploading ? undefined : handleClick}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center
          transition-colors duration-200
          ${hasFile || isUploading ? 'bg-muted/20 border-muted-foreground/25' : 'cursor-pointer border-muted-foreground/25 hover:border-primary/50'}
          ${isUploading ? 'border-primary/40 bg-primary/5' : ''}
          ${isDragging ? 'border-primary bg-primary/5' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />

        {hasFile ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
              <div className="flex-shrink-0">
                <Icon name={getFileIcon(fileType)} size={32} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium break-words">{displayName}</p>
                <p className="text-xs text-muted-foreground">
                  {fileType === 'application/pdf' ? 'PDF документ' :
                   fileType?.startsWith('image/') ? 'Изображение' : 'Документ'}
                </p>
              </div>
              {existingFileUrl && !previewUrl && (
                <a
                  href={existingFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Icon name="Eye" size={14} />
                  Открыть
                </a>
              )}
            </div>

            {previewUrl && (
              <div className="max-w-full mx-auto">
                {previewUrl.endsWith('.pdf') ? (
                  <div className="flex flex-col items-center justify-center gap-4 p-8 bg-muted/30 rounded-lg border-2 border-dashed">
                    <Icon name="FileText" size={64} className="text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium">PDF документ</p>
                      <p className="text-xs text-muted-foreground mt-1">{displayName}</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 w-full object-contain mx-auto rounded-lg border shadow-sm"
                  />
                )}
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <Icon name="Loader2" size={16} className="animate-spin" />
                <span className="text-sm font-medium">Автоматическое распознавание данных...</span>
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setReplacing(true);
                  onFileSelect(null);
                  fileInputRef.current?.click();
                }}
                disabled={isProcessing}
              >
                <Icon name="RefreshCw" size={14} className="mr-1" />
                Заменить файл
              </Button>
            </div>
          </div>
        ) : isUploading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center">
              <div className="relative">
                <Icon name="Loader2" size={48} className="animate-spin text-primary mx-auto" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-primary">Загружаю файл...</p>
              <p className="text-xs text-muted-foreground mt-1">Сохраняю документ в хранилище</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Icon name="Upload" size={48} className="mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Перетащите файлы счёта сюда</p>
              <p className="text-xs text-muted-foreground mt-1">
                или нажмите для выбора — можно выделить несколько (JPG, PNG, PDF)
              </p>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        <Icon name="Sparkles" size={12} className="inline mr-1" />
        Загрузите счёт — система автоматически распознает и заполнит все поля
      </p>
    </div>
  );
};

export default InvoiceUpload;