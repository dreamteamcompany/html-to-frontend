export interface PaymentDocument {
  id: number;
  payment_id: number;
  file_name: string;
  file_url: string;
  document_type: string;
  uploaded_at: string;
}

export interface EditPaymentCustomField {
  id: number;
  name: string;
  field_type: string;
  value: string;
}

export interface EditPayment {
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
  service_id?: number;
  service_name?: string;
  contractor_id?: number;
  contractor_name?: string;
  department_id?: number;
  department_name?: string;
  invoice_number?: string;
  invoice_date?: string;
  invoice_file_url?: string;
  documents?: PaymentDocument[];
  custom_fields?: EditPaymentCustomField[];
}

export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface LegalEntity {
  id: number;
  name: string;
}

export interface Contractor {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  category_id?: number;
}

export interface CustomFieldDef {
  id: number;
  name: string;
  field_type: string;
  options: string;
}

export interface EditPaymentModalProps {
  payment: EditPayment | null;
  onClose: () => void;
  onSuccess: () => void;
}
