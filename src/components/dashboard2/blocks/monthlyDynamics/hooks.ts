import { useMemo } from 'react';
import { parsePaymentDate } from '../../dashboardUtils';
import { PaymentRecord, UnitType } from './types';
import { getChartConfig, buildData } from './chartConfig';
import { useResponsiveState as useSharedResponsiveState } from '@/hooks/useResponsiveState';

export const useResponsiveState = () => useSharedResponsiveState(640);

interface DynamicsDataResult {
  chartData: number[];
  labels: string[];
  chartUnit: UnitType;
  chartKeys: string[];
}

export const useDynamicsData = (
  allPayments: unknown,
  getDateRange: () => { from: Date; to: Date },
  period: string,
  dateFrom: string,
  dateTo: string,
): DynamicsDataResult => {
  return useMemo(() => {
    const { from, to } = getDateRange();
    const { labels: newLabels, keys: newKeys, unit } = getChartConfig(period, from, to);

    const filtered = (Array.isArray(allPayments) ? allPayments : []).filter((p: PaymentRecord) => {
      if (p.status !== 'approved') return false;
      const d = parsePaymentDate(p.payment_date);
      return !isNaN(d.getTime()) && d >= from && d <= to;
    });

    const values = buildData(filtered, newKeys, unit);
    return { chartData: values, labels: newLabels, chartUnit: unit, chartKeys: newKeys };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPayments, period, dateFrom, dateTo]);
};