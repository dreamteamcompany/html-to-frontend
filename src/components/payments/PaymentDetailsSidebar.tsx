import { useState } from 'react';
import Icon from '@/components/ui/icon';
import PaymentAuditLog from '@/components/approvals/PaymentAuditLog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Payment, PaymentDocument } from './paymentDetailsTypes';

interface PaymentDetailsSidebarProps {
  payment: Payment;
  isPlannedPayment?: boolean;
  onClose: () => void;
  onSubmitForApproval?: (paymentId: number) => void;
  onApprove?: (paymentId: number) => void;
  onReject?: (paymentId: number) => void;
  onEdit?: (payment: Payment) => void;
}

const PaymentDetailsSidebar = ({
  payment,
  isPlannedPayment,
  onClose,
  onSubmitForApproval,
  onApprove,
  onReject,
  onEdit,
}: PaymentDetailsSidebarProps) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDocsPanel, setShowDocsPanel] = useState(false);

  const docs: PaymentDocument[] = payment.documents && payment.documents.length > 0
    ? payment.documents
    : payment.invoice_file_url
      ? [{
          id: 0,
          payment_id: payment.id,
          file_name: payment.invoice_file_url.split('/').pop()?.split('_').slice(2).join('_') || 'Счёт',
          file_url: payment.invoice_file_url,
          document_type: 'invoice',
          uploaded_at: payment.invoice_file_uploaded_at || payment.created_at || '',
        }]
      : [];

  const showActions =
    ((!payment.status || payment.status === 'draft' || payment.status === 'rejected') && onSubmitForApproval) ||
    onApprove ||
    onReject;

  return (
    <div className="w-full lg:w-1/2 flex flex-col border-t lg:border-t-0 border-white/10 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              {(isPlannedPayment || payment.is_planned) ? 'Дата планирования:' : 'Дата платежа:'}
            </span>
            <span className="font-medium">
              {payment.planned_date
                ? new Date(payment.planned_date).toLocaleDateString('ru-RU')
                : payment.payment_date
                  ? new Date(payment.payment_date).toLocaleDateString('ru-RU')
                  : 'Invalid Date'}
            </span>
          </div>
          {payment.submitted_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Дата отправки:</span>
              <span className="font-medium">{new Date(payment.submitted_at).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
          {payment.invoice_date && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Дата счёта:</span>
              <span className="font-medium">{new Date(payment.invoice_date).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
          {payment.created_at && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Создана:</span>
              <span className="font-medium">{new Date(payment.created_at).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
        </div>

        {docs.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowDocsPanel(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-medium text-primary w-full"
            >
              <Icon name="FileText" size={16} />
              <span>Счёт</span>
              {docs.length > 1 && (
                <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {docs.length}
                </span>
              )}
              <Icon name={showDocsPanel ? 'ChevronUp' : 'ChevronDown'} size={14} className="ml-auto" />
            </button>

            {showDocsPanel && (
              <div className="mt-2 rounded-lg border border-white/10 bg-card divide-y divide-white/5 overflow-hidden">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between gap-2 px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon name="FileText" size={15} className="text-primary flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('ru-RU') : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                        title="Просмотреть"
                      >
                        <Icon name="Eye" size={14} />
                        Открыть
                      </a>
                      <a
                        href={doc.file_url}
                        download
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                        title="Скачать"
                      >
                        <Icon name="Download" size={14} />
                        Скачать
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!isPlannedPayment && (
        <Tabs defaultValue="history" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="px-4 sm:px-6 pt-4 grid w-auto grid-cols-1">
            <TabsTrigger value="history">История согласований</TabsTrigger>
          </TabsList>
          <TabsContent value="history" className="flex-1 overflow-y-auto px-4 sm:px-6 pb-4">
            <PaymentAuditLog paymentId={payment.id} />
          </TabsContent>
        </Tabs>
      )}

      {isPlannedPayment && (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          <div className="text-center text-muted-foreground py-8">
            <Icon name="Clock" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">Запланированный платёж</p>
            <p className="text-xs mt-2">История согласований появится после создания платежа</p>
          </div>
        </div>
      )}

      {showActions ? (
        <div className="p-4 sm:p-6 border-t border-white/10 space-y-3">
          {payment.status === 'rejected' && onEdit && (
            <button
              onClick={() => {
                onEdit(payment);
                onClose();
              }}
              className="w-full px-4 py-3 rounded-lg bg-white/5 text-white hover:bg-white/10 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="Edit" size={18} />
              Редактировать платёж
            </button>
          )}

          {(!payment.status || payment.status === 'draft' || payment.status === 'rejected') && onSubmitForApproval && !showConfirmation && (
            <button
              onClick={() => setShowConfirmation(true)}
              className="w-full px-4 py-3 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 font-medium transition-colors"
              style={{ color: '#000000' }}
            >
              {payment.status === 'rejected' ? 'Отправить на повторное согласование' : 'Отправить на согласование'}
            </button>
          )}

          {(!payment.status || payment.status === 'draft' || payment.status === 'rejected') && onSubmitForApproval && showConfirmation && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">
                Отправить платёж на согласование?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-white hover:bg-white/10 font-medium transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    onSubmitForApproval(payment.id);
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 font-medium transition-colors"
                >
                  Отправить
                </button>
              </div>
            </div>
          )}

          {(onApprove || onReject) && (
            <div className="flex gap-3">
              {onApprove && (
                <button
                  onClick={() => {
                    onApprove(payment.id);
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition-colors"
                >
                  Одобрить
                </button>
              )}
              {onReject && (
                <button
                  onClick={() => {
                    onReject(payment.id);
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium transition-colors"
                >
                  Отклонить
                </button>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default PaymentDetailsSidebar;
