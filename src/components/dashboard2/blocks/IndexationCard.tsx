import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useMemo } from 'react';
import { dashboardTypography } from '../dashboardStyles';
import { usePeriod } from '@/contexts/PeriodContext';
import { usePaymentsCache } from '@/contexts/PaymentsCacheContext';
import type { PeriodType } from '@/contexts/PeriodContext';

interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  service_id?: number;
  service_name?: string;
  [key: string]: unknown;
}

interface ServiceIndexation {
  serviceKey: string;
  serviceName: string;
  currentTotal: number;
  previousTotal: number;
  percent: number;
}

const parsePaymentDate = (raw: string): Date => {
  // Если дата без времени (YYYY-MM-DD), парсим как локальное время,
  // чтобы избежать сдвига UTC в браузерах
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return new Date(raw + 'T00:00:00');
  }
  return new Date(raw);
};

const getPreviousPeriodRange = (
  period: PeriodType,
  from: Date,
  to: Date,
  dateFrom?: Date,
  dateTo?: Date
): { prevFrom: Date; prevTo: Date } => {
  switch (period) {
    case 'today': {
      const prevDay = new Date(from);
      prevDay.setDate(prevDay.getDate() - 1);
      const prevFrom = new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate(), 0, 0, 0, 0);
      const prevTo = new Date(prevDay.getFullYear(), prevDay.getMonth(), prevDay.getDate(), 23, 59, 59, 999);
      return { prevFrom, prevTo };
    }
    case 'week': {
      const prevFrom = new Date(from);
      prevFrom.setDate(prevFrom.getDate() - 7);
      const prevTo = new Date(to);
      prevTo.setDate(prevTo.getDate() - 7);
      return { prevFrom, prevTo };
    }
    case 'month': {
      // Предыдущий календарный месяц
      const prevFrom = new Date(from.getFullYear(), from.getMonth() - 1, 1, 0, 0, 0, 0);
      const prevTo = new Date(from.getFullYear(), from.getMonth(), 0, 23, 59, 59, 999);
      return { prevFrom, prevTo };
    }
    case 'year': {
      const prevFrom = new Date(from.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      const prevTo = new Date(from.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      return { prevFrom, prevTo };
    }
    case 'custom': {
      // Для произвольного периода сдвигаем на такое же количество дней
      const periodMs = to.getTime() - from.getTime();
      const prevTo = new Date(from.getTime() - 1);
      const prevFrom = new Date(prevTo.getTime() - periodMs);
      return { prevFrom, prevTo };
    }
    default: {
      const periodMs = to.getTime() - from.getTime();
      const prevTo = new Date(from.getTime() - 1);
      const prevFrom = new Date(prevTo.getTime() - periodMs);
      return { prevFrom, prevTo };
    }
  }
};

const IndexationCard = () => {
  const { getDateRange, period, dateFrom, dateTo } = usePeriod();
  const { payments: allPayments, loading } = usePaymentsCache();

  const indexationData = useMemo(() => {
    const { from, to } = getDateRange();

    const approvedPayments = (Array.isArray(allPayments) ? allPayments : []).filter(
      (p: PaymentRecord) => p.status === 'approved'
    );

    const { prevFrom, prevTo } = getPreviousPeriodRange(period, from, to, dateFrom, dateTo);

    const currentPayments = approvedPayments.filter((p: PaymentRecord) => {
      const d = parsePaymentDate(String(p.payment_date));
      return d >= from && d <= to;
    });

    const previousPayments = approvedPayments.filter((p: PaymentRecord) => {
      const d = parsePaymentDate(String(p.payment_date));
      return d >= prevFrom && d <= prevTo;
    });

    // Суммарные расходы по периодам
    const currentTotal = currentPayments.reduce((sum, p) => sum + p.amount, 0);
    const previousTotal = previousPayments.reduce((sum, p) => sum + p.amount, 0);

    const hasPreviousData = previousPayments.length > 0;

    // Общий процент изменения суммарных расходов
    const overallPercent = hasPreviousData && previousTotal > 0
      ? parseFloat((((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1))
      : 0;

    // Детализация по сервисам: сравниваем суммарные расходы
    const buildServiceMap = (payments: PaymentRecord[]) => {
      const map: { [key: string]: { totalAmount: number; name: string } } = {};
      payments.forEach((p) => {
        const key = p.service_id ? `service_${p.service_id}` : `no_service`;
        const name = p.service_name || (p.service_id ? `Сервис ${p.service_id}` : 'Без сервиса');
        if (!map[key]) map[key] = { totalAmount: 0, name };
        map[key].totalAmount += p.amount;
      });
      return map;
    };

    const currentMap = buildServiceMap(currentPayments);
    const previousMap = buildServiceMap(previousPayments);

    const commonKeys = Object.keys(currentMap).filter((key) => key in previousMap);

    const details: ServiceIndexation[] = commonKeys.map((key) => {
      const cur = currentMap[key];
      const prev = previousMap[key];
      const percent = prev.totalAmount > 0
        ? parseFloat((((cur.totalAmount - prev.totalAmount) / prev.totalAmount) * 100).toFixed(1))
        : 0;
      return {
        serviceKey: key,
        serviceName: cur.name,
        currentTotal: cur.totalAmount,
        previousTotal: prev.totalAmount,
        percent,
      };
    });

    details.sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent));

    return { indexationPercent: overallPercent, serviceDetails: details, hasPreviousData, currentTotal, previousTotal };
  }, [allPayments, period, dateFrom, dateTo]);

  const { indexationPercent, serviceDetails, hasPreviousData } = indexationData;

  return (
    <Card className="h-full" style={{ background: 'hsl(var(--card))', border: '1px solid rgba(255, 181, 71, 0.4)', borderTop: '4px solid #ffb547' }}>
      <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4 sm:mb-5">
          <div>
            <div className={`${dashboardTypography.cardTitle} mb-2`}>Индексация</div>
            <div className={dashboardTypography.cardSubtitle}>Корректировка цен</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255, 181, 71, 0.1)', color: '#ffb547', border: '1px solid rgba(255, 181, 71, 0.2)' }}>
            <Icon name="TrendingUp" size={18} className="sm:w-5 sm:h-5" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center" style={{ height: '60px' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <div
              className={`${dashboardTypography.cardValue} mb-1`}
              style={{ color: !hasPreviousData ? undefined : indexationPercent > 0 ? '#01b574' : indexationPercent < 0 ? '#ff6b6b' : undefined }}
            >
              {hasPreviousData
                ? `${indexationPercent > 0 ? '+' : ''}${indexationPercent}%`
                : '—'}
            </div>
            <div className={`${dashboardTypography.cardSecondary} mb-2`}>за выбранный период</div>

            {hasPreviousData ? (
              <div
                className={`flex items-center ${dashboardTypography.cardBadge} gap-1.5 mb-4`}
                style={{ color: indexationPercent >= 0 ? '#01b574' : '#ff6b6b' }}
              >
                <Icon name={indexationPercent >= 0 ? 'ArrowUp' : 'ArrowDown'} size={14} />
                {indexationPercent >= 0 ? '+' : ''}{indexationPercent}% к предыдущему периоду
              </div>
            ) : (
              <div className={`flex items-center ${dashboardTypography.cardBadge} gap-1.5 mb-4`} style={{ color: 'hsl(var(--muted-foreground))' }}>
                +0% к предыдущему периоду
              </div>
            )}

            {serviceDetails.length > 0 && (
              <div className="border-t border-border pt-3 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Расшифровка по сервисам</div>
                {serviceDetails.slice(0, 5).map((item) => (
                  <div key={item.serviceKey} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: item.percent >= 0 ? '#01b574' : '#ff6b6b' }}
                      />
                      <span className="text-xs text-muted-foreground truncate">{item.serviceName}</span>
                    </div>
                    <span className="text-xs font-semibold flex-shrink-0" style={{ color: item.percent >= 0 ? '#01b574' : '#ff6b6b' }}>
                      {item.percent >= 0 ? '+' : ''}{item.percent}%
                    </span>
                  </div>
                ))}
                {serviceDetails.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center pt-1">
                    +{serviceDetails.length - 5} сервисов
                  </div>
                )}
              </div>
            )}

            {!hasPreviousData && (
              <div className="border-t border-border pt-3">
                <div className="text-xs text-muted-foreground text-center">Нет данных для сравнения с предыдущим периодом</div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IndexationCard;
