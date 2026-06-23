import { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { setCurrentClinicId, getCurrentClinicId } from '@/utils/api';
import { invalidatePaymentsCacheStore } from '@/contexts/paymentsCacheStore';
import { invalidateMyPaymentsCache } from '@/hooks/usePaymentsData';
import { useDictionaryContext } from '@/contexts/DictionaryContext';

interface ClinicContextValue {
  clinicId: number | null;
}

const ClinicContext = createContext<ClinicContextValue>({ clinicId: null });

export const useClinic = () => useContext(ClinicContext);

interface ClinicProviderProps {
  clinicId: number | null;
  children: ReactNode;
}

/**
 * Контекст текущей клиники («портал в портале»).
 * - Устанавливает X-Clinic-Id для всех запросов (через apiFetch).
 * - При смене клиники сбрасывает кеши платежей и перезагружает справочники,
 *   чтобы данные одной клиники/общего портала не пересекались.
 */
export const ClinicProvider = ({ clinicId, children }: ClinicProviderProps) => {
  const dictionary = useDictionaryContext();
  const prevClinicRef = useRef<number | null | undefined>(undefined);

  // Синхронно фиксируем клинику ДО первого запроса дочерних компонентов.
  if (getCurrentClinicId() !== clinicId) {
    setCurrentClinicId(clinicId);
  }

  useEffect(() => {
    const prev = prevClinicRef.current;
    setCurrentClinicId(clinicId);

    if (prev !== undefined && prev !== clinicId) {
      invalidatePaymentsCacheStore();
      invalidateMyPaymentsCache();
      dictionary.refreshAll();
    }
    prevClinicRef.current = clinicId;
  }, [clinicId, dictionary]);

  return (
    <ClinicContext.Provider value={{ clinicId }}>
      {children}
    </ClinicContext.Provider>
  );
};

export default ClinicProvider;
