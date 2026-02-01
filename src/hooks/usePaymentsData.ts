import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { getApiUrl, API_ENDPOINTS } from '@/config/api';

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  value: string;
}

interface Payment {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  description: string;
  amount: number;
  payment_date: string;
  legal_entity_id?: number;
  legal_entity_name?: string;
  status?: string;
  created_by?: number;
  created_by_name?: string;
  service_id?: number;
  service_name?: string;
  service_description?: string;
  contractor_name?: string;
  contractor_id?: number;
  department_name?: string;
  department_id?: number;
  invoice_number?: string;
  invoice_date?: string;
  created_at?: string;
  submitted_at?: string;
  custom_fields?: CustomField[];
}

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
  const [payments, setPayments] = useState<Payment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [customerDepartments, setCustomerDepartments] = useState<CustomerDepartment[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = () => {
    apiFetch(API_ENDPOINTS.payments)
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
  };

  const loadContractors = () => {
    return apiFetch(getApiUrl('contractors'))
      .then(res => res.json())
      .then(data => {
        setContractors(Array.isArray(data) ? data : []);
        return data;
      })
      .catch(err => {
        console.error('Failed to load contractors:', err);
        setContractors([]);
        return [];
      });
  };

  useEffect(() => {
    loadPayments();
    apiFetch(getApiUrl('categories'))
      .then(res => res.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => { console.error('Failed to load categories:', err); setCategories([]); });
    apiFetch(getApiUrl('legal-entities'))
      .then(res => res.json())
      .then(data => setLegalEntities(Array.isArray(data) ? data : []))
      .catch(err => { console.error('Failed to load legal entities:', err); setLegalEntities([]); });
    apiFetch(getApiUrl('contractors'))
      .then(res => res.json())
      .then(data => setContractors(Array.isArray(data) ? data : []))
      .catch(err => { console.error('Failed to load contractors:', err); setContractors([]); });
    apiFetch(getApiUrl('customer_departments'))
      .then(res => res.json())
      .then(data => setCustomerDepartments(Array.isArray(data) ? data : []))
      .catch(err => { console.error('Failed to load customer departments:', err); setCustomerDepartments([]); });
    apiFetch(getApiUrl('services'))
      .then(res => res.json())
      .then(data => setServices(data.services || []))
      .catch(err => { console.error('Failed to load services:', err); setServices([]); });
    apiFetch(getApiUrl('custom-fields'))
      .then(res => res.json())
      .then((fields) => {
        setCustomFields(Array.isArray(fields) ? fields : []);
      })
      .catch(err => { console.error('Failed to load custom fields:', err); setCustomFields([]); });
  }, []);

  return {
    payments,
    categories,
    legalEntities,
    contractors,
    customerDepartments,
    customFields,
    services,
    loading,
    loadPayments,
    loadContractors,
  };
};