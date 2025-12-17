import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import PaymentComments from './PaymentComments';

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
}

interface PendingApprovalsModalProps {
  payment: Payment | null;
  onClose: () => void;
  onApprove: (paymentId: number, comment?: string) => void;
  onReject: (paymentId: number, comment?: string) => void;
}

const PendingApprovalsModal = ({ payment, onClose, onApprove, onReject }: PendingApprovalsModalProps) => {
  const [comment, setComment] = useState('');

  if (!payment) return null;

  const handleApprove = () => {
    onApprove(payment.id, comment);
    setComment('');
  };

  const handleReject = () => {
    onReject(payment.id, comment);
    setComment('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Детали заявки #{payment.id}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/20 p-3 rounded-lg">
                <span className="text-2xl">{payment.category_icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium mb-1">{payment.category_name}</h3>
                <p className="text-3xl font-bold text-primary">{payment.amount.toLocaleString('ru-RU')} ₽</p>
              </div>
            </div>

            {payment.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Описание</p>
                <p className="font-medium">{payment.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Дата платежа</p>
                <p className="font-medium">{new Date(payment.payment_date).toLocaleDateString('ru-RU')}</p>
              </div>
              {payment.submitted_at && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Дата отправки</p>
                  <p className="font-medium">{new Date(payment.submitted_at).toLocaleDateString('ru-RU')}</p>
                </div>
              )}
            </div>

            {payment.legal_entity_name && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Юридическое лицо</p>
                <p className="font-medium">{payment.legal_entity_name}</p>
              </div>
            )}

            {payment.contractor_name && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Контрагент</p>
                <p className="font-medium">{payment.contractor_name}</p>
              </div>
            )}

            {payment.department_name && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Отдел-заказчик</p>
                <p className="font-medium">{payment.department_name}</p>
              </div>
            )}

            {payment.service_name && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Сервис</p>
                <p className="font-medium">{payment.service_name}</p>
              </div>
            )}

            {(payment.invoice_number || payment.invoice_date) && (
              <div className="grid grid-cols-2 gap-4">
                {payment.invoice_number && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Номер счёта</p>
                    <p className="font-medium">{payment.invoice_number}</p>
                  </div>
                )}
                {payment.invoice_date && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Дата счёта</p>
                    <p className="font-medium">{new Date(payment.invoice_date).toLocaleDateString('ru-RU')}</p>
                  </div>
                )}
              </div>
            )}

            {payment.created_by_name && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Создал заявку</p>
                <p className="font-medium">{payment.created_by_name}</p>
              </div>
            )}

            {payment.created_at && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Дата создания</p>
                <p className="font-medium">{new Date(payment.created_at).toLocaleString('ru-RU')}</p>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-6 mb-6">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Icon name="MessageSquare" size={20} />
              Обсуждение заявки
            </h3>
            <PaymentComments paymentId={payment.id} />
          </div>

          <div className="border-t border-white/10 pt-6 mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Решение по заявке</h3>
            <label className="text-sm text-muted-foreground mb-2 block">Комментарий к решению (опционально)</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Укажите причину согласования или отклонения"
              className="w-full bg-background border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
            />
          </div>

          <div className="flex gap-3 sticky bottom-0 bg-card py-4 border-t border-white/10">
            <button
              onClick={handleApprove}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="Check" size={20} />
              Согласовать
            </button>
            <button
              onClick={handleReject}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="X" size={20} />
              Отклонить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalsModal;