import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

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
  created_by_name?: string;
  service_id?: number;
  service_name?: string;
  contractor_name?: string;
  contractor_id?: number;
  department_name?: string;
  department_id?: number;
  invoice_number?: string;
  invoice_date?: string;
  created_at?: string;
  submitted_at?: string;
  ceo_approved_at?: string;
  custom_fields?: CustomField[];
}

interface ApprovedPaymentsModalProps {
  open: boolean;
  onClose: () => void;
}

const ApprovedPaymentsModal = ({ open, onClose }: ApprovedPaymentsModalProps) => {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (open) {
      fetchApprovedPayments();
    }
  }, [open]);

  const fetchApprovedPayments = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/payments', {
        headers: token ? { 'X-User-Token': token } : {},
      });
      
      // Фильтруем только одобренные платежи (со статусом approved или с ceo_approved_at)
      const approvedPayments = data.filter((p: Payment) => 
        p.ceo_approved_at !== null || p.status === 'approved'
      );
      
      setPayments(approvedPayments);
    } catch (error) {
      console.error('Failed to fetch approved payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="CheckCircle" size={24} className="text-green-500" />
            Согласованные и оплаченные платежи
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <div className="mb-4">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Поиск по описанию, категории, сумме..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-xl font-semibold mb-2">Нет согласованных платежей</h3>
              <p className="text-muted-foreground">
                {payments.length === 0 
                  ? 'Когда платежи будут согласованы, они отобразятся здесь'
                  : 'Попробуйте изменить поисковый запрос'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  onClick={() => setSelectedPayment(payment)}
                  className="p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="text-2xl flex-shrink-0">
                        {payment.category_icon || '📄'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold truncate">{payment.description}</h4>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-300 flex-shrink-0">
                            Одобрено
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <span>{payment.category_name}</span>
                            {payment.service_name && (
                              <>
                                <span>•</span>
                                <span>{payment.service_name}</span>
                              </>
                            )}
                          </div>
                          {payment.contractor_name && (
                            <div className="flex items-center gap-2">
                              <Icon name="Building" size={14} />
                              <span>{payment.contractor_name}</span>
                            </div>
                          )}
                          {payment.legal_entity_name && (
                            <div className="flex items-center gap-2">
                              <Icon name="Briefcase" size={14} />
                              <span>{payment.legal_entity_name}</span>
                            </div>
                          )}
                          {payment.ceo_approved_at && (
                            <div className="flex items-center gap-2 text-green-400">
                              <Icon name="Calendar" size={14} />
                              <span>Одобрено: {formatDate(payment.ceo_approved_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-bold mb-1">{formatAmount(payment.amount)}</div>
                      {payment.payment_date && (
                        <div className="text-sm text-muted-foreground">
                          {formatDate(payment.payment_date)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPayment && (
          <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-2xl">{selectedPayment.category_icon || '📄'}</span>
                  {selectedPayment.description}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Сумма</div>
                    <div className="text-2xl font-bold">{formatAmount(selectedPayment.amount)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Дата платежа</div>
                    <div className="text-lg">{formatDate(selectedPayment.payment_date)}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Категория</div>
                  <div>{selectedPayment.category_name}</div>
                </div>

                {selectedPayment.service_name && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Сервис</div>
                    <div>{selectedPayment.service_name}</div>
                  </div>
                )}

                {selectedPayment.contractor_name && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Контрагент</div>
                    <div>{selectedPayment.contractor_name}</div>
                  </div>
                )}

                {selectedPayment.legal_entity_name && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Юридическое лицо</div>
                    <div>{selectedPayment.legal_entity_name}</div>
                  </div>
                )}

                {selectedPayment.department_name && (
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Отдел</div>
                    <div>{selectedPayment.department_name}</div>
                  </div>
                )}

                {selectedPayment.invoice_number && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Номер счета</div>
                      <div>{selectedPayment.invoice_number}</div>
                    </div>
                    {selectedPayment.invoice_date && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Дата счета</div>
                        <div>{formatDate(selectedPayment.invoice_date)}</div>
                      </div>
                    )}
                  </div>
                )}

                {selectedPayment.ceo_approved_at && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-400">
                      <Icon name="CheckCircle" size={20} />
                      <span className="font-medium">Одобрено CEO: {formatDate(selectedPayment.ceo_approved_at)}</span>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApprovedPaymentsModal;
