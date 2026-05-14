import { useState, useCallback, useEffect, useMemo } from 'react';
import { usePaymentsData } from '@/hooks/usePaymentsData';
import { usePaymentForm } from '@/hooks/usePaymentForm';
import { useAllPaymentsCache } from '@/contexts/AllPaymentsCacheContext';
import { useAuth } from '@/contexts/AuthContext';
import PaymentsList from '@/components/payments/PaymentsList';
import PaymentDetailsModal from '@/components/payments/PaymentDetailsModal';
import EditPaymentModal from '@/components/payments/EditPaymentModal';
import PaymentsFilterPanel from '@/components/payments/PaymentsFilterPanel';
import { usePaymentsFilter } from '@/hooks/usePaymentsFilter';
import { Payment } from '@/types/payment';
import MyPaymentsToolbar from './myPayments/MyPaymentsToolbar';
import MyPaymentsSearchBar from './myPayments/MyPaymentsSearchBar';
import { usePaymentActions } from './myPayments/usePaymentActions';

interface MyPaymentsTabProps {
  openPaymentId?: number | null;
  onOpenPaymentIdHandled?: () => void;
  onAfterSubmitForApproval?: () => void;
}

const MyPaymentsTab = ({ openPaymentId, onOpenPaymentIdHandled, onAfterSubmitForApproval }: MyPaymentsTabProps = {}) => {
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const { refresh } = useAllPaymentsCache();
  const { user } = useAuth();

  const isFinancier = useMemo(
    () => !!user?.roles?.some(r => r.name === 'Финансист' || r.name === 'Financier'),
    [user]
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    additionalFiles,
    addAdditionalFiles,
    removeAdditionalFile,
    additionalProgress,
  } = usePaymentForm(customFields, handlePaymentSaved, loadContractors, loadLegalEntities);

  const { handleSubmitForApproval, handleDelete } = usePaymentActions({
    loadPayments,
    onAfterSubmitForApproval,
  });

  return (
    <div className="space-y-6">
      <MyPaymentsToolbar
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
        additionalFiles={additionalFiles}
        addAdditionalFiles={addAdditionalFiles}
        removeAdditionalFile={removeAdditionalFile}
        additionalProgress={additionalProgress}
        handlePaymentSaved={handlePaymentSaved}
        loading={loading}
        paymentsCount={payments.length}
        filteredPayments={filteredPayments}
      />

      <MyPaymentsSearchBar
        searchValue={filters.search}
        onSearchChange={(v) => setFilter('search', v)}
        onToggleFilters={() => setShowFilters(!showFilters)}
        activeFiltersCount={activeCount}
      />

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
        onEdit={isFinancier ? setEditingPayment : undefined}
        onPaymentClick={setSelectedPayment}
      />

      <PaymentDetailsModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onSubmitForApproval={handleSubmitForApproval}
      />

      {editingPayment && (
        <EditPaymentModal
          payment={editingPayment as unknown as import('@/components/payments/editPaymentTypes').EditPayment}
          onClose={() => setEditingPayment(null)}
          onSuccess={() => {
            setEditingPayment(null);
            handlePaymentSaved();
          }}
        />
      )}
    </div>
  );
};

export default MyPaymentsTab;