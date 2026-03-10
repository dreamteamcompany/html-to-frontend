export interface CustomField {
  id: number;
  name: string;
  field_type: string;
  value?: string;
  options?: string;
}

export interface PaymentDocument {
  id: number;
  payment_id: number;
  file_name: string;
  file_url: string;
  document_type: string;
  uploaded_at: string;
}

export interface Payment {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  description: string;
  amount: number;
  payment_date?: string;
  planned_date?: string;
  legal_entity_id?: number;
  legal_entity_name?: string;
  status?: string;
  created_by?: number;
  created_by_name?: string;
  service_id?: number;
  service_name?: string;
  contractor_name?: string;
  contractor_id?: number;
  department_name?: string;
  department_id?: number;
  invoice_number?: string;
  invoice_date?: string;
  invoice_file_url?: string;
  invoice_file_uploaded_at?: string;
  created_at?: string;
  submitted_at?: string;
  is_planned?: boolean;
  rejection_comment?: string;
  rejected_at?: string;
  custom_fields?: CustomField[];
  documents?: PaymentDocument[];
  [key: string]: string | number | boolean | undefined | CustomField[] | PaymentDocument[] | null;
}