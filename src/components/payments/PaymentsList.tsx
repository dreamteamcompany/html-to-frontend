import { Card, CardContent } from '@/components/ui/card';
import { Payment } from '@/types/payment';
import { useAuth } from '@/contexts/AuthContext';
import { usePaymentsSorting } from './paymentsList/sorting';
import { useCashReceipts } from './paymentsList/useCashReceipts';
import PaymentsTableDesktop from './paymentsList/PaymentsTableDesktop';
import PaymentsListMobile from './paymentsList/PaymentsListMobile';
import { PaymentActionFlags, PaymentActionHandlers } from './paymentsList/actionVisibility';

interface PaymentsListProps {
  payments: Payment[];
  loading: boolean;
  onApprove?: (paymentId: number) => void;
  onReject?: (paymentId: number) => void;
  onSubmitForApproval?: (paymentId: number) => void;
  onRevoke?: (paymentId: number) => void;
  onResubmit?: (paymentId: number) => void;
  onDelete?: (paymentId: number) => void;
  onEdit?: (payment: Payment) => void;
  onPaymentClick?: (payment: Payment) => void;
  isPlannedPayments?: boolean;
  showApproveReject?: boolean;
  showRevoke?: boolean;
  showResubmit?: boolean;
}

const PaymentsList = ({
  payments,
  loading,
  onApprove,
  onReject,
  onSubmitForApproval,
  onRevoke,
  onResubmit,
  onDelete,
  onEdit,
  onPaymentClick,
  isPlannedPayments = false,
  showApproveReject = false,
  showRevoke = false,
  showResubmit = false,
}: PaymentsListProps) => {
  const { user } = useAuth();
  const { sortKey, sortDir, sorted, handleSort } = usePaymentsSorting(payments);
  const { getReceipts, handleReceiptsUpdated, isCashApproved } = useCashReceipts();

  const flags: PaymentActionFlags = { isPlannedPayments, showApproveReject, showRevoke, showResubmit };
  const handlers: PaymentActionHandlers = {
    onApprove, onReject, onSubmitForApproval, onRevoke, onResubmit, onDelete, onEdit, onPaymentClick,
  };

  return (
    <Card className="border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center font-semibold text-foreground/70">Загрузка...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center font-semibold text-foreground/70">
            Нет платежей. Добавьте первый платёж для начала работы.
          </div>
        ) : (
          <>
            <PaymentsTableDesktop
              sorted={sorted}
              payments={payments}
              user={user}
              flags={flags}
              handlers={handlers}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              getReceipts={getReceipts}
              isCashApproved={isCashApproved}
            />
            <PaymentsListMobile
              sorted={sorted}
              flags={flags}
              handlers={handlers}
              getReceipts={getReceipts}
              handleReceiptsUpdated={handleReceiptsUpdated}
              isCashApproved={isCashApproved}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentsList;