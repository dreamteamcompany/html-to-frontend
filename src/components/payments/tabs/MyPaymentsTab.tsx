import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { translateApiError } from '@/utils/api';
import { usePaymentsData } from '@/hooks/usePaymentsData';
import { usePaymentForm } from '@/hooks/usePaymentForm';
import { useAllPaymentsCache } from '@/contexts/AllPaymentsCacheContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import PaymentForm from '@/components/payments/PaymentForm';
import CashPaymentForm from '@/components/payments/CashPaymentForm';
import PlannedPaymentsModal from '@/components/payments/PlannedPaymentsModal';
import PaymentsList from '@/components/payments/PaymentsList';
import PaymentDetailsModal from '@/components/payments/PaymentDetailsModal';
import PaymentsFilterPanel from '@/components/payments/PaymentsFilterPanel';
import { usePaymentsFilter } from '@/hooks/usePaymentsFilter';
import { API_ENDPOINTS } from '@/config/api';
import { Payment } from '@/types/payment';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { exportTabPaymentsToExcel } from '@/utils/exportExcel';

interface MyPaymentsTabProps {
  openPaymentId?: number | null;
  onOpenPaymentIdHandled?: () => void;
  onAfterSubmitForApproval?: () => void;
}

const MyPaymentsTab = ({ openPaymentId, onOpenPaymentIdHandled, onAfterSubmitForApproval }: MyPaymentsTabProps = {}) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const { refresh } = useAllPaymentsCache();
  const { refresh: refreshNotifications } = useNotifications();

  const {
    payments,
    categories,
    legalEntities,
    contractors,
    customerDepartments,
    customFields,
    services,
    loading,
    loadPayments,
    loadContractors,
    loadLegalEntities,
  } = usePaymentsData();

  useEffect(() => {
    if (openPaymentId && payments.length > 0) {
      const found = payments.find(p => p.id === openPaymentId);
      if (found) {
        setSelectedPayment(found);
        onOpenPaymentIdHandled?.();
      }
    }
  }, [openPaymentId, payments]);

  const draftPayments = useMemo(
    () => payments.filter(p => !p.status || p.status === 'draft'),
    [payments]
  );

  const {
    filters, setFilter, clearFilters,
    showFilters, setShowFilters,
    filteredPayments, options,
    activeCount, totalCount,
  } = usePaymentsFilter(draftPayments, 'my');

  const handlePaymentSaved = useCallback(() => {
    loadPayments();
    refresh();
  }, [loadPayments, refresh]);

  const {
    dialogOpen,
    setDialogOpen,
    formData,
    setFormData,
    handleSubmit,
    invoicePreview,
    isProcessingInvoice,
    isUploadingInvoice,
    handleFileSelect,
    handleExtractData,
    fileName,
    fileType,
    invoiceFileUrl,
  } = usePaymentForm(customFields, handlePaymentSaved, loadContractors, loadLegalEntities);

  const handleApprove = async (paymentId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.approvalsApi, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({ payment_id: paymentId, action: 'approve', comment: '' }),
      });
      if (response.ok) {
        toast({ title: 'Успешно', description: 'Платёж одобрен' });
        loadPayments();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: translateApiError(error.error) || 'Не удалось одобрить', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', description: 'Проверьте подключение к интернету', variant: 'destructive' });
    }
  };

  const handleReject = async (paymentId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.approvalsApi, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({ payment_id: paymentId, action: 'reject', comment: '' }),
      });
      if (response.ok) {
        toast({ title: 'Успешно', description: 'Платёж отклонён' });
        loadPayments();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: translateApiError(error.error) || 'Не удалось отклонить', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', description: 'Проверьте подключение к интернету', variant: 'destructive' });
    }
  };

  const handleSubmitForApproval = async (paymentId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.approvalsApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({ payment_id: paymentId, action: 'submit' }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Платёж отправлен на согласование',
        });
        loadPayments();
        setTimeout(refreshNotifications, 1500);
        onAfterSubmitForApproval?.();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: translateApiError(error.error) || 'Не удалось отправить на согласование',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to submit for approval:', err);
      toast({
        title: 'Ошибка сети',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (paymentId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот черновик?')) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.main}?endpoint=payments&id=${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Черновик платежа удалён',
        });
        loadPayments();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: translateApiError(error.error) || 'Не удалось удалить платёж',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to delete payment:', err);
      toast({
        title: 'Ошибка сети',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <PaymentForm
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          legalEntities={legalEntities}
          contractors={contractors}
          customerDepartments={customerDepartments}
          customFields={customFields}
          services={services}
          handleSubmit={handleSubmit}
          invoicePreview={invoicePreview}
          isProcessingInvoice={isProcessingInvoice}
          isUploadingInvoice={isUploadingInvoice}
          handleFileSelect={handleFileSelect}
          handleExtractData={handleExtractData}
          fileName={fileName}
          fileType={fileType}
          invoiceFileUrl={invoiceFileUrl}
        />

        <CashPaymentForm
          categories={categories}
          customerDepartments={customerDepartments}
          services={services}
          onSuccess={handlePaymentSaved}
        />

        <PlannedPaymentsModal />
        {!loading && payments.length > 0 && (
          <button
            onClick={() => exportTabPaymentsToExcel(filteredPayments, 'Мои платежи', 'Мои_платежи')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-foreground/5 transition-colors text-sm font-semibold text-foreground whitespace-nowrap"
          >
            <Icon name="Download" size={16} />
            Выгрузить Excel
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60" />
          <Input
            placeholder="Поиск по описанию, категории, сумме..."
            value={filters.search}
            onChange={e => setFilter('search', e.target.value)}
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
      </div>

      {showFilters && (
        <PaymentsFilterPanel
          filters={filters} setFilter={setFilter} clearFilters={clearFilters}
          activeCount={activeCount} filteredCount={filteredPayments.length} totalCount={totalCount}
          options={options}
        />
      )}

      <PaymentsList 
        payments={filteredPayments} 
        loading={loading} 
        onSubmitForApproval={handleSubmitForApproval}
        onDelete={handleDelete}
        onPaymentClick={setSelectedPayment}
      />

      <PaymentDetailsModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onSubmitForApproval={handleSubmitForApproval}
      />
    </div>
  );
};

export default MyPaymentsTab;