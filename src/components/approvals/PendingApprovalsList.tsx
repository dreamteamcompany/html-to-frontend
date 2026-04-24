import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  value: string;
}

interface Payment {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  description: string;
  amount: number;
  payment_date: string;
  legal_entity_id?: number;
  legal_entity_name?: string;
  status?: string;
  created_by?: number;
  service_id?: number;
  service_name?: string;
  contractor_name?: string;
  department_name?: string;
  invoice_number?: string;
  custom_fields?: CustomField[];
}

interface PendingApprovalsListProps {
  loading: boolean;
  payments: Payment[];
  searchQuery: string;
  handleApprove?: (paymentId: number) => void;
  handleReject?: (paymentId: number) => void;
  handleDelete?: (paymentId: number) => void;
  getStatusBadge: (status?: string) => JSX.Element | null;
  onPaymentClick: (payment: Payment) => void;
}

const PendingApprovalsList = ({
  loading,
  payments,
  searchQuery,
  handleApprove,
  handleReject,
  handleDelete,
  getStatusBadge,
  onPaymentClick,
}: PendingApprovalsListProps) => {
  if (loading) {
    return (
      <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground py-8">Загрузка...</div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
        <CardContent className="p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon name="CheckCircle" size={32} className="text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Всё согласовано!</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Платежи не найдены' : 'У вас нет платежей, ожидающих согласования'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <Card key={payment.id} className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-white/10 transition-all cursor-pointer" onClick={() => onPaymentClick(payment)}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 space-y-3 w-full min-w-0">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Icon name={payment.category_icon} size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold">{payment.category_name}</h3>
                      {getStatusBadge(payment.status)}
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
                      {payment.invoice_number && (
                        <div className="flex items-center gap-1">
                          <Icon name="FileText" size={14} />
                          <span>Счёт №{payment.invoice_number}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Icon name="Calendar" size={14} />
                        <span>
                          {new Date(payment.payment_date).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
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
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto lg:border-l lg:border-white/10 lg:pl-6">
                <div className="text-left sm:text-right">
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Сумма платежа</div>
                  <div className="text-3xl font-extrabold text-primary">{payment.amount.toLocaleString('ru-RU')} ₽</div>
                </div>
                {(handleApprove || handleReject || handleDelete) && (
                  <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                    {handleApprove && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(payment.id);
                        }}
                        className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Icon name="Check" size={18} />
                        Одобрить
                      </button>
                    )}
                    {handleReject && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(payment.id);
                        }}
                        className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                      >
                        <Icon name="X" size={18} />
                        Отклонить
                      </button>
                    )}
                    {handleDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(payment.id);
                        }}
                        title="Удалить платёж (только для администратора)"
                        className="flex-1 sm:flex-none px-4 py-3 rounded-lg bg-red-500/15 text-red-800 dark:text-red-300 hover:bg-red-500/25 transition-colors font-semibold flex items-center justify-center gap-2"
                      >
                        <Icon name="Trash2" size={18} />
                        Удалить
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PendingApprovalsList;