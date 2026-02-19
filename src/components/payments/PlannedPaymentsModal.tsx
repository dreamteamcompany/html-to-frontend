import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { usePlannedPaymentsData } from '@/hooks/usePlannedPaymentsData';
import { usePlannedPaymentForm } from '@/hooks/usePlannedPaymentForm';
import PlannedPaymentForm from '@/components/payments/PlannedPaymentForm';

const recurrenceLabel: Record<string, string> = {
  once: 'Однократно',
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
  yearly: 'Ежегодно',
};

const PlannedPaymentsModal = () => {
  const { hasPermission } = useAuth();
  const [open, setOpen] = useState(false);

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
    loadCategories,
    loadLegalEntities,
    loadContractors,
    loadCustomerDepartments,
    loadCustomFields,
    loadServices,
  } = usePlannedPaymentsData();

  const {
    dialogOpen: createOpen,
    setDialogOpen: setCreateOpen,
    formData,
    setFormData,
    handleSubmit,
  } = usePlannedPaymentForm(customFields, loadPayments);

  const handleOpen = () => {
    loadCategories();
    loadLegalEntities();
    loadContractors();
    loadCustomerDepartments();
    loadCustomFields();
    loadServices();
    setOpen(true);
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (!hasPermission('payments', 'create')) return null;

  return (
    <>
      <Button
        onClick={handleOpen}
        className="bg-blue-500 hover:bg-blue-600 gap-2 w-full sm:w-auto"
      >
        <Icon name="CalendarPlus" size={18} />
        <span>Запланировать платёж</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-3">
              <DialogTitle className="flex items-center gap-2">
                <Icon name="CalendarClock" size={22} />
                Запланированные платежи
              </DialogTitle>
              <Button
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 gap-1.5 shrink-0"
                onClick={() => setCreateOpen(true)}
              >
                <Icon name="Plus" size={15} />
                Создать
              </Button>
            </div>
          </DialogHeader>

          <div className="mt-2 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Icon name="Loader2" size={20} className="animate-spin mr-2" />
                Загрузка...
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                <Icon name="CalendarOff" size={40} className="opacity-30" />
                <p className="text-sm">Нет запланированных платежей</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 mt-1"
                  onClick={() => setCreateOpen(true)}
                >
                  <Icon name="Plus" size={15} />
                  Создать первый
                </Button>
              </div>
            ) : (
              payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between gap-3 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/8 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="shrink-0 w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Icon name={p.category_icon || 'Calendar'} size={16} className="text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.description}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">{p.category_name}</span>
                        {p.recurrence_type && p.recurrence_type !== 'once' && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                            {recurrenceLabel[p.recurrence_type] ?? p.recurrence_type}
                          </span>
                        )}
                        {p.legal_entity_name && (
                          <span className="text-xs text-muted-foreground truncate">{p.legal_entity_name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-white">{formatAmount(p.amount)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(p.planned_date)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PlannedPaymentForm
        dialogOpen={createOpen}
        setDialogOpen={setCreateOpen}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        legalEntities={legalEntities}
        contractors={contractors}
        customerDepartments={customerDepartments}
        customFields={customFields}
        services={services}
        handleSubmit={handleSubmit}
        onDialogOpen={() => {
          loadCategories();
          loadLegalEntities();
          loadContractors();
          loadCustomerDepartments();
          loadCustomFields();
          loadServices();
        }}
      />
    </>
  );
};

export default PlannedPaymentsModal;
