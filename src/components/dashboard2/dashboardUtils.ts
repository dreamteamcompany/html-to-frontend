import type { PeriodType } from '@/contexts/PeriodContext';

/**
 * Парсит дату платежа без сдвига UTC в браузерах.
 * Если строка в формате YYYY-MM-DD — добавляем локальное время T00:00:00.
 */
export const parsePaymentDate = (raw: string | null | undefined): Date => {
  if (!raw) return new Date(NaN);
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(raw + 'T00:00:00');
  }
  return new Date(raw);
};

/**
 * Возвращает диапазон предыдущего периода, соответствующий типу period.
 * - today  → вчерашний день целиком
 * - week   → та же неделя минус 7 дней
 * - month  → предыдущий календарный месяц
 * - year   → предыдущий календарный год
 * - custom → отрезок той же длины, сдвинутый назад
 */
export const getPreviousPeriodRange = (
  period: PeriodType,
  from: Date,
  to: Date,
): { prevFrom: Date; prevTo: Date } => {
  switch (period) {
    case 'today': {
      const prevDay = new Date(from);
      prevDay.setDate(prevDay.getDate() - 1);
      return {
        prevFrom: new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate(), 0, 0, 0, 0),
        prevTo: new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate(), 23, 59, 59, 999),
      };
    }
    case 'week': {
      const prevFrom = new Date(from);
      prevFrom.setDate(prevFrom.getDate() - 7);
      const prevTo = new Date(to);
      prevTo.setDate(prevTo.getDate() - 7);
      return { prevFrom, prevTo };
    }
    case 'month': {
      return {
        prevFrom: new Date(from.getFullYear(), from.getMonth() - 1, 1, 0, 0, 0, 0),
        prevTo: new Date(from.getFullYear(), from.getMonth(), 0, 23, 59, 59, 999),
      };
    }
    case 'year': {
      return {
        prevFrom: new Date(from.getFullYear() - 1, 0, 1, 0, 0, 0, 0),
        prevTo: new Date(from.getFullYear() - 1, 11, 31, 23, 59, 59, 999),
      };
    }
    case 'custom':
    default: {
      const periodMs = to.getTime() - from.getTime();
      const prevTo = new Date(from.getTime() - 1);
      const prevFrom = new Date(prevTo.getTime() - periodMs);
      return { prevFrom, prevTo };
    }
  }
};