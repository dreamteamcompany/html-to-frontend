import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/utils/api';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import PaymentDetailsModal from '@/components/payments/PaymentDetailsModal';
import EditPaymentModal from '@/components/payments/EditPaymentModal';
import { API_ENDPOINTS } from '@/config/api';
import { Payment } from '@/types/payment';
import { useAllPaymentsCache } from '@/contexts/AllPaymentsCacheContext';
import { invalidateMyPaymentsCache } from '@/hooks/usePaymentsData';
import { exportTabPaymentsToExcel } from '@/utils/exportExcel';
import PaymentsFilterPanel from '@/components/payments/PaymentsFilterPanel';
import { usePaymentsFilter } from '@/hooks/usePaymentsFilter';
import { useAuth } from '@/contexts/AuthContext';

interface ExtendedPayment extends Payment {
  rejected_at?: string;
  rejection_comment?: string;
}

interface RejectedPaymentsTabProps {
  openPaymentId?: number | null;
  onOpenPaymentIdHandled?: () => void;
}

const RejectedPaymentsTab = ({ openPaymentId, onOpenPaymentIdHandled }: RejectedPaymentsTabProps = {}) => {
  const { payments: allPayments, loading, refresh } = useAllPaymentsCache();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<ExtendedPayment | null>(null);
  const [editingPayment, setEditingPayment] = useState<ExtendedPayment | null>(null);

  // Кнопки «Отправить на повторное согласование» и «Редактировать платёж»
  // в отклонённых доступны только Финансисту и Администратору.
  // Для CEO/Генерального директора и прочих ролей кнопки скрыты.
  const canResubmit = useMemo(
    () => !!user?.roles?.some(r =>
      r.name === 'Финансист' ||
      r.name === 'Financier' ||
      r.name === 'Администратор' ||
      r.name === 'Admin'
    ),
    [user]
  );
  const canEditRejected = canResubmit;

  const payments = useMemo(() =>
    (allPayments as ExtendedPayment[]).filter(p => p.status === 'rejected'),
    [allPayments]
  );

  useEffect(() => {
    if (openPaymentId && payments.length > 0) {
      const found = payments.find(p => p.id === openPaymentId);
      if (found) {
        setSelectedPayment(found);
        onOpenPaymentIdHandled?.();
      }
    }
  }, [openPaymentId, payments]);

  const {
    filters, setFilter, clearFilters,
    showFilters, setShowFilters,
    filteredPayments: filtered, options,
    activeCount, totalCount,
  } = usePaymentsFilter(payments, 'rejected');

  const fetchRejectedPayments = () => refresh();

  const handleResubmit = async (paymentId: number) => {
    try {
      const res = await apiFetch(`${API_ENDPOINTS.approvalsApi}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId, action: 'submit' })
      });
      if (res.ok) {
        fetchRejectedPayments();
      } else {
        const err = await res.json();
      }
    } catch { /* network error */ }
  };

  const filteredPayments = filtered.filter(payment => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      payment.description.toLowerCase().includes(query) ||
      payment.category_name.toLowerCase().includes(query) ||
      payment.amount.toString().includes(query) ||
      payment.contractor_name?.toLowerCase().includes(query) ||
      payment.legal_entity_name?.toLowerCase().includes(query)
    );
  });

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60" />
          <Input
            placeholder="Поиск по описанию, категории, сумме..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-border text-foreground placeholder:text-foreground/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="relative p-2 rounded-lg border border-border text-foreground hover:bg-foreground/5 transition-colors"
        >
          <Icon name="SlidersHorizontal" size={20} />
          {activeCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
        {!loading && filteredPayments.length > 0 && (
          <button
            onClick={() => exportTabPaymentsToExcel(filteredPayments, 'Отклонённые платежи', 'Отклонённые_платежи')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-foreground/5 transition-colors text-sm font-semibold whitespace-nowrap"
          >
            <Icon name="Download" size={16} />
            Выгрузить Excel
          </button>
        )}
      </div>

      {showFilters && (
        <PaymentsFilterPanel
          filters={filters} setFilter={setFilter} clearFilters={clearFilters}
          activeCount={activeCount} filteredCount={filteredPayments.length} totalCount={totalCount}
          options={options}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Нет отклонённых платежей</h3>
          <p className="font-medium text-foreground/70">
            {payments.length === 0 
              ? 'Когда платежи будут отклонены, они отобразятся здесь'
              : 'Попробуйте изменить поисковый запрос'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <Card 
              key={payment.id} 
              className="border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-primary/40 transition-all cursor-pointer" 
              onClick={() => setSelectedPayment(payment)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-3 w-full min-w-0">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 dark:text-red-300 flex-shrink-0">
                        <Icon name={payment.category_icon} size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground">{payment.category_name}</h3>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-800 dark:text-red-300">✗ Отклонено</span>
                        </div>
                        <p className="text-base font-semibold text-foreground mb-3">{payment.description}</p>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-foreground/80">
                          {payment.service_name && (
                            <div className="flex items-center gap-1">
                              <Icon name="Briefcase" size={14} />
                              <span>{payment.service_name}</span>
                            </div>
                          )}
                          {payment.contractor_name && (
                            <div className="flex items-center gap-1">
                              <Icon name="Building2" size={14} />
                              <span>{payment.contractor_name}</span>
                            </div>
                          )}
                          {payment.department_name && (
                            <div className="flex items-center gap-1">
                              <Icon name="Users" size={14} />
                              <span>{payment.department_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Icon name="Calendar" size={14} />
                            <span>{formatDate(payment.payment_date)}</span>
                          </div>
                        </div>
                        {payment.legal_entity_name && (
                          <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 rounded-md border border-primary/40 bg-primary/10 text-sm font-semibold text-foreground">
                            <Icon name="Landmark" size={14} />
                            <span>{payment.legal_entity_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left lg:text-right w-full lg:w-auto lg:border-l lg:border-border lg:pl-6 space-y-3">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Сумма платежа</div>
                      <div className="text-3xl font-extrabold text-primary">{formatAmount(payment.amount)}</div>
                    </div>
                    {canResubmit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResubmit(payment.id);
                        }}
                        className="px-4 py-2 text-sm rounded bg-blue-500/15 hover:bg-blue-500/25 text-blue-800 dark:text-blue-300 font-semibold w-full lg:w-auto"
                      >
                        Отправить на повторное согласование
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PaymentDetailsModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onSubmitForApproval={canResubmit ? handleResubmit : undefined}
        onEdit={canEditRejected ? (payment) => {
          setEditingPayment(payment as ExtendedPayment);
          setSelectedPayment(null);
        } : undefined}
      />

      <EditPaymentModal
        payment={editingPayment}
        onClose={() => setEditingPayment(null)}
        onSuccess={() => {
          setEditingPayment(null);
          invalidateMyPaymentsCache();
          fetchRejectedPayments();
        }}
      />
    </div>
  );
};

export default RejectedPaymentsTab;