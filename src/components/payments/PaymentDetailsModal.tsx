import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { API_ENDPOINTS } from '@/config/api';
import { apiFetch } from '@/utils/api';
import { Payment, PaymentDetailsModalProps, PaymentView } from './paymentDetailsTypes';
import PaymentDetailsInfo from './PaymentDetailsInfo';
import PaymentDetailsSidebar from './PaymentDetailsSidebar';

const getStatusBadge = (status?: string) => {
  if (!status || status === 'draft') {
    return <span className="px-3 py-1 rounded-full text-sm bg-gray-500/20 text-foreground/70 font-medium">Черновик</span>;
  }
  if (status === 'pending_ib') {
    return <span className="px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-800 dark:text-yellow-200 font-medium">На согласовании (ИБ)</span>;
  }
  if (status === 'pending_cfo') {
    return <span className="px-3 py-1 rounded-full text-sm bg-orange-500/20 text-orange-800 dark:text-orange-200 font-medium">На согласовании (CFO)</span>;
  }
  if (status === 'pending_ceo') {
    return <span className="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-800 dark:text-blue-200 font-medium">Ожидает CEO</span>;
  }
  if (status === 'pending_tech_director') {
    return <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-800 dark:text-purple-200 font-medium">На согласовании (ТД)</span>;
  }
  if (status === 'approved') {
    return <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-800 dark:text-green-200 font-medium">Одобрен</span>;
  }
  if (status === 'rejected') {
    return <span className="px-3 py-1 rounded-full text-sm bg-red-500/20 text-red-800 dark:text-red-200 font-medium">Отклонен</span>;
  }
  if (status === 'revoked') {
    return <span className="px-3 py-1 rounded-full text-sm bg-orange-500/20 text-orange-800 dark:text-orange-200 font-medium">⚠ Отозван</span>;
  }
  return null;
};

const PaymentDetailsModal = ({ payment, onClose, onSubmitForApproval, onApprove, onReject, onEdit, isPlannedPayment }: PaymentDetailsModalProps) => {
  const [views, setViews] = useState<PaymentView[]>([]);

  useEffect(() => {
    if (!payment) return;
    const viewsUrl = `${API_ENDPOINTS.main}?endpoint=payment-views&payment_id=${payment.id}`;
    apiFetch(viewsUrl, { method: 'POST' })
      .then(() => apiFetch(viewsUrl))
      .then(r => r.json())
      .then(data => setViews(data.views ?? []))
      .catch(() => {});
  }, [payment?.id]);

  if (!payment) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50">
      <div className="bg-card border border-white/10 sm:rounded-xl rounded-t-2xl w-full w-[95vw] max-w-[1200px] h-[95dvh] sm:h-auto sm:max-h-[90vh] flex flex-col">
        {/* Шапка */}
        <div className="bg-card border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-base sm:text-xl font-semibold truncate">Детали платежа #{payment.id}</h2>
            <div className="flex-shrink-0">{getStatusBadge(payment.status)}</div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors flex-shrink-0 p-1 -mr-1"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Тело — на мобиле скролл всего содержимого, на десктопе — две колонки со своими скроллами */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          <PaymentDetailsInfo
            payment={payment}
            views={views}
            isPlannedPayment={isPlannedPayment}
            onEdit={onEdit}
          />
          <PaymentDetailsSidebar
            payment={payment}
            isPlannedPayment={isPlannedPayment}
            onClose={onClose}
            onSubmitForApproval={onSubmitForApproval}
            onApprove={onApprove}
            onReject={onReject}
            onEdit={onEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;