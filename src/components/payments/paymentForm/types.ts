export interface Category {
  id: number;
  name: string;
  icon: string;
}

export interface LegalEntity {
  id: number;
  name: string;
  inn: string;
  kpp: string;
  address: string;
}

export interface CustomField {
  id: number;
  name: string;
  field_type: string;
  options: string;
}

export interface Contractor {
  id: number;
  name: string;
  inn: string;
}

export interface CustomerDepartment {
  id: number;
  name: string;
  description: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  intermediate_approver_id: number;
  final_approver_id: number;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
  legal_entity_id?: number;
  contractor_id?: number;
  customer_department_id?: number;
}

export type FormDataValue = Record<string, string | undefined>;
