import type { PaymentRecord } from '@/contexts/PaymentsCacheContext';

export interface DrillDownFilter {
  type: 'category' | 'contractor' | 'department' | 'legal_entity' | 'payment_type' | 'date' | 'service' | 'all';
  value: string;
  label: string;
}

export type SortField = 'payment_date' | 'amount';
export type SortDir = 'asc' | 'desc';

export type { PaymentRecord };

export const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: '#9ca3af' },
  pending_ib: { label: 'На согласовании (ИБ)', color: '#ffb547' },
  pending_cfo: { label: 'На согласовании (CFO)', color: '#ffb547' },
  pending_ceo: { label: 'На согласовании (CEO)', color: '#ffb547' },
  approved: { label: 'Согласован', color: '#00c951' },
  rejected: { label: 'Отклонён', color: '#ff4d6d' },
  revoked: { label: 'Отозван', color: '#9ca3af' },
};

export const PAYMENT_TYPE_LABEL: Record<string, string> = {
  cash: 'Наличный',
  bank_transfer: 'Безналичный',
  legal: 'Безналичный',
  card: 'Карта',
};

export const fmt = (v: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(v);

export const fmtDate = (s: string) => {
  const d = new Date(s.includes('T') ? s : s + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const resolvePaymentType = (payment_type?: string, legal_entity_name?: string): string => {
  if (payment_type === 'cash' || legal_entity_name === 'Наличные') return 'Наличный';
  if (payment_type && PAYMENT_TYPE_LABEL[payment_type]) return PAYMENT_TYPE_LABEL[payment_type];
  if (payment_type) return payment_type;
  return '—';
};
