import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { translateApiError, translateFetchError } from '@/utils/api';
import DetailsModalShell from '@/components/payments/shared/DetailsModalShell';
import { loadPaymentsCache, getPaymentsCacheSnapshot, refreshPaymentsCacheStore } from '@/contexts/paymentsCacheStore';
import { Payment, PaymentDocument } from './pendingTypes';
import PendingPaymentInfo from './PendingPaymentInfo';
import PendingPaymentSidebar from './PendingPaymentSidebar';
import PendingRevokeDialog from './PendingRevokeDialog';

interface PendingApprovalsModalProps {
  payment: Payment | null;
  onClose: () => void;
  onApprove?: (paymentId: number, comment?: string) => void;
  onReject?: (paymentId: number, comment?: string) => void;
  onRevoke?: () => void;
}

const PendingApprovalsModal = ({ payment: paymentProp, onClose, onApprove, onReject, onRevoke }: PendingApprovalsModalProps) => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeComment, setRevokeComment] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [freshDocuments, setFreshDocuments] = useState<PaymentDocument[] | null>(null);
  const [fullPayment, setFullPayment] = useState<Payment | null>(null);

  useEffect(() => {
    const paymentId = paymentProp?.id;
    setFreshDocuments(null);
    setFullPayment(null);
    if (!paymentId || !token) return;
    let cancelled = false;

    const snap = getPaymentsCacheSnapshot();
    if (snap) {
      const cached = snap.find(p => p.id === paymentId) as Payment | undefined;
      if (cached) setFullPayment(cached);
    }

    (async () => {
      try {
        const list = await loadPaymentsCache();
        if (cancelled) return;
        const fresh = (list as Payment[]).find(p => p.id === paymentId);
        if (fresh) setFullPayment(fresh);
      } catch {
        // если не удалось догрузить — остаёмся с props
      }
    })();

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
        // не критично, покажем то, что пришло в props
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [paymentProp?.id, token]);

  if (!paymentProp) return null;

  const basePayment: Payment = fullPayment
    ? { ...paymentProp, ...fullPayment }
    : paymentProp;

  const payment: Payment = freshDocuments
    ? { ...basePayment, documents: freshDocuments }
    : basePayment;

  const isCreator = user?.id === payment.created_by;
  const isAdmin = user?.roles?.some(role => role.name === 'Администратор' || role.name === 'Admin');
  const isCEO = user?.roles?.some(role => role.name === 'CEO' || role.name === 'Генеральный директор');
  const canRevoke = (isCreator || isAdmin || isCEO) && (payment.status === 'pending_ceo' || payment.status === 'pending_tech_director');

  const handleApprove = () => {
    if (typeof onApprove === 'function') {
      onApprove(payment.id);
    }
  };

  const handleReject = () => {
    if (typeof onReject === 'function') {
      onReject(payment.id);
    }
  };

  const handleRevokeClick = () => {
    setShowRevokeDialog(true);
  };

  const handleRevokeConfirm = async () => {
    if (!revokeComment.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Укажите причину отзыва',
        variant: 'destructive',
      });
      return;
    }

    setIsRevoking(true);
    try {
      const response = await fetch(API_ENDPOINTS.approvalsApi, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          payment_id: payment.id,
          action: 'revoke',
          comment: revokeComment.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(translateApiError(error.error) || 'Не удалось отозвать платёж');
      }

      toast({
        title: 'Успешно',
        description: 'Платёж отозван и возвращён в черновики',
      });

      setShowRevokeDialog(false);
      setRevokeComment('');
      refreshPaymentsCacheStore();
      if (onRevoke) onRevoke();
      onClose();
    } catch (error) {
      console.error('Failed to revoke payment:', error);
      toast({
        title: 'Ошибка',
        description: translateFetchError(error, 'Не удалось отозвать платёж'),
        variant: 'destructive',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <>
      <DetailsModalShell
        variant="center"
        maxWidth="1400px"
        header={
          <>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground break-words">Детали платежа #{payment.id}</h2>
            <button
              onClick={onClose}
              className="text-foreground/60 hover:text-foreground transition-colors flex-shrink-0"
            >
              <Icon name="X" size={20} />
            </button>
          </>
        }
      >
        <PendingPaymentInfo
          payment={payment}
          onApprove={onApprove}
          onReject={onReject}
          onApproveClick={handleApprove}
          onRejectClick={handleReject}
        />
        <PendingPaymentSidebar
          payment={payment}
          canRevoke={!!canRevoke}
          onRevokeClick={handleRevokeClick}
        />
      </DetailsModalShell>

      <PendingRevokeDialog
        open={showRevokeDialog}
        onOpenChange={setShowRevokeDialog}
        comment={revokeComment}
        onCommentChange={setRevokeComment}
        isRevoking={isRevoking}
        onCancel={() => {
          setShowRevokeDialog(false);
          setRevokeComment('');
        }}
        onConfirm={handleRevokeConfirm}
      />
    </>
  );
};

export default PendingApprovalsModal;
