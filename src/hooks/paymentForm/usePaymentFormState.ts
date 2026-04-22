import { useState, useEffect, useCallback } from 'react';

export interface CustomFieldDefinition {
  id: number;
  name: string;
  field_type: string;
  options: string;
}

const BASE_FIELDS: Record<string, string | undefined> = {
  category_id: '',
  description: '',
  amount: '',
  legal_entity_id: '',
  contractor_id: '',
  department_id: '',
  service_id: '',
  invoice_number: '',
  invoice_date: '',
  invoice_file_url: '',
};

const buildInitialData = (customFields: CustomFieldDefinition[]): Record<string, string | undefined> => {
  const data: Record<string, string | undefined> = { ...BASE_FIELDS };
  customFields.forEach((field) => {
    data[`custom_field_${field.id}`] = '';
  });
  return data;
};

export const usePaymentFormState = (customFields: CustomFieldDefinition[]) => {
  const [formData, setFormData] = useState<Record<string, string | undefined>>(() => buildInitialData(customFields));

  useEffect(() => {
    setFormData(buildInitialData(customFields));
  }, [customFields]);

  const resetForm = useCallback(() => {
    setFormData(buildInitialData(customFields));
  }, [customFields]);

  return { formData, setFormData, resetForm };
};
