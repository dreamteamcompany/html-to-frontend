export interface Saving {
  id: number;
  service_id: number;
  service_name: string;
  description: string;
  amount: number;
  frequency: string;
  currency: string;
  department_id: number;
  department_name: string;
  saving_reason_id?: number;
  saving_reason_name?: string;
  created_at: string;
}

export interface Service {
  id: number;
  name: string;
}

export interface Department {
  id: number;
  name: string;
}

export interface SavingReason {
  id: number;
  name: string;
  icon: string;
}

export interface SavingFormData {
  service_id: string;
  description: string;
  amount: string;
  frequency: string;
  currency: string;
  department_id: string;
  saving_reason_id: string;
}
