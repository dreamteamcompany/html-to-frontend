export interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  [key: string]: unknown;
}

export const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
export const MONTHS_SHORT = ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'];
export const WEEK_DAYS_RU = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

export const fmtWeekLabel = (d: Date) => `${WEEK_DAYS_RU[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}`;

// Формирует уникальный ключ YYYY-MM-DD для однозначной идентификации дня
export const fmtDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export type UnitType = 'hour' | 'week_day' | 'month_day' | 'custom_day' | 'month';

export interface ChartConfig {
  labels: string[];
  keys: string[];
  unit: UnitType;
}
