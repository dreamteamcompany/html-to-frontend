import { useState, useRef, useCallback, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { invalidatePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { CashReceipt } from './paymentDetailsTypes';

const ACCEPTED_MIME = '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png';
const MAX_SIZE_BYTES = 20 * 1024 * 1024;
const MAX_RECEIPTS = 10;

interface CashReceiptBlockProps {
  paymentId: number;
  paymentStatus?: string;
  paymentType?: string;
  createdBy?: number;
  receipts?: CashReceipt[];
  legacyReceiptUrl?: string | null;
  legacyReceiptUploadedAt?: string | null;
  onUpdated?: (receipts: CashReceipt[]) => void;
  compact?: boolean;
}

const getFileNameFromUrl = (url: string): string => {
  const raw = url.split('/').pop() || 'Чек';
  const parts = raw.split('_');
  return parts.length > 2 ? parts.slice(2).join('_') : raw;
};

const CashReceiptBlock = ({
  paymentId,
  paymentStatus,
  paymentType,
  createdBy,
  receipts,
  legacyReceiptUrl,
  legacyReceiptUploadedAt,
  onUpdated,
  compact = false,
}: CashReceiptBlockProps) => {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const buildInitial = useCallback((): CashReceipt[] => {
    if (receipts && receipts.length > 0) return receipts;
    if (legacyReceiptUrl) {
      return [{
        id: 0,
        file_url: legacyReceiptUrl,
        file_name: getFileNameFromUrl(legacyReceiptUrl),
        uploaded_at: legacyReceiptUploadedAt || '',
      }];
    }
    return [];
  }, [receipts, legacyReceiptUrl, legacyReceiptUploadedAt]);

  const [list, setList] = useState<CashReceipt[]>(buildInitial());

  useEffect(() => {
    setList(buildInitial());
  }, [buildInitial]);

  const isCash = (paymentType || '').toLowerCase() === 'cash';
  const isApproved = paymentStatus === 'approved';
  const isOwner = !!user && createdBy === user.id;

  const triggerFileDialog = () => fileInputRef.current?.click();

  const uploadFile = useCallback(async (file: File) => {
    if (list.length >= MAX_RECEIPTS) {
      toast({
        title: 'Лимит исчерпан',
        description: `Можно прикрепить не более ${MAX_RECEIPTS} чеков`,
        variant: 'destructive',
      });
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast({
        title: 'Файл слишком большой',
        description: `Максимальный размер — 20 МБ. Ваш файл: ${(file.size / 1024 / 1024).toFixed(1)} МБ`,
        variant: 'destructive',
      });
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Неподдерживаемый формат',
        description: 'Разрешены только PDF, JPG и PNG',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
        reader.readAsDataURL(file);
      });

      const uploadResp = await fetch(API_ENDPOINTS.invoiceOcr, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: base64, fileName: file.name, upload_only: true }),
      });

      if (!uploadResp.ok) throw new Error('Ошибка загрузки файла');
      const uploadData = await uploadResp.json();
      const fileUrl = uploadData.file_url;
      if (!fileUrl) throw new Error('Сервер не вернул ссылку на файл');

      const saveResp = await fetch(`${API_ENDPOINTS.paymentsApi}?action=cash_receipt`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          cash_receipt_url: fileUrl,
          file_name: file.name,
          receipt_action: 'upload',
        }),
      });

      if (!saveResp.ok) {
        const err = await saveResp.json().catch(() => ({}));
        throw new Error(err.error || 'Не удалось сохранить чек');
      }

      const saveData = await saveResp.json();
      const nextList: CashReceipt[] = saveData.receipts || [];
      setList(nextList);
      toast({ title: 'Чек загружен', description: 'Файл успешно прикреплён' });
      invalidatePaymentsCache();
      onUpdated?.(nextList);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Не удалось загрузить чек';
      toast({ title: 'Ошибка', description: message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [paymentId, token, toast, onUpdated, list.length]);

  const handleDelete = useCallback(async (receiptId: number) => {
    if (!receiptId) {
      toast({
        title: 'Нельзя удалить',
        description: 'Этот чек ещё не перенесён в новую систему. Обновите страницу.',
        variant: 'destructive',
      });
      return;
    }
    if (!window.confirm('Удалить этот чек?')) return;
    setDeletingId(receiptId);
    try {
      const resp = await fetch(`${API_ENDPOINTS.paymentsApi}?action=cash_receipt`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          receipt_id: receiptId,
          receipt_action: 'delete',
        }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || 'Не удалось удалить чек');
      }
      const data = await resp.json();
      const nextList: CashReceipt[] = data.receipts || [];
      setList(nextList);
      toast({ title: 'Чек удалён' });
      invalidatePaymentsCache();
      onUpdated?.(nextList);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Не удалось удалить чек';
      toast({ title: 'Ошибка', description: message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  }, [paymentId, token, toast, onUpdated]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  };

  if (!isCash || !isApproved) return null;

  const canAddMore = isOwner && list.length < MAX_RECEIPTS;
  const hasAny = list.length > 0;

  return (
    <div className={compact ? 'mt-2' : 'mt-3'}>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_MIME}
        onChange={handleFileChange}
        className="hidden"
      />

      {hasAny ? (
        <div className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-emerald-400/20">
            <Icon name="ReceiptText" size={16} className="text-emerald-700 dark:text-emerald-300 flex-shrink-0" />
            <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              Чеки об оплате
            </span>
            <span className="text-xs font-semibold text-emerald-700/80 dark:text-emerald-300/80">
              {list.length} / {MAX_RECEIPTS}
            </span>
          </div>
          <div className="divide-y divide-emerald-400/20">
            {list.map((r) => {
              const displayName = r.file_name || getFileNameFromUrl(r.file_url);
              const isDeleting = deletingId === r.id;
              return (
                <div key={r.id || r.file_url} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon name="FileText" size={15} className="text-emerald-700 dark:text-emerald-300 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground break-words">{displayName}</p>
                      {r.uploaded_at && (
                        <p className="text-xs font-medium text-foreground/60">
                          {new Date(r.uploaded_at).toLocaleDateString('ru-RU')}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    <a
                      href={r.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      title="Просмотреть"
                    >
                      <Icon name="Eye" size={14} />
                      Открыть
                    </a>
                    <a
                      href={r.file_url}
                      download
                      className="flex items-center gap-1 text-xs font-semibold text-foreground/70 hover:text-foreground"
                      title="Скачать"
                    >
                      <Icon name="Download" size={14} />
                      Скачать
                    </a>
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        disabled={isUploading || isDeleting}
                        className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                        title="Удалить"
                      >
                        <Icon name={isDeleting ? 'Loader2' : 'Trash2'} size={14} className={isDeleting ? 'animate-spin' : ''} />
                        Удалить
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {canAddMore && (
            <div className="border-t border-emerald-400/20 p-2">
              <button
                type="button"
                onClick={triggerFileDialog}
                disabled={isUploading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-emerald-500/15 transition-colors text-sm font-semibold text-emerald-700 dark:text-emerald-200 w-full disabled:opacity-50"
              >
                <Icon name={isUploading ? 'Loader2' : 'Plus'} size={16} className={isUploading ? 'animate-spin' : ''} />
                <span>{isUploading ? 'Загружаем...' : 'Добавить ещё чек'}</span>
                <span className="ml-auto text-xs font-medium opacity-70">PDF, JPG, PNG · до 20 МБ</span>
              </button>
            </div>
          )}
          {!canAddMore && isOwner && list.length >= MAX_RECEIPTS && (
            <div className="border-t border-emerald-400/20 px-3 py-2 text-xs font-medium text-emerald-800/80 dark:text-emerald-200/80">
              Достигнут лимит {MAX_RECEIPTS} чеков. Чтобы добавить новый — удалите один из существующих.
            </div>
          )}
        </div>
      ) : (
        isOwner && (
          <button
            type="button"
            onClick={triggerFileDialog}
            disabled={isUploading}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-400/40 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors text-sm font-semibold text-emerald-700 dark:text-emerald-200 w-full disabled:opacity-50"
          >
            <Icon name={isUploading ? 'Loader2' : 'Upload'} size={16} className={isUploading ? 'animate-spin' : ''} />
            <span>{isUploading ? 'Загружаем...' : 'Загрузить чек об оплате'}</span>
            <span className="ml-auto text-xs font-medium opacity-70">до {MAX_RECEIPTS} файлов · PDF, JPG, PNG · 20 МБ</span>
          </button>
        )
      )}
    </div>
  );
};

export default CashReceiptBlock;
