import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Payment, CustomField } from '@/types/payment';

interface PaymentsListProps {
  payments: Payment[];
  loading: boolean;
  onApprove?: (paymentId: number) => void;
  onReject?: (paymentId: number) => void;
  onSubmitForApproval?: (paymentId: number) => void;
  onRevoke?: (paymentId: number) => void;
  onResubmit?: (paymentId: number) => void;
  onDelete?: (paymentId: number) => void;
  onPaymentClick?: (payment: Payment) => void;
  isPlannedPayments?: boolean;
  showApproveReject?: boolean;
  showRevoke?: boolean;
  showResubmit?: boolean;
}

type SortKey = 'category' | 'service' | 'legal_entity' | 'description' | 'amount' | 'status' | 'date';
type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<string, number> = {
  draft: 0, pending_ib: 1, pending_cfo: 2, pending_ceo: 3,
  approved: 4, rejected: 5, revoked: 6,
};

const getStatusBadge = (status?: string) => {
  const base = 'px-2 py-1 rounded-full text-xs font-semibold';
  if (!status || status === 'draft') {
    return <span className={`${base} bg-gray-500/20 text-gray-800 dark:text-gray-300`}>Черновик</span>;
  }
  if (status === 'pending_ib') {
    return <span className={`${base} bg-yellow-500/20 text-yellow-800 dark:text-yellow-300`}>На согласовании (ИБ)</span>;
  }
  if (status === 'pending_cfo') {
    return <span className={`${base} bg-orange-500/20 text-orange-800 dark:text-orange-300`}>На согласовании (CFO)</span>;
  }
  if (status === 'pending_ceo') {
    return <span className={`${base} bg-blue-500/20 text-blue-800 dark:text-blue-300`}>На согласовании (CEO)</span>;
  }
  if (status === 'approved') {
    return <span className={`${base} bg-green-500/20 text-green-800 dark:text-green-300`}>Одобрен</span>;
  }
  if (status === 'rejected') {
    return <span className={`${base} bg-red-500/20 text-red-800 dark:text-red-300`}>Отклонён</span>;
  }
  if (status === 'revoked') {
    return <span className={`${base} bg-orange-500/20 text-orange-800 dark:text-orange-300`}>Отозван</span>;
  }
  return null;
};

const hasActionsForPayment = (
  payment: Payment,
  isPlannedPayments: boolean,
  showApproveReject: boolean,
  showRevoke: boolean,
  showResubmit: boolean,
  onSubmitForApproval?: (id: number) => void,
  onDelete?: (id: number) => void,
  onApprove?: (id: number) => void,
  onReject?: (id: number) => void,
  onRevoke?: (id: number) => void,
  onResubmit?: (id: number) => void,
  onPaymentClick?: (p: Payment) => void,
): boolean => {
  if (isPlannedPayments && onSubmitForApproval) return true;
  if (!isPlannedPayments && (!payment.status || payment.status === 'draft' || payment.status?.startsWith('pending_')) && onSubmitForApproval && !showApproveReject && !showRevoke && !showResubmit) return true;
  if (!isPlannedPayments && payment.status === 'draft' && onDelete && !showApproveReject && !showRevoke && !showResubmit) return true;
  if (showApproveReject && onApprove) return true;
  if (showApproveReject && onReject) return true;
  if (showRevoke && onRevoke) return true;
  if (showResubmit && onResubmit) return true;
  if (onPaymentClick) return true;
  return false;
};

const cmp = (a: string, b: string) => a.localeCompare(b, 'ru');

const sortPayments = (list: Payment[], key: SortKey, dir: SortDir): Payment[] => {
  const sorted = [...list].sort((a, b) => {
    let r = 0;
    switch (key) {
      case 'category':
        r = cmp(a.category_name || '', b.category_name || '');
        break;
      case 'service':
        r = cmp(a.service_name || '', b.service_name || '');
        break;
      case 'legal_entity':
        r = cmp(a.legal_entity_name || '', b.legal_entity_name || '');
        break;
      case 'description':
        r = cmp(a.description || '', b.description || '');
        break;
      case 'amount':
        r = (a.amount || 0) - (b.amount || 0);
        break;
      case 'status':
        r = (STATUS_ORDER[a.status || 'draft'] ?? 99) - (STATUS_ORDER[b.status || 'draft'] ?? 99);
        break;
      case 'date': {
        const da = new Date(a.planned_date || a.payment_date || 0).getTime();
        const db = new Date(b.planned_date || b.payment_date || 0).getTime();
        r = da - db;
        break;
      }
    }
    return r;
  });
  return dir === 'desc' ? sorted.reverse() : sorted;
};

const SortHeader = ({
  label, sortKey, activeKey, dir, onClick,
}: {
  label: string; sortKey: SortKey;
  activeKey: SortKey | null; dir: SortDir;
  onClick: (k: SortKey) => void;
}) => {
  const active = activeKey === sortKey;
  return (
    <th
      className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-foreground/70 select-none cursor-pointer hover:text-foreground transition-colors"
      onClick={() => onClick(sortKey)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <span style={{ opacity: active ? 1 : 0.3, transition: 'opacity 0.15s' }}>
          <Icon
            name={active ? (dir === 'asc' ? 'ArrowUp' : 'ArrowDown') : 'ArrowUpDown'}
            size={13}
          />
        </span>
      </div>
    </th>
  );
};

const PaymentsList = ({ payments, loading, onApprove, onReject, onSubmitForApproval, onRevoke, onResubmit, onDelete, onPaymentClick, isPlannedPayments = false, showApproveReject = false, showRevoke = false, showResubmit = false }: PaymentsListProps) => {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(
    () => sortKey ? sortPayments(payments, sortKey, sortDir) : payments,
    [payments, sortKey, sortDir],
  );

  const showActionsColumn = payments.some(p =>
    hasActionsForPayment(p, isPlannedPayments, showApproveReject, showRevoke, showResubmit, onSubmitForApproval, onDelete, onApprove, onReject, onRevoke, onResubmit, onPaymentClick)
  );

  const hp = { activeKey: sortKey, dir: sortDir, onClick: handleSort };

  return (
    <Card className="border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center font-semibold text-foreground/70">Загрузка...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center font-semibold text-foreground/70">
            Нет платежей. Добавьте первый платёж для начала работы.
          </div>
        ) : (
          <>
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
                        {getStatusBadge(payment.status)}
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
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentsList;