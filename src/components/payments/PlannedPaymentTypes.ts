export interface PlannedPayment {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  description: string;
  amount: number;
  planned_date: string;
  legal_entity_id?: number;
  legal_entity_name?: string;
  contractor_id?: number;
  contractor_name?: string;
  department_id?: number;
  department_name?: string;
  service_id?: number;
  service_name?: string;
  invoice_number?: string;
  invoice_date?: string;
  recurrence_type?: string;
  recurrence_end_date?: string;
  converted_to_payment_id?: number;
  converted_at?: string;
  is_active?: boolean;
}

export interface Category { id: number; name: string; icon: string; }
export interface LegalEntity { id: number; name: string; }
export interface Contractor { id: number; name: string; }
export interface Department { id: number; name: string; }
export interface Service { id: number; name: string; }

export interface LinkedPlannedPaymentModalProps {
  plannedPaymentId: number | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

export const recurrenceLabel: Record<string, string> = {
  once: 'Однократно', daily: 'Ежедневно',
  weekly: 'Еженедельно', monthly: 'Ежемесячно', yearly: 'Ежегодно',
};

export const fmt = (amount: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);

export const fmtDate = (d?: string) =>
  d ? new Date(d.includes('T') ? d : d + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
