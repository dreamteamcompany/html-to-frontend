import { useState, useEffect, useMemo } from 'react';
import { parsePaymentDate } from '../../dashboardUtils';
import { PaymentRecord, MONTHS_SHORT, WEEK_DAYS_RU, CategoryItem, TimelineLabel } from './types';

export const useResponsiveState = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return { isMobile, isLight };
};

export const useCategoryData = (
  allPayments: unknown,
  getDateRange: () => { from: Date; to: Date },
  period: string,
  dateFrom: string,
  dateTo: string,
): CategoryItem[] => {
  return useMemo(() => {
    const { from, to } = getDateRange();
    const categoryMap: { [key: string]: number } = {};

    (Array.isArray(allPayments) ? allPayments : []).forEach((p: PaymentRecord) => {
      if (p.status !== 'approved') return;
      const d = parsePaymentDate(p.payment_date);
      if (isNaN(d.getTime()) || !(d >= from && d <= to)) return;
      const name = p.category_name || 'Без категории';
      categoryMap[name] = (categoryMap[name] || 0) + p.amount;
    });

    return Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPayments, period, dateFrom, dateTo]);
};

export const useTimelineData = (
  allPayments: unknown,
  getDateRange: () => { from: Date; to: Date },
  period: string,
  dateFrom: string,
  dateTo: string,
): { labels: TimelineLabel[]; activeDays: Set<string> } => {
  return useMemo(() => {
    const { from, to } = getDateRange();
    const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

    const activeDays = new Set<string>();
    (Array.isArray(allPayments) ? allPayments : []).forEach((p: PaymentRecord) => {
      if (p.status !== 'approved') return;
      const d = parsePaymentDate(p.payment_date);
      if (isNaN(d.getTime()) || !(d >= from && d <= to)) return;
      if (period === 'today' || (period === 'custom' && diffDays <= 1)) {
        activeDays.add(`${String(d.getHours()).padStart(2, '0')}:00`);
      } else if (period === 'year' || (period === 'custom' && diffDays > 31)) {
        activeDays.add(String(d.getMonth()));
      } else {
        activeDays.add(String(d.getDate()));
      }
    });

    let labels: TimelineLabel[] = [];

    if (period === 'today' || (period === 'custom' && diffDays <= 1)) {
      labels = Array.from({ length: 24 }, (_, i) => {
        const h = `${String(i).padStart(2, '0')}:00`;
        return { text: h, key: h };
      });
    } else if (period === 'week' || (period === 'custom' && diffDays <= 7)) {
      const cur = new Date(from);
      while (cur <= to) {
        labels.push({ text: `${WEEK_DAYS_RU[cur.getDay()]}, ${cur.getDate()}`, key: String(cur.getDate()) });
        cur.setDate(cur.getDate() + 1);
      }
    } else if (period === 'month' || (period === 'custom' && diffDays <= 31)) {
      const cur = new Date(from);
      while (cur <= to) {
        labels.push({ text: String(cur.getDate()), key: String(cur.getDate()) });
        cur.setDate(cur.getDate() + 1);
      }
    } else {
      labels = MONTHS_SHORT.map((m, i) => ({ text: m, key: String(i) }));
    }

    return { labels, activeDays };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPayments, period, dateFrom, dateTo]);
};
