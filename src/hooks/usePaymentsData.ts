import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { Payment, CustomField } from '@/types/payment';
import { useDictionaryContext } from '@/contexts/DictionaryContext';

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
  category_name?: string;
  category_icon?: string;
}

export const usePaymentsData = () => {
  const dictionary = useDictionaryContext();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(() => {
    setLoading(true);
    apiFetch(API_ENDPOINTS.paymentsApi)
      .then(res => res.json())
      .then(data => {
        setPayments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load payments:', err);
        setPayments([]);
        setLoading(false);
      });
  }, []);

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

  return {
    payments,
    categories: dictionary.categories,
    legalEntities: dictionary.legalEntities,
    contractors: dictionary.contractors,
    customerDepartments: dictionary.departments,
    customFields: dictionary.customFields,
    services: dictionary.services,
    loading: loading || dictionary.loading.categories || dictionary.loading.services,
    loadPayments,
    loadContractors,
    loadLegalEntities,
  };
};