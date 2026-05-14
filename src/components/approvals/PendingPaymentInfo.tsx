import Icon from '@/components/ui/icon';
import { Payment } from './pendingTypes';
import { useToast } from '@/hooks/use-toast';

interface PendingPaymentInfoProps {
  payment: Payment;
  onApprove?: (paymentId: number, comment?: string) => void;
  onReject?: (paymentId: number, comment?: string) => void;
  onApproveClick: () => void;
  onRejectClick: () => void;
}

const PendingPaymentInfo = ({ payment, onApprove, onReject, onApproveClick, onRejectClick }: PendingPaymentInfoProps) => {
  const { toast } = useToast();
  return (
    <div className="w-full lg:w-1/2 lg:border-r border-border flex flex-col overflow-x-hidden lg:overflow-y-auto">
      <div className="lg:flex-1 p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-start gap-3 sm:gap-4 min-w-0">
          <div className="bg-primary/20 p-2 sm:p-3 rounded-lg flex-shrink-0 text-primary">
            <Icon name={payment.category_icon} fallback="Tag" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 break-words">{payment.category_name}</h3>
            <p className="text-2xl sm:text-3xl font-bold text-primary">{payment.amount.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>

        {payment.description && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Описание</p>
            <p className="font-semibold text-foreground break-words">{payment.description}</p>
          </div>
        )}

        {payment.legal_entity_name && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Юридическое лицо</p>
            <p className="font-semibold text-foreground break-words">{payment.legal_entity_name}</p>
          </div>
        )}

        {payment.contractor_name && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Контрагент</p>
            <p className="font-semibold text-foreground break-words">{payment.contractor_name}</p>
          </div>
        )}

        {payment.department_name && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Отдел-заказчик</p>
            <p className="font-semibold text-foreground break-words">{payment.department_name}</p>
          </div>
        )}

        {payment.service_name && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Сервис</p>
            <p className="font-semibold text-foreground break-words">{payment.service_name}</p>
          </div>
        )}

        {payment.invoice_number && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Номер счёта</p>
            <p className="font-semibold text-foreground break-words">{payment.invoice_number}</p>
          </div>
        )}

        {(() => {
          const invoiceDocs = (payment.documents || []).filter(
            d => d && d.file_url && (!d.document_type || d.document_type === 'invoice')
          );
          const urls = new Set(invoiceDocs.map(d => d.file_url));
          const hasMainFile = !!payment.invoice_file_url && !urls.has(payment.invoice_file_url);
          if (!hasMainFile && invoiceDocs.length === 0) return null;

          const prettyName = (url: string, fallback?: string) => {
            if (fallback) return fallback;
            try {
              const last = url.split('/').pop() || 'Файл счёта';
              const decoded = decodeURIComponent(last);
              const parts = decoded.split('_');
              return parts.length > 2 ? parts.slice(2).join('_') : decoded;
            } catch {
              return 'Файл счёта';
            }
          };

          const handleDownload = async (url: string, suggestedName: string) => {
            const proxied = `https://functions.poehali.dev/fcc54a8e-db90-42b9-a27f-0cb8b29693a0?url=${encodeURIComponent(url)}&name=${encodeURIComponent(suggestedName || 'invoice')}`;
            try {
              const res = await fetch(proxied);
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              const blob = await res.blob();
              const objectUrl = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = objectUrl;
              a.download = suggestedName || 'invoice';
              document.body.appendChild(a);
              a.click();
              a.remove();
              setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
            } catch (err) {
              console.error('Download failed:', err);
              toast({
                title: 'Не удалось скачать файл',
                description: 'Попробуйте ещё раз или откройте файл через «Просмотр» и сохраните из браузера.',
                variant: 'destructive',
              });
            }
          };

          const renderRow = (url: string, name: string, uploadedAt?: string, key?: string | number) => (
            <div
              key={key ?? url}
              className="rounded-xl border-2 border-primary/40 p-3 bg-primary/10 shadow-sm hover:bg-primary/15 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/20 flex-shrink-0">
                    <Icon name="FileText" size={18} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground break-words leading-tight">{name}</p>
                    {uploadedAt && (
                      <p className="text-[11px] font-medium text-foreground/60 mt-0.5">
                        загружен {new Date(uploadedAt).toLocaleString('ru-RU')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-md transition-colors"
                  >
                    <Icon name="Eye" size={14} />
                    Просмотр
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDownload(url, name)}
                    className="flex items-center gap-1 text-xs font-semibold text-foreground bg-background hover:bg-muted border border-border px-3 py-1.5 rounded-md transition-colors"
                  >
                    <Icon name="Download" size={14} />
                    Скачать
                  </button>
                </div>
              </div>
            </div>
          );

          return (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Icon name="Paperclip" size={12} className="text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Счёт</p>
              </div>
              <div className="space-y-2">
                {hasMainFile && payment.invoice_file_url && renderRow(
                  payment.invoice_file_url,
                  prettyName(payment.invoice_file_url),
                  payment.invoice_file_uploaded_at,
                  'main'
                )}
                {invoiceDocs.map(doc => renderRow(
                  doc.file_url,
                  prettyName(doc.file_url, doc.file_name),
                  doc.uploaded_at,
                  doc.id
                ))}
              </div>
            </div>
          );
        })()}

        {payment.created_by_name && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Создал заявку</p>
            <p className="font-semibold text-foreground break-words">{payment.created_by_name}</p>
          </div>
        )}

        {payment.custom_fields && payment.custom_fields.length > 0 && (
          <>
            {payment.custom_fields.map((field) => (
              <div key={field.id}>
                <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">{field.name}</p>
                {field.field_type === 'file' && field.value ? (
                  <div className="rounded-lg border border-border p-3 bg-primary/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon name="FileText" size={16} className="text-primary flex-shrink-0" />
                        <span className="text-sm font-semibold text-foreground break-words">
                          {field.value.split('/').pop()?.split('_').slice(2).join('_') || 'Файл'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={field.value}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          <Icon name="Eye" size={14} />
                          Просмотр
                        </a>
                        <a
                          href={field.value}
                          download
                          className="flex items-center gap-1 text-xs font-semibold text-foreground/70 hover:text-foreground"
                        >
                          <Icon name="Download" size={14} />
                          Скачать
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="font-semibold text-foreground break-words">{field.value}</p>
                )}
              </div>
            ))}
          </>
        )}
      </div>

      {(onApprove || onReject) && (
        <div className="border-t border-border p-4 sm:p-6">
          <div className="flex gap-2 sm:gap-3">
            {onApprove && (
              <button
                onClick={onApproveClick}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="Check" size={18} />
                Согласовать
              </button>
            )}
            {onReject && (
              <button
                onClick={onRejectClick}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Icon name="X" size={18} />
                Отклонить
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingPaymentInfo;