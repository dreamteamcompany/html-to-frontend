import Icon from '@/components/ui/icon';
import { Payment } from '@/types/payment';
import { SortHeader, SortKey, SortDir } from './sorting';
import { getStatusBadge } from './statusBadge';
import { hasActionsForPayment, PaymentActionFlags, PaymentActionHandlers } from './actionVisibility';

interface User {
  id: number;
}

interface PaymentsTableDesktopProps {
  sorted: Payment[];
  payments: Payment[];
  user: User | null | undefined;
  flags: PaymentActionFlags;
  handlers: PaymentActionHandlers;
  sortKey: SortKey | null;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
  getReceipts: (p: Payment) => Array<{ id: number; file_url: string; file_name?: string; uploaded_at: string }>;
  isCashApproved: (p: Payment) => boolean;
}

const PaymentsTableDesktop = ({
  sorted,
  payments,
  user,
  flags,
  handlers,
  sortKey,
  sortDir,
  onSort,
  getReceipts,
  isCashApproved,
}: PaymentsTableDesktopProps) => {
  const { isPlannedPayments, showApproveReject, showRevoke, showResubmit } = flags;
  const { onApprove, onReject, onSubmitForApproval, onRevoke, onResubmit, onDelete, onEdit, onPaymentClick } = handlers;

  const showActionsColumn = payments.some(p => hasActionsForPayment(p, flags, handlers));

  const hp = { activeKey: sortKey, dir: sortDir, onClick: onSort };

  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <SortHeader label="Категория"  sortKey="category"     {...hp} />
            <SortHeader label="Сервис"      sortKey="service"      {...hp} />
            <SortHeader label="Юр. лицо"    sortKey="legal_entity" {...hp} />
            <SortHeader label="Назначение"  sortKey="description"  {...hp} />
            <SortHeader label="Сумма"       sortKey="amount"       {...hp} />
            <SortHeader label="Статус"      sortKey="status"       {...hp} />
            <SortHeader label="Дата"        sortKey="date"         {...hp} />
            {showActionsColumn && <th className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-foreground/70">Действия</th>}
          </tr>
        </thead>
        <tbody>
          {sorted.map((payment) => (
            <tr
              key={payment.id}
              className="border-b border-border hover:bg-foreground/5 transition-colors cursor-pointer"
              onClick={() => onPaymentClick && onPaymentClick(payment)}
            >
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Icon name={payment.category_icon} size={18} />
                  </div>
                  <span className="font-semibold text-foreground">{payment.category_name}</span>
                </div>
              </td>
              <td className="p-4 font-medium text-foreground/80">
                {payment.service_name || <span className="text-foreground/40">—</span>}
              </td>
              <td className="p-4 font-medium text-foreground/80">
                {payment.legal_entity_name || <span className="text-foreground/40">—</span>}
              </td>
              <td className="p-4 font-medium text-foreground/80">{payment.description}</td>
              <td className="p-4">
                <span className="font-bold text-lg text-foreground">{payment.amount.toLocaleString('ru-RU')} ₽</span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {getStatusBadge(payment.status)}
                  {isCashApproved(payment) && (() => {
                    const rs = getReceipts(payment);
                    if (rs.length > 0) {
                      return (
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          title={`Прикреплено чеков: ${rs.length}`}
                        >
                          <Icon name="ReceiptText" size={11} />
                          Чеки · {rs.length}
                        </span>
                      );
                    }
                    if (payment.created_by === user?.id) {
                      return (
                        <span
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300"
                          title="Загрузите чек об оплате"
                        >
                          <Icon name="AlertCircle" size={11} />
                          Нет чека
                        </span>
                      );
                    }
                    return null;
                  })()}
                </div>
              </td>
              <td className="p-4 font-medium text-foreground/80">
                {new Date(payment.planned_date || payment.payment_date || '').toLocaleDateString('ru-RU', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </td>
              {showActionsColumn && (
                <td className="p-4">
                  <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                    {isPlannedPayments && onSubmitForApproval && (
                      <button
                        onClick={() => onSubmitForApproval(payment.id)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-green-500/15 text-green-800 dark:text-green-300 hover:bg-green-500/25"
                      >
                        Создать платёж
                      </button>
                    )}
                    {!isPlannedPayments && (!payment.status || payment.status === 'draft' || payment.status === 'pending_approval') && onSubmitForApproval && !showApproveReject && !showRevoke && !showResubmit && (
                      <button
                        onClick={() => onSubmitForApproval(payment.id)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Отправить на согласование
                      </button>
                    )}
                    {!isPlannedPayments && (!payment.status || payment.status === 'draft') && onEdit && !showApproveReject && !showRevoke && !showResubmit && (
                      <button
                        onClick={() => onEdit(payment)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 flex items-center gap-1"
                        title="Редактировать черновик"
                      >
                        <Icon name="Pencil" size={14} />
                        Редактировать
                      </button>
                    )}
                    {!isPlannedPayments && payment.status === 'draft' && onDelete && !showApproveReject && !showRevoke && !showResubmit && (
                      <button
                        onClick={() => onDelete(payment.id)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-red-500/15 text-red-800 dark:text-red-300 hover:bg-red-500/25 flex items-center gap-1"
                        title="Удалить черновик"
                      >
                        <Icon name="Trash2" size={14} />
                        Удалить
                      </button>
                    )}
                    {showApproveReject && onApprove && (
                      <button
                        onClick={() => onApprove(payment.id)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Одобрить
                      </button>
                    )}
                    {showApproveReject && onReject && (
                      <button
                        onClick={() => onReject(payment.id)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        Отклонить
                      </button>
                    )}
                    {showRevoke && onRevoke && (
                      <button
                        onClick={() => onRevoke(payment.id)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-orange-600 text-white hover:bg-orange-700"
                      >
                        Отозвать согласование
                      </button>
                    )}
                    {showResubmit && onResubmit && (
                      <button
                        onClick={() => onResubmit(payment.id)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-blue-500/15 text-blue-800 dark:text-blue-300 hover:bg-blue-500/25"
                      >
                        Повторное согласование
                      </button>
                    )}
                    {!isPlannedPayments && !showApproveReject && !showRevoke && !showResubmit && payment.status !== 'draft' && payment.status !== 'pending_approval' && !(!payment.status) && onPaymentClick && (
                      <button
                        onClick={() => onPaymentClick(payment)}
                        className="px-3 py-1 text-xs font-semibold rounded bg-foreground/10 text-foreground/80 hover:bg-foreground/15 flex items-center gap-1"
                      >
                        <Icon name="Eye" size={14} />
                        Детали
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsTableDesktop;