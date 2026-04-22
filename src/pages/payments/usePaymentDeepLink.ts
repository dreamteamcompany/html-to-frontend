import { useEffect, useState } from 'react';
import type { useSearchParams } from 'react-router-dom';
import { Payment } from '@/types/payment';

type SetSearchParams = ReturnType<typeof useSearchParams>[1];

interface UsePaymentDeepLinkParams {
  allPayments: Payment[];
  isCEO: boolean;
  searchParams: URLSearchParams;
  setSearchParams: SetSearchParams;
  setActiveTab: (tab: string) => void;
}

/**
 * Обрабатывает URL-параметр ?payment_id=NN:
 * - запоминает id, на который надо открыть модалку деталей
 * - переключает активный таб в соответствии со статусом найденного платежа
 * - очищает URL-параметр после обработки
 */
export const usePaymentDeepLink = ({
  allPayments,
  isCEO,
  searchParams,
  setSearchParams,
  setActiveTab,
}: UsePaymentDeepLinkParams) => {
  const [openPaymentId, setOpenPaymentId] = useState<number | null>(null);

  useEffect(() => {
    const pid = searchParams.get('payment_id');
    if (pid) {
      const id = parseInt(pid, 10);
      if (!isNaN(id)) {
        setOpenPaymentId(id);
        const found = allPayments.find(p => p.id === id);
        if (found?.status === 'approved') {
          setActiveTab('approved');
        } else if (found?.status === 'rejected') {
          setActiveTab('rejected');
        } else if (found?.status && found.status.startsWith('pending_')) {
          setActiveTab('pending');
        } else if (found) {
          setActiveTab(isCEO ? 'pending' : 'my');
        } else {
          setActiveTab('pending');
        }
        setSearchParams({}, { replace: true });
      }
    }
  }, [allPayments, searchParams, isCEO, setSearchParams, setActiveTab]);

  return { openPaymentId, setOpenPaymentId };
};