import { parsePaymentDate } from '../../dashboardUtils';
import {
  PaymentRecord,
  MONTHS,
  ChartConfig,
  UnitType,
  fmtDateKey,
  fmtWeekLabel,
} from './types';

export const getChartConfig = (period: string, from: Date, to: Date): ChartConfig => {
  if (period === 'today') {
    const datePrefix = fmtDateKey(from);
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    const keys = hours.map(h => `${datePrefix}T${h}`);
    return { labels: hours, keys, unit: 'hour' };
  }
  if (period === 'week') {
    const labels: string[] = [];
    const keys: string[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      labels.push(fmtWeekLabel(cur));
      keys.push(fmtDateKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return { labels, keys, unit: 'week_day' };
  }
  if (period === 'month') {
    const labels: string[] = [];
    const keys: string[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      labels.push(cur.getDate().toString());
      keys.push(fmtDateKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return { labels, keys, unit: 'month_day' };
  }
  if (period === 'year') {
    const keys = Array.from({ length: 12 }, (_, i) =>
      `${from.getFullYear()}-${String(i + 1).padStart(2, '0')}`
    );
    return { labels: MONTHS, keys, unit: 'month' };
  }
  const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) {
    const datePrefix = fmtDateKey(from);
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    const keys = hours.map(h => `${datePrefix}T${h}`);
    return { labels: hours, keys, unit: 'hour' };
  }
  if (diffDays <= 7) {
    const labels: string[] = [];
    const keys: string[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      labels.push(fmtWeekLabel(cur));
      keys.push(fmtDateKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return { labels, keys, unit: 'week_day' };
  }
  if (diffDays <= 31) {
    const labels: string[] = [];
    const keys: string[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      labels.push(cur.getDate().toString());
      keys.push(fmtDateKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return { labels, keys, unit: 'custom_day' };
  }
  // Для длинных custom-периодов — по месяцам
  const keys = Array.from({ length: 12 }, (_, i) =>
    `${from.getFullYear()}-${String(i + 1).padStart(2, '0')}`
  );
  return { labels: MONTHS, keys, unit: 'month' };
};

export const buildData = (payments: PaymentRecord[], keys: string[], unit: UnitType) => {
  const map: { [key: string]: number } = {};

  payments.forEach((p) => {
    const d = parsePaymentDate(p.payment_date);
    let key: string;

    if (unit === 'hour') {
      key = `${fmtDateKey(d)}T${String(d.getHours()).padStart(2, '0')}:00`;
    } else if (unit === 'month') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } else {
      key = fmtDateKey(d);
    }

    map[key] = (map[key] || 0) + p.amount;
  });

  return keys.map((key) => map[key] || 0);
};
