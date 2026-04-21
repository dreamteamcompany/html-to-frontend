export interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  category_name?: string;
  [key: string]: unknown;
}

export const LINE_COLORS = [
  { line: 'rgba(117, 81, 233, 1)', fill: 'rgba(117, 81, 233, 0.12)' },
  { line: 'rgba(57, 101, 255, 1)', fill: 'rgba(57, 101, 255, 0.10)' },
  { line: 'rgba(1, 181, 116, 1)', fill: 'rgba(1, 181, 116, 0.10)' },
  { line: 'rgba(255, 181, 71, 1)', fill: 'rgba(255, 181, 71, 0.10)' },
  { line: 'rgba(255, 107, 107, 1)', fill: 'rgba(255, 107, 107, 0.10)' },
];

export const MONTHS_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
export const WEEK_DAYS_RU = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

export const fmt = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₽`;
  if (v >= 1_000) return `${Math.round(v / 1_000)} тыс ₽`;
  return new Intl.NumberFormat('ru-RU').format(v) + ' ₽';
};

export interface CategoryItem {
  name: string;
  amount: number;
}

export interface TimelineLabel {
  text: string;
  key: string;
}
