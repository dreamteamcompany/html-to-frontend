import { PaymentRecord } from '@/contexts/PaymentsCacheContext';

// ─── Константы ────────────────────────────────────────────────────────────────

export const PERIOD_LABEL: Record<string, string> = {
  today: 'Сегодня',
  week:  'Текущая неделя',
  month: 'Текущий месяц',
  year:  'Текущий год',
  custom:'Выбранный период',
};

export const MONTHS      = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
export const MONTHS_FULL = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
export const WEEKDAYS    = ['вс','пн','вт','ср','чт','пт','сб'];

// ─── Утилиты ──────────────────────────────────────────────────────────────────

export const toDateStr = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const parseDateKey = (dateKey: string): Date =>
  new Date(dateKey + 'T00:00:00');

export const formatAmount = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '— ₽';
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(num) + ' ₽';
};

// ─── Типы ─────────────────────────────────────────────────────────────────────

export interface DayGroup {
  dateKey:    string;
  label:      string;
  sublabel:   string;
  fullLabel:  string;
  payments:   PaymentRecord[];
  total:      number;
  isToday:    boolean;
  isTomorrow: boolean;
}

// ─── Группировка ──────────────────────────────────────────────────────────────

export const groupByDay = (payments: PaymentRecord[], dateFromStr: string, dateToStr: string): DayGroup[] => {
  const map = new Map<string, PaymentRecord[]>();

  for (const p of payments) {
    const dateKey = String(p.payment_date).slice(0, 10);
    if (dateKey < dateFromStr || dateKey > dateToStr) continue;
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push(p);
  }

  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);

  const groups: DayGroup[] = [];

  for (const [dateKey, items] of map.entries()) {
    const date       = parseDateKey(dateKey);
    const isToday    = date.getTime() === today.getTime();
    const isTomorrow = date.getTime() === tomorrow.getTime();

    const d  = date.getDate();
    const mo = date.getMonth();
    const wd = date.getDay();

    let label    = '';
    let sublabel = '';
    let fullLabel= '';

    if (isToday) {
      label     = 'Сегодня';
      sublabel  = `${d} ${MONTHS[mo]}`;
      fullLabel = `Сегодня, ${d} ${MONTHS_FULL[mo]}`;
    } else if (isTomorrow) {
      label     = 'Завтра';
      sublabel  = `${d} ${MONTHS[mo]}`;
      fullLabel = `Завтра, ${d} ${MONTHS_FULL[mo]}`;
    } else {
      label     = `${d} ${MONTHS[mo]}`;
      sublabel  = WEEKDAYS[wd];
      fullLabel = `${d} ${MONTHS_FULL[mo]}, ${WEEKDAYS[wd]}`;
    }

    const total = items.reduce((s, p) => s + (parseFloat(String(p.amount)) || 0), 0);
    groups.push({ dateKey, label, sublabel, fullLabel, payments: items, total, isToday, isTomorrow });
  }

  return groups.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
};
