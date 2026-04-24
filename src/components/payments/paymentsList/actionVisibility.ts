import { Payment } from '@/types/payment';

export interface PaymentActionHandlers {
  onApprove?: (paymentId: number) => void;
  onReject?: (paymentId: number) => void;
  onSubmitForApproval?: (paymentId: number) => void;
  onRevoke?: (paymentId: number) => void;
  onResubmit?: (paymentId: number) => void;
  onDelete?: (paymentId: number) => void;
  onEdit?: (payment: Payment) => void;
  onPaymentClick?: (payment: Payment) => void;
}

export interface PaymentActionFlags {
  isPlannedPayments: boolean;
  showApproveReject: boolean;
  showRevoke: boolean;
  showResubmit: boolean;
}

export const hasActionsForPayment = (
  payment: Payment,
  flags: PaymentActionFlags,
  handlers: PaymentActionHandlers,
): boolean => {
  const { isPlannedPayments, showApproveReject, showRevoke, showResubmit } = flags;
  const { onSubmitForApproval, onDelete, onEdit, onApprove, onReject, onRevoke, onResubmit, onPaymentClick } = handlers;

  if (isPlannedPayments && onSubmitForApproval) return true;
  if (!isPlannedPayments && (!payment.status || payment.status === 'draft' || payment.status?.startsWith('pending_')) && onSubmitForApproval && !showApproveReject && !showRevoke && !showResubmit) return true;
  if (!isPlannedPayments && payment.status === 'draft' && onDelete && !showApproveReject && !showRevoke && !showResubmit) return true;
  if (!isPlannedPayments && (!payment.status || payment.status === 'draft') && onEdit && !showApproveReject && !showRevoke && !showResubmit) return true;
  if (showApproveReject && onApprove) return true;
  if (showApproveReject && onReject) return true;
  if (showRevoke && onRevoke) return true;
  if (showResubmit && onResubmit) return true;
  if (onPaymentClick) return true;
  return false;
};