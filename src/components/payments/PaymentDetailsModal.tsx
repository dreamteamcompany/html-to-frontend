import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { API_ENDPOINTS } from '@/config/api';
import { apiFetch } from '@/utils/api';
import { Payment, PaymentDetailsModalProps, PaymentView } from './paymentDetailsTypes';
import PaymentDetailsInfo from './PaymentDetailsInfo';
import PaymentDetailsSidebar from './PaymentDetailsSidebar';

const getStatusBadge = (status?: string) => {
  if (!status || status === 'draft') {
    return <span className="px-3 py-1 rounded-full text-sm bg-gray-500/20" style={{ color: '#000000' }}>Черновик</span>;
  }
  if (status === 'pending_ceo') {
    return <span className="px-3 py-1 rounded-full text-sm bg-blue-500/20" style={{ color: '#000000' }}>Ожидает CEO</span>;
  }
  if (status === 'approved') {
    return <span className="px-3 py-1 rounded-full text-sm bg-green-500/20" style={{ color: '#000000' }}>Одобрен</span>;
  }
  if (status === 'rejected') {
    return <span className="px-3 py-1 rounded-full text-sm bg-red-500/20" style={{ color: '#000000' }}>Отклонен</span>;
  }
  if (status === 'revoked') {
    return <span className="px-3 py-1 rounded-full text-sm bg-orange-500/20" style={{ color: '#000000' }}>⚠ Отозван</span>;
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-card border border-white/10 rounded-xl w-full max-w-[1200px] max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="bg-card border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold">Детали платежа #{payment.id}</h2>
            {getStatusBadge(payment.status)}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
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
