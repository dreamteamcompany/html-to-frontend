import { useEffect, useState } from 'react';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { exportTabPaymentsToExcel } from '@/utils/exportExcel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import PendingApprovalsList from '@/components/approvals/PendingApprovalsList';
import PendingApprovalsModal from '@/components/approvals/PendingApprovalsModal';
import { usePendingApprovalsData } from '@/hooks/usePendingApprovalsData';
import { Payment } from '@/types/payment';
import PaymentsFilterPanel from '@/components/payments/PaymentsFilterPanel';
import { usePaymentsFilter } from '@/hooks/usePaymentsFilter';

interface PendingApprovalsTabProps {
  openPaymentId?: number | null;
  onOpenPaymentIdHandled?: () => void;
}

const PendingApprovalsTab = ({ openPaymentId, onOpenPaymentIdHandled }: PendingApprovalsTabProps = {}) => {
  const { requestNotificationPermission } = usePendingApprovals();
  const { payments, loading, approveProgress, handleApprove, handleApproveAll, handleReject } = usePendingApprovalsData();
  const [approvingAll, setApprovingAll] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const {
    filters,
    setFilter,
    clearFilters,
    showFilters,
    setShowFilters,
    filteredPayments,
    options,
    activeCount: activeFiltersCount,
    totalCount,
  } = usePaymentsFilter(payments, 'pending');

  const searchQuery = filters.search;
  const setSearchQuery = (v: string) => setFilter('search', v);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    if (openPaymentId && payments.length > 0) {
      const found = payments.find(p => p.id === openPaymentId);
      if (found) {
        setSelectedPayment(found);
        onOpenPaymentIdHandled?.();
      }
    }
  }, [openPaymentId, payments]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending_ceo':
        return <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-800 dark:text-blue-100 font-semibold">Ожидает CEO</span>;
      default:
        return null;
    }
  };

  const handleModalApprove = (paymentId: number, comment?: string) => {
    if (typeof handleApprove === 'function') {
      handleApprove(paymentId, comment);
      setSelectedPayment(null);
    }
  };

  const handleModalReject = (paymentId: number, comment?: string) => {
    if (typeof handleReject === 'function') {
      handleReject(paymentId, comment);
      setSelectedPayment(null);
    }
  };

  const handleApproveAllClick = async () => {
    const ids = filteredPayments.map(p => p.id).filter(Boolean) as number[];
    setApprovingAll(true);
    await handleApproveAll(ids);
    setApprovingAll(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
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
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
        {!loading && filteredPayments.length > 0 && (
          <button
            onClick={() => exportTabPaymentsToExcel(filteredPayments, 'На согласовании', 'На_согласовании')}
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
          activeCount={activeFiltersCount} filteredCount={filteredPayments.length} totalCount={totalCount}
          options={options}
        />
      )}

      {filteredPayments.length > 1 && (
        <div className="flex flex-col gap-3">
          <div className="flex justify-end">
            <button
              onClick={() => setShowConfirm(true)}
              disabled={approvingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
            >
              <Icon name={approvingAll ? 'Loader2' : 'CheckCheck'} size={16} className={approvingAll ? 'animate-spin' : ''} />
              {approvingAll ? 'Одобряем...' : `Одобрить все (${filteredPayments.length})`}
            </button>
          </div>
          {approveProgress && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-foreground/70">
                <span>Обрабатываем платежи...</span>
                <span>{approveProgress.current} / {approveProgress.total}</span>
              </div>
              <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((approveProgress.current / approveProgress.total) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Одобрить все платежи?</AlertDialogTitle>
            <AlertDialogDescription>
              Будет одобрено {filteredPayments.length} платежей. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApproveAllClick}
              className="bg-green-600 hover:bg-green-500 text-white"
            >
              Одобрить всё
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {notificationPermission !== 'granted' && (
        <div className="px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-yellow-800 dark:text-yellow-100">
              <Icon name="Bell" size={16} />
              <span>Включите уведомления, чтобы не пропустить новые заявки</span>
            </div>
            <button
              onClick={requestNotificationPermission}
              className="text-sm font-semibold text-yellow-800 dark:text-yellow-100 hover:underline whitespace-nowrap"
            >
              Включить
            </button>
          </div>
        </div>
      )}

      <PendingApprovalsList
        loading={loading}
        payments={filteredPayments}
        searchQuery={searchQuery}
        handleApprove={handleApprove}
        handleReject={handleReject}
        getStatusBadge={getStatusBadge}
        onPaymentClick={setSelectedPayment}
      />

      <PendingApprovalsModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onApprove={handleModalApprove}
        onReject={handleModalReject}
        onRevoke={() => {
          // Перезагружаем данные после отзыва
          window.location.reload();
        }}
      />
    </div>
  );
};

export default PendingApprovalsTab;