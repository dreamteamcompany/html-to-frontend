import { useState, useRef, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import { PaymentDocument } from './ApprovedPaymentInfo';

export const MAX_INVOICE_FILES = 10;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const ACCEPT_ATTR = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';
const MAX_SIZE_BYTES = 20 * 1024 * 1024;

interface InvoiceFilesManagerProps {
  label?: string;
  dropzoneText?: string;
  documents: PaymentDocument[];
  isBusy?: boolean;
  busyDocumentId?: number | null;
  onUpload: (file: File) => Promise<void> | void;
  onReplace: (documentId: number, file: File) => Promise<void> | void;
  onDelete: (documentId: number) => Promise<void> | void;
  onError?: (message: string) => void;
  readOnly?: boolean;
}

const validateFile = (file: File): string | null => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Допустимы только PDF, JPG и PNG';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Размер файла превышает 20 МБ (${(file.size / 1024 / 1024).toFixed(1)} МБ)`;
  }
  return null;
};

const InvoiceFilesManager = ({
  label = 'Загрузка счёта',
  dropzoneText = 'Перетащите файлы сюда',
  documents,
  isBusy,
  busyDocumentId,
  onUpload,
  onReplace,
  onDelete,
  onError,
  readOnly,
}: InvoiceFilesManagerProps) => {
  const addInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [replacingId, setReplacingId] = useState<number | null>(null);

  const count = documents.length;
  const canAddMore = count < MAX_INVOICE_FILES;
  const slotsLeft = MAX_INVOICE_FILES - count;

  const handleAddFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (!list.length) return;
      if (list.length > slotsLeft) {
        onError?.(`Можно добавить не более ${slotsLeft} файл(ов). Лимит — ${MAX_INVOICE_FILES}`);
      }
      const toUpload = list.slice(0, slotsLeft);
      for (const file of toUpload) {
        const err = validateFile(file);
        if (err) {
          onError?.(err);
          continue;
        }
        await onUpload(file);
      }
    },
    [onError, onUpload, slotsLeft],
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isBusy || readOnly || !canAddMore) return;
    const files = e.dataTransfer.files;
    if (files && files.length) handleAddFiles(files);
  };

  const openAddDialog = () => {
    if (isBusy || readOnly || !canAddMore) return;
    addInputRef.current?.click();
  };

  const onAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) handleAddFiles(files);
    if (addInputRef.current) addInputRef.current.value = '';
  };

  const startReplace = (documentId: number) => {
    if (isBusy || readOnly) return;
    setReplacingId(documentId);
    replaceInputRef.current?.click();
  };

  const onReplaceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const docId = replacingId;
    if (replaceInputRef.current) replaceInputRef.current.value = '';
    setReplacingId(null);
    if (!file || !docId) return;
    const err = validateFile(file);
    if (err) {
      onError?.(err);
      return;
    }
    await onReplace(docId, file);
  };

  const handleDelete = (documentId: number) => {
    if (isBusy || readOnly) return;
    onDelete(documentId);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-xs text-muted-foreground">{count}/{MAX_INVOICE_FILES}</span>
      </div>

      <input
        ref={addInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        onChange={onAddChange}
        className="hidden"
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={onReplaceChange}
        className="hidden"
      />

      {documents.length > 0 && (
        <div className="space-y-2">
          {documents.map((doc) => {
            const isBusyRow = busyDocumentId === doc.id;
            return (
              <div
                key={doc.id}
                className="rounded-lg border border-border bg-muted/30 p-3 space-y-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon name="FileText" size={22} className="text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold break-words">{doc.file_name || 'Файл'}</p>
                    <p className="text-xs text-muted-foreground">PDF / JPG / PNG</p>
                  </div>
                  {isBusyRow && (
                    <Icon name="Loader2" size={18} className="animate-spin text-primary flex-shrink-0" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Icon name="Eye" size={14} />
                    Открыть
                  </a>
                  <a
                    href={doc.file_url}
                    download
                    className="flex items-center gap-1 text-xs font-semibold text-foreground/70 hover:text-foreground"
                  >
                    <Icon name="Download" size={14} />
                    Скачать
                  </a>
                  {!readOnly && (
                    <>
                      <button
                        type="button"
                        onClick={() => startReplace(doc.id)}
                        disabled={isBusy}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-500 hover:underline ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Icon name="RefreshCw" size={14} />
                        Заменить
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(doc.id)}
                        disabled={isBusy}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Icon name="Trash2" size={14} />
                        Удалить
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!readOnly && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (canAddMore && !isBusy) setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={openAddDialog}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${isBusy ? 'border-primary/40 bg-primary/5 cursor-wait' : ''}
            ${!canAddMore ? 'opacity-50 cursor-not-allowed border-muted-foreground/20' : 'border-muted-foreground/25 hover:border-primary/50'}
            ${isDragging ? 'border-primary bg-primary/5' : ''}
          `}
        >
          {isBusy && !busyDocumentId ? (
            <div className="space-y-2">
              <Icon name="Loader2" size={36} className="mx-auto animate-spin text-primary" />
              <p className="text-sm font-semibold text-primary">Загружаю файл...</p>
              <p className="text-xs text-muted-foreground">Сохраняю документ в хранилище</p>
            </div>
          ) : !canAddMore ? (
            <div className="space-y-2">
              <Icon name="Ban" size={28} className="mx-auto text-muted-foreground" />
              <p className="text-sm font-semibold">Достигнут лимит {MAX_INVOICE_FILES} файлов</p>
              <p className="text-xs text-muted-foreground">
                Удалите один из файлов, чтобы добавить новый
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Icon name="Upload" size={36} className="mx-auto text-muted-foreground" />
              <p className="text-sm font-semibold">{dropzoneText}</p>
              <p className="text-xs text-muted-foreground">
                или нажмите для выбора · можно несколько · JPG, PNG, PDF · до 20 МБ
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceFilesManager;
