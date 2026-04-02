import { useState, useMemo, useCallback, useEffect } from 'react';
import { Payment } from '@/types/payment';

export interface PaymentsFilterState {
  search: string;
  category: string;
  service: string;
  contractor: string;
  legalEntity: string;
  department: string;
  status: string;
  amountFrom: string;
  amountTo: string;
  dateFrom: string;
  dateTo: string;
}

const EMPTY: PaymentsFilterState = {
  search: '', category: '', service: '', contractor: '',
  legalEntity: '', department: '', status: '',
  amountFrom: '', amountTo: '', dateFrom: '', dateTo: '',
};

const STORAGE_KEY = 'payments_filters_';

const load = (tabId: string): PaymentsFilterState => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY + tabId);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...EMPTY };
};

const save = (tabId: string, state: PaymentsFilterState) => {
  try { sessionStorage.setItem(STORAGE_KEY + tabId, JSON.stringify(state)); } catch { /* ignore */ }
};

export const usePaymentsFilter = (payments: Payment[], tabId: string) => {
  const [filters, setFilters] = useState<PaymentsFilterState>(() => load(tabId));
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { save(tabId, filters); }, [filters, tabId]);

  const setFilter = useCallback(<K extends keyof PaymentsFilterState>(key: K, value: PaymentsFilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ ...EMPTY });
  }, []);

  const options = useMemo(() => {
    const unique = (fn: (p: Payment) => string | undefined) => {
      const set = new Set<string>();
      payments.forEach(p => { const v = fn(p); if (v) set.add(v); });
      return Array.from(set).sort((a, b) => a.localeCompare(b, 'ru'));
    };
    return {
      categories: unique(p => p.category_name),
      services: unique(p => p.service_name),
      contractors: unique(p => p.contractor_name),
      legalEntities: unique(p => p.legal_entity_name),
      departments: unique(p => p.department_name),
      statuses: unique(p => p.status),
    };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    const amtFrom = filters.amountFrom ? parseFloat(filters.amountFrom) : null;
    const amtTo = filters.amountTo ? parseFloat(filters.amountTo) : null;
    const dFrom = filters.dateFrom || null;
    const dTo = filters.dateTo || null;

    return payments.filter(p => {
      if (q) {
        const haystack = [
          p.description, p.category_name, p.service_name,
          p.contractor_name, p.legal_entity_name, p.department_name,
          p.amount?.toString(), p.invoice_number,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.category && p.category_name !== filters.category) return false;
      if (filters.service && p.service_name !== filters.service) return false;
      if (filters.contractor && p.contractor_name !== filters.contractor) return false;
      if (filters.legalEntity && p.legal_entity_name !== filters.legalEntity) return false;
      if (filters.department && p.department_name !== filters.department) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (amtFrom !== null && p.amount < amtFrom) return false;
      if (amtTo !== null && p.amount > amtTo) return false;

      const pDate = p.payment_date || p.planned_date || '';
      if (dFrom && pDate && pDate.slice(0, 10) < dFrom) return false;
      if (dTo && pDate && pDate.slice(0, 10) > dTo) return false;

      return true;
    });
  }, [payments, filters]);

  const activeCount = useMemo(() => {
    let n = 0;
    if (filters.category) n++;
    if (filters.service) n++;
    if (filters.contractor) n++;
    if (filters.legalEntity) n++;
    if (filters.department) n++;
    if (filters.status) n++;
    if (filters.amountFrom) n++;
    if (filters.amountTo) n++;
    if (filters.dateFrom) n++;
    if (filters.dateTo) n++;
    return n;
  }, [filters]);

  return {
    filters, setFilter, clearFilters,
    showFilters, setShowFilters,
    filteredPayments, options,
    activeCount,
    totalCount: payments.length,
  };
};

export default usePaymentsFilter;
