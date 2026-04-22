import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  loadPaymentsCache,
  invalidatePaymentsCacheStore,
  paymentsCacheSubscribe,
  getPaymentsCacheSnapshot,
  ensureUserScope,
} from '@/contexts/paymentsCacheStore';

/**
 * PaymentRecord — исторический локальный тип этого контекста.
 * Сохраняется как алиас слабо типизированной записи платежа,
 * совместимый с Payment (через индексную сигнатуру).
 * Внешние модули проекта импортируют этот тип — переезд будет постепенным.
 */
export interface PaymentRecord {
  id: number;
  status: string;
  payment_date: string;
  created_at?: string;
  amount: number;
  description?: string;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
  service_id?: number;
  service_name?: string;
  department_id?: number;
  department_name?: string;
  contractor_name?: string;
  legal_entity_name?: string;
  payment_type?: string;
  [key: string]: unknown;
}

interface PaymentsCacheState {
  payments: PaymentRecord[];
  loading: boolean;
  error: boolean;
  refresh: () => void;
}

const PaymentsCacheContext = createContext<PaymentsCacheState | null>(null);

export const invalidatePaymentsCache = () => {
  invalidatePaymentsCacheStore();
};

export const PaymentsCacheProvider = ({ children }: { children: ReactNode }) => {
  const initialSnap = getPaymentsCacheSnapshot();
  const [payments, setPayments] = useState<PaymentRecord[]>(
    (initialSnap as unknown as PaymentRecord[] | null) ?? [],
  );
  const [loading, setLoading] = useState(!initialSnap);
  const [error, setError] = useState(false);
  const { user } = useAuth();

  const load = useCallback(async (force = false) => {
    setLoading(true);
    setError(false);
    try {
      const list = await loadPaymentsCache(force);
      setPayments(list as unknown as PaymentRecord[]);
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

  useEffect(() => {
    const unsubscribe = paymentsCacheSubscribe(() => {
      const snap = getPaymentsCacheSnapshot();
      setPayments((snap as unknown as PaymentRecord[] | null) ?? []);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const userChanged = ensureUserScope(user?.id ?? null);
    if (userChanged) {
      setPayments([]);
    }
    load();
  }, [user?.id, load]);

  return (
    <PaymentsCacheContext.Provider value={{ payments, loading, error, refresh }}>
      {children}
    </PaymentsCacheContext.Provider>
  );
};

export const usePaymentsCache = () => {
  const ctx = useContext(PaymentsCacheContext);
  if (!ctx) throw new Error('usePaymentsCache must be used within PaymentsCacheProvider');
  return ctx;
};
