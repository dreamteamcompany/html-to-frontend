import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Payment } from '@/types/payment';
import {
  loadPaymentsCache,
  invalidatePaymentsCacheStore,
  removePaymentFromCache,
  paymentsCacheSubscribe,
  getPaymentsCacheSnapshot,
} from '@/contexts/paymentsCacheStore';

interface AllPaymentsCacheState {
  payments: Payment[];
  loading: boolean;
  error: boolean;
  refresh: () => void;
  removePayment: (id: number) => void;
}

const AllPaymentsCacheContext = createContext<AllPaymentsCacheState | null>(null);

export const AllPaymentsCacheProvider = ({ children }: { children: ReactNode }) => {
  const [payments, setPayments] = useState<Payment[]>(() => getPaymentsCacheSnapshot() ?? []);
  const [loading, setLoading] = useState(!getPaymentsCacheSnapshot());
  const [error, setError] = useState(false);

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(false);
    try {
      const list = await loadPaymentsCache(force);
      setPayments(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    invalidatePaymentsCacheStore();
    load(true);
  }, [load]);

  const removePayment = useCallback((id: number) => {
    removePaymentFromCache(id);
  }, []);

  useEffect(() => {
    const unsubscribe = paymentsCacheSubscribe(() => {
      const snap = getPaymentsCacheSnapshot();
      if (snap) setPayments(snap);
      else setPayments([]);
    });
    load();
    return unsubscribe;
  }, [load]);

  return (
    <AllPaymentsCacheContext.Provider value={{ payments, loading, error, refresh, removePayment }}>
      {children}
    </AllPaymentsCacheContext.Provider>
  );
};

export const useAllPaymentsCache = () => {
  const ctx = useContext(AllPaymentsCacheContext);
  if (!ctx) throw new Error('useAllPaymentsCache must be used within AllPaymentsCacheProvider');
  return ctx;
};
