import { useState } from 'react';
import { Payment, CashReceipt } from '@/types/payment';

export const useCashReceipts = () => {
  const [receiptsState, setReceiptsState] = useState<Record<number, CashReceipt[]>>({});

  const getReceipts = (p: Payment): CashReceipt[] => {
    if (receiptsState[p.id] !== undefined) return receiptsState[p.id];
    const fromPayload = (p.cash_receipts as CashReceipt[] | undefined) ?? [];
    if (fromPayload.length > 0) return fromPayload;
    const legacy = p.cash_receipt_url as string | undefined;
    if (legacy) {
      return [{
        id: 0,
        file_url: legacy,
        file_name: undefined,
        uploaded_at: (p.cash_receipt_uploaded_at as string | undefined) || '',
      }];
    }
    return [];
  };

  const handleReceiptsUpdated = (paymentId: number) => (next: CashReceipt[]) => {
    setReceiptsState(prev => ({ ...prev, [paymentId]: next }));
  };

  const isCashApproved = (p: Payment) =>
    ((p.payment_type as string | undefined) || '').toLowerCase() === 'cash' && p.status === 'approved';

  return { getReceipts, handleReceiptsUpdated, isCashApproved };
};
