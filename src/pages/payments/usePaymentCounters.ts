import { useMemo } from 'react';
import { Payment } from '@/types/payment';

export interface PaymentCounters {
  my: number;
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * Счётчики платежей для табов.
 * - my: черновики (без status или status='draft')
 * - pending: статусы pending_*
 * - approved / rejected: по имени
 */
export const usePaymentCounters = (allPayments: Payment[]): PaymentCounters =>
  useMemo(() => ({
    my: allPayments.filter(p => !p.status || p.status === 'draft').length,
    pending: allPayments.filter(p => p.status && p.status.startsWith('pending_')).length,
    approved: allPayments.filter(p => p.status === 'approved').length,
    rejected: allPayments.filter(p => p.status === 'rejected').length,
  }), [allPayments]);
