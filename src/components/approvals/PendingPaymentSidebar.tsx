import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PaymentComments from './PaymentComments';
import PaymentAuditLog from './PaymentAuditLog';
import { Payment, PaymentDocument } from './pendingTypes';

interface PendingPaymentSidebarProps {
  payment: Payment;
  canRevoke: boolean;
  onRevokeClick: () => void;
}

const PendingPaymentSidebar = ({ payment, canRevoke, onRevokeClick }: PendingPaymentSidebarProps) => {
  const [showDocsPanel, setShowDocsPanel] = useState(false);

  return (
    <div className="w-full lg:w-1/2 flex flex-col border-t lg:border-t-0 border-border lg:overflow-hidden overflow-x-hidden min-h-[400px]">
      <div className="p-4 sm:p-6 border-b border-border">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold text-foreground/70">Дата платежа:</span>
            <span className="font-semibold text-foreground">{new Date(payment.payment_date).toLocaleDateString('ru-RU')}</span>
          </div>
          {payment.submitted_at && (
            <div className="flex justify-between">
              <span className="font-semibold text-foreground/70">Дата отправки:</span>
              <span className="font-semibold text-foreground">{new Date(payment.submitted_at).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
          {payment.invoice_date && (
            <div className="flex justify-between">
              <span className="font-semibold text-foreground/70">Дата счёта:</span>
              <span className="font-semibold text-foreground">{new Date(payment.invoice_date).toLocaleDateString('ru-RU')}</span>
            </div>
          )}
          {payment.created_at && (
            <div className="flex justify-between">
              <span className="font-semibold text-foreground/70">Создана:</span>
              <span className="font-semibold text-foreground">{new Date(payment.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
            </div>
          )}
        </div>

        {(() => {
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
          if (docs.length === 0) return null;
          return (
            <div className="mt-3">
              <button
                onClick={() => setShowDocsPanel(v => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-colors text-sm font-semibold text-primary w-full"
              >
                <Icon name="FileText" size={16} />
                <span>Счёт</span>
                {docs.length > 1 && (
                  <span className="ml-1 bg-primary text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{docs.length}</span>
                )}
                <Icon name={showDocsPanel ? 'ChevronUp' : 'ChevronDown'} size={14} className="ml-auto" />
              </button>
              {showDocsPanel && (
                <div className="mt-2 rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
                  {docs.map((doc) => (
                    <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <Icon name="FileText" size={16} className="text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground break-words">{doc.file_name}</p>
                          <p className="text-xs font-medium text-foreground/60">
                            {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('ru-RU') : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a href={doc.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                          <Icon name="Eye" size={14} />
                          Открыть
                        </a>
                        <a href={doc.file_url} download className="flex items-center gap-1 text-xs font-semibold text-foreground/70 hover:text-foreground">
                          <Icon name="Download" size={14} />
                          Скачать
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="comments" className="flex-1 flex flex-col">
          <TabsList className="mx-4 mt-2">
            <TabsTrigger value="comments" className="flex items-center gap-2">
              <Icon name="MessageSquare" size={16} />
              Обсуждение
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Icon name="History" size={16} />
              История
            </TabsTrigger>
          </TabsList>
          <TabsContent value="comments" className="flex-1 overflow-hidden mt-0">
            <PaymentComments paymentId={payment.id} />
          </TabsContent>
          <TabsContent value="history" className="flex-1 overflow-hidden p-4">
            <PaymentAuditLog paymentId={payment.id} />
          </TabsContent>
        </Tabs>
      </div>

      {canRevoke && (
        <div className="border-t border-border p-4">
          <Button
            onClick={onRevokeClick}
            variant="outline"
            className="w-full border-orange-500/50 text-orange-700 dark:text-orange-400 hover:bg-orange-500/10 font-semibold"
          >
            <Icon name="RotateCcw" size={16} className="mr-2" />
            Отозвать платёж
          </Button>
        </div>
      )}
    </div>
  );
};

export default PendingPaymentSidebar;
