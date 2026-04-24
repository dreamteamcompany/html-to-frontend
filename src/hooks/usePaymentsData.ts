import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { Payment } from '@/types/payment';
import { useDictionaryContext } from '@/contexts/DictionaryContext';
import { useAuth } from '@/contexts/AuthContext';

// Module-level cache for personal payments (draft/my)
// Раздельный кэш по scope, чтобы данные ролей не пересекались
const paymentsCacheByScope: Record<string, { data: Payment[] | null; time: number }> = {
  my: { data: null, time: 0 },
  all: { data: null, time: 0 },
};
const MY_CACHE_TTL = 30_000;

export const invalidateMyPaymentsCache = () => {
  paymentsCacheByScope.my = { data: null, time: 0 };
  paymentsCacheByScope.all = { data: null, time: 0 };
};

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface LegalEntity {
  id: number;
  name: string;
  inn: string;
  kpp: string;
  address: string;
}

interface Contractor {
  id: number;
  name: string;
  inn: string;
}

interface CustomerDepartment {
  id: number;
  name: string;
  description: string;
}

interface CustomFieldDefinition {
  id: number;
  name: string;
  field_type: string;
  options: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  intermediate_approver_id: number;
  final_approver_id: number;
  category_id?: number;
  customer_department_id?: number;
  legal_entity_id?: number;
  contractor_id?: number;
  category_name?: string;
  category_icon?: string;
  legal_entity_name?: string;
  contractor_name?: string;
  department_name?: string;
}

export const usePaymentsData = () => {
  const dictionary = useDictionaryContext();
  const { user } = useAuth();

  // Админы и Финансисты видят все черновики (scope=all),
  // остальные пользователи — только свои (scope=my).
  const scope = useMemo<'my' | 'all'>(() => {
    const roles = user?.roles ?? [];
    const isAdmin = roles.some(r => r.name === 'Администратор' || r.name === 'Admin');
    const isFinancier = roles.some(r => r.name === 'Финансист' || r.name === 'Financier');
    return isAdmin || isFinancier ? 'all' : 'my';
  }, [user]);

  const cache = paymentsCacheByScope[scope];
  const [payments, setPayments] = useState<Payment[]>(cache.data ?? []);
  const [loading, setLoading] = useState(!cache.data);

  const loadPayments = useCallback((force = false) => {
    const bucket = paymentsCacheByScope[scope];
    const now = Date.now();
    if (!force && bucket.data && now - bucket.time < MY_CACHE_TTL) {
      setPayments(bucket.data);
      setLoading(false);
      return;
    }
    setLoading(true);
    const url = scope === 'all'
      ? `${API_ENDPOINTS.paymentsApi}?scope=all`
      : API_ENDPOINTS.paymentsApi;
    apiFetch(url)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        list.sort((a, b) => new Date(b.payment_date || 0).getTime() - new Date(a.payment_date || 0).getTime());
        paymentsCacheByScope[scope] = { data: list, time: Date.now() };
        setPayments(list);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load payments:', err);
        setPayments([]);
        setLoading(false);
      });
  }, [scope]);

  const loadContractors = useCallback(async () => {
    await dictionary.refresh('contractors');
    return dictionary.contractors;
  }, [dictionary]);

  const loadLegalEntities = useCallback(async () => {
    await dictionary.refresh('legalEntities');
    return dictionary.legalEntities;
  }, [dictionary]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const forceLoadPayments = useCallback(() => {
    paymentsCacheByScope[scope] = { data: null, time: 0 };
    loadPayments(true);
  }, [loadPayments, scope]);

  return {
    payments,
    categories: dictionary.categories,
    legalEntities: dictionary.legalEntities,
    contractors: dictionary.contractors,
    customerDepartments: dictionary.departments,
    customFields: dictionary.customFields,
    services: dictionary.services,
    loading: loading || dictionary.loading.categories || dictionary.loading.services,
    loadPayments: forceLoadPayments,
    loadContractors,
    loadLegalEntities,
  };
};