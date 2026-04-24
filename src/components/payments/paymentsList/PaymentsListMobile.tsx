import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Payment, CashReceipt } from '@/types/payment';
import CashReceiptBlock from '../CashReceiptBlock';
import { getStatusBadge } from './statusBadge';
import { PaymentActionFlags, PaymentActionHandlers } from './actionVisibility';

interface PaymentsListMobileProps {
  sorted: Payment[];
  flags: PaymentActionFlags;
  handlers: PaymentActionHandlers;
  getReceipts: (p: Payment) => CashReceipt[];
  handleReceiptsUpdated: (paymentId: number) => (next: CashReceipt[]) => void;
  isCashApproved: (p: Payment) => boolean;
}

const PaymentsListMobile = ({
  sorted,
  flags,
  handlers,
  getReceipts,
  handleReceiptsUpdated,
  isCashApproved,
}: PaymentsListMobileProps) => {
  const { isPlannedPayments, showApproveReject, showRevoke, showResubmit } = flags;
  const { onApprove, onReject, onSubmitForApproval, onRevoke, onResubmit, onDelete, onEdit, onPaymentClick } = handlers;

  return (
    <div className="md:hidden space-y-3 p-4">
      {sorted.map((payment) => (
        <Card
          key={payment.id}
          className="border-border bg-card cursor-pointer hover:bg-foreground/5 transition-colors"
          onClick={() => onPaymentClick && onPaymentClick(payment)}
        >
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Icon name={payment.category_icon} size={18} />
                </div>
                <span className="font-semibold text-foreground">{payment.category_name}</span>
              </div>
              <span className="font-bold text-lg text-foreground">{payment.amount.toLocaleString('ru-RU')} ₽</span>
            </div>
            {payment.service_name && (
              <div className="text-sm">
                <span className="font-semibold text-foreground/60">Сервис: </span>
                <span className="font-medium text-foreground/80">{payment.service_name}</span>
              </div>
            )}
            {payment.legal_entity_name && (
              <div className="text-sm">
                <span className="font-semibold text-foreground/60">Юр. лицо: </span>
                <span className="font-medium text-foreground/80">{payment.legal_entity_name}</span>
              </div>
            )}
            <div className="text-sm font-medium text-foreground/80">{payment.description}</div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="text-xs font-medium text-foreground/70">
                {new Date(payment.planned_date || payment.payment_date || '').toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
              {!isPlannedPayments && getStatusBadge(payment.status)}
            </div>
            {isCashApproved(payment) && (
              <div onClick={(e) => e.stopPropagation()}>
                <CashReceiptBlock
                  paymentId={payment.id}
                  paymentStatus={payment.status}
                  paymentType={payment.payment_type as string | undefined}
                  createdBy={payment.created_by as number | undefined}
                  receipts={getReceipts(payment)}
                  legacyReceiptUrl={payment.cash_receipt_url as string | undefined}
                  legacyReceiptUploadedAt={payment.cash_receipt_uploaded_at as string | undefined}
                  onUpdated={handleReceiptsUpdated(payment.id)}
                  compact
                />
              </div>
            )}
            <div className="flex gap-2 flex-wrap" onClick={(e) => e.stopPropagation()}>
              {isPlannedPayments && onSubmitForApproval && (
                <button
                  onClick={() => onSubmitForApproval(payment.id)}
                  className="flex-1 px-3 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 font-medium"
                >
                  Создать платёж
                </button>
              )}
              {!isPlannedPayments && (!payment.status || payment.status === 'draft' || payment.status === 'pending_approval') && onSubmitForApproval && !showApproveReject && !showRevoke && !showResubmit && (
                <button
                  onClick={() => onSubmitForApproval(payment.id)}
                  className="flex-1 px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
                >
                  Отправить на согласование
                </button>
              )}
              {!isPlannedPayments && (!payment.status || payment.status === 'draft') && onEdit && !showApproveReject && !showRevoke && !showResubmit && (
                <button
                  onClick={() => onEdit(payment)}
                  className="px-3 py-2 text-sm rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 font-semibold flex items-center gap-1 justify-center"
                  title="Редактировать черновик"
                >
                  <Icon name="Pencil" size={16} />
                  Редактировать
                </button>
              )}
              {!isPlannedPayments && payment.status === 'draft' && onDelete && !showApproveReject && !showRevoke && !showResubmit && (
                <button
                  onClick={() => onDelete(payment.id)}
                  className="px-3 py-2 text-sm rounded bg-red-500/15 text-red-800 dark:text-red-300 hover:bg-red-500/25 font-semibold flex items-center gap-1 justify-center"
                  title="Удалить черновик"
                >
                  <Icon name="Trash2" size={16} />
                  Удалить
                </button>
              )}
              {showApproveReject && onApprove && (
                <button
                  onClick={() => onApprove(payment.id)}
                  className="flex-1 px-3 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 font-medium"
                >
                  Одобрить
                </button>
              )}
              {showApproveReject && onReject && (
                <button
                  onClick={() => onReject(payment.id)}
                  className="flex-1 px-3 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 font-medium"
                >
                  Отклонить
                </button>
              )}
              {showRevoke && onRevoke && (
                <button
                  onClick={() => onRevoke(payment.id)}
                  className="flex-1 px-3 py-2 text-sm rounded bg-orange-600 text-white hover:bg-orange-700 font-medium"
                >
                  Отозвать согласование
                </button>
              )}
              {showResubmit && onResubmit && (
                <button
                  onClick={() => onResubmit(payment.id)}
                  className="flex-1 px-3 py-2 text-sm rounded bg-blue-500/15 text-blue-800 dark:text-blue-300 hover:bg-blue-500/25 font-semibold"
                >
                  Отправить на повторное согласование
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PaymentsListMobile;