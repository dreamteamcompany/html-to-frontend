import { useState, useEffect, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { API_ENDPOINTS } from '@/config/api';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentDetailsModalProps, PaymentView, PaymentDocument } from './paymentDetailsTypes';
import PaymentDetailsInfo from './PaymentDetailsInfo';
import PaymentDetailsSidebar from './PaymentDetailsSidebar';
import DetailsModalShell from './shared/DetailsModalShell';

const getStatusBadge = (status?: string) => {
  const base = 'px-3 py-1 rounded-full text-sm font-semibold';
  if (!status || status === 'draft') {
    return <span className={`${base} bg-gray-500/20 text-gray-800 dark:text-gray-300`}>Черновик</span>;
  }
  if (status === 'pending_ceo') {
    return <span className={`${base} bg-blue-500/20 text-blue-800 dark:text-blue-300`}>Ожидает CEO</span>;
  }
  if (status === 'approved') {
    return <span className={`${base} bg-green-500/20 text-green-800 dark:text-green-300`}>Одобрен</span>;
  }
  if (status === 'rejected') {
    return <span className={`${base} bg-red-500/20 text-red-800 dark:text-red-300`}>Отклонен</span>;
  }
  if (status === 'revoked') {
    return <span className={`${base} bg-orange-500/20 text-orange-800 dark:text-orange-300`}>⚠ Отозван</span>;
  }
  return null;
};

const PaymentDetailsModal = ({ payment, onClose, onSubmitForApproval, onApprove, onReject, onEdit, isPlannedPayment }: PaymentDetailsModalProps) => {
  const { token } = useAuth();
  const [views, setViews] = useState<PaymentView[]>([]);
  const [freshDocuments, setFreshDocuments] = useState<PaymentDocument[] | null>(null);

  useEffect(() => {
    if (!payment) return;
    const viewsUrl = `${API_ENDPOINTS.main}?endpoint=payment-views&payment_id=${payment.id}`;
    apiFetch(viewsUrl, { method: 'POST' })
      .then(() => apiFetch(viewsUrl))
      .then(r => r.json())
      .then(data => setViews(data.views ?? []))
      .catch(() => {});
  }, [payment?.id]);

  useEffect(() => {
    const paymentId = payment?.id;
    setFreshDocuments(null);
    if (!paymentId || !token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.paymentsApi}?action=invoice_files`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token,
          },
          body: JSON.stringify({ payment_id: paymentId, sub_action: 'list' }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && Array.isArray(data.documents)) {
          setFreshDocuments(data.documents as PaymentDocument[]);
        }
      } catch {
        // не критично
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [payment?.id, token]);

  const paymentWithDocs = useMemo(() => {
    if (!payment) return payment;
    if (!freshDocuments) return payment;
    return { ...payment, documents: freshDocuments };
  }, [payment, freshDocuments]);

  if (!paymentWithDocs) return null;

  return (
    <DetailsModalShell
      variant="sheet"
      maxWidth="1200px"
      header={
        <>
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <h2 className="text-base sm:text-xl font-semibold text-foreground break-words">Детали платежа #{paymentWithDocs.id}</h2>
            <div className="flex-shrink-0">{getStatusBadge(paymentWithDocs.status)}</div>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/60 hover:text-foreground transition-colors flex-shrink-0 p-1 -mr-1"
          >
            <Icon name="X" size={20} />
          </button>
        </>
      }
    >
      <PaymentDetailsInfo
        payment={paymentWithDocs}
        views={views}
        isPlannedPayment={isPlannedPayment}
        onEdit={onEdit}
      />
      <PaymentDetailsSidebar
        payment={paymentWithDocs}
        isPlannedPayment={isPlannedPayment}
        onClose={onClose}
        onSubmitForApproval={onSubmitForApproval}
        onApprove={onApprove}
        onReject={onReject}
        onEdit={onEdit}
      />
    </DetailsModalShell>
  );
};

export default PaymentDetailsModal;