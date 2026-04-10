import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useMemo, useState } from 'react';
import { dashboardTypography } from '../dashboardStyles';
import { usePeriod } from '@/contexts/PeriodContext';
import { usePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { parsePaymentDate, getPreviousPeriodRange } from '../dashboardUtils';
import IndexationDrillModal from '../IndexationDrillModal';

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

const IndexationCard = () => {
  const { getDateRange, period, dateFrom, dateTo } = usePeriod();
  const { payments: allPayments, loading } = usePaymentsCache();
  const [drillOpen, setDrillOpen] = useState(false);

  const indexationData = useMemo(() => {
    const { from, to } = getDateRange();

    const approvedPayments = (Array.isArray(allPayments) ? allPayments : []).filter(
      (p: PaymentRecord) => p.status === 'approved'
    );

    const { prevFrom, prevTo } = getPreviousPeriodRange(period, from, to);

    const currentPayments = approvedPayments.filter((p: PaymentRecord) => {
      const d = parsePaymentDate(p.payment_date);
      return !isNaN(d.getTime()) && d >= from && d <= to;
    });

    const previousPayments = approvedPayments.filter((p: PaymentRecord) => {
      const d = parsePaymentDate(p.payment_date);
      return !isNaN(d.getTime()) && d >= prevFrom && d <= prevTo;
    });

    const currentTotal = currentPayments.reduce((sum, p) => sum + p.amount, 0);
    const previousTotal = previousPayments.reduce((sum, p) => sum + p.amount, 0);

    const hasPreviousData = previousPayments.length > 0 && previousTotal > 0;
    const hasCurrentData = currentPayments.length > 0;

    // Индексация = ((текущий - прошлый) / прошлый) * 100%
    const overallPercent: number | null = hasPreviousData
      ? parseFloat((((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1))
      : null;

    // Детализация по сервисам — все сервисы из обоих периодов
    const buildServiceMap = (payments: PaymentRecord[]) => {
      const map: { [key: string]: { totalAmount: number; name: string } } = {};
      payments.forEach((p) => {
        const key = p.service_id ? `svc_${p.service_id}` : `no_service`;
        const name = p.service_name || (p.service_id ? `Сервис ${p.service_id}` : 'Без сервиса');
        if (!map[key]) map[key] = { totalAmount: 0, name };
        map[key].totalAmount += p.amount;
      });
      return map;
    };

    const currentMap = buildServiceMap(currentPayments);
    const previousMap = buildServiceMap(previousPayments);

    // Объединяем все ключи из обоих периодов (union), как в модалке детализации
    const allKeys = Array.from(new Set([...Object.keys(currentMap), ...Object.keys(previousMap)]));

    const details: ServiceIndexation[] = allKeys
      .map((key) => {
        const curTotal = currentMap[key]?.totalAmount ?? 0;
        const prevTotal = previousMap[key]?.totalAmount ?? 0;
        const name = (currentMap[key] || previousMap[key]).name;
        const percent = prevTotal > 0
          ? parseFloat((((curTotal - prevTotal) / prevTotal) * 100).toFixed(1))
          : 0;
        return {
          serviceKey: key,
          serviceName: name,
          currentTotal: curTotal,
          previousTotal: prevTotal,
          percent,
        };
      })
      .filter((item) => item.currentTotal > 0 || item.previousTotal > 0)
      .sort((a, b) => Math.abs(b.percent) - Math.abs(a.percent));

    return {
      overallPercent,
      serviceDetails: details,
      hasPreviousData,
      hasCurrentData,
      currentTotal,
      previousTotal,
    };
  }, [allPayments, period, dateFrom, dateTo]);

  const { overallPercent, serviceDetails, hasPreviousData, hasCurrentData } = indexationData;

  const percentColor =
    overallPercent === null
      ? 'hsl(var(--muted-foreground))'
      : overallPercent > 0
      ? '#ff6b6b'
      : overallPercent < 0
      ? '#01b574'
      : 'hsl(var(--foreground))';

  return (
    <>
      <Card
        className="h-full"
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid rgba(255, 181, 71, 0.4)',
          borderTop: '4px solid #ffb547',
          cursor: loading ? 'default' : 'pointer',
        }}
        onClick={() => !loading && setDrillOpen(true)}
      >
        <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4 sm:mb-5">
            <div>
              <div className={`${dashboardTypography.cardTitle} mb-2`}>Индексация</div>
              <div className={dashboardTypography.cardSubtitle}>Изменение расходов к предыдущему периоду</div>
            </div>
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(255, 181, 71, 0.1)', color: '#ffb547', border: '1px solid rgba(255, 181, 71, 0.2)' }}
            >
              <Icon name="TrendingUp" size={18} className="sm:w-5 sm:h-5" />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center" style={{ height: '60px' }}>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (
            <>
              {/* Главное значение */}
              <div
                className={`${dashboardTypography.cardValue} mb-1`}
                style={{ color: percentColor }}
              >
                {overallPercent === null
                  ? hasCurrentData ? 'Нет базы' : '—'
                  : `${overallPercent > 0 ? '+' : ''}${overallPercent}%`}
              </div>

              <div className={`${dashboardTypography.cardSecondary} mb-2`}>
                {overallPercent === null ? 'нет данных за прошлый период' : 'к предыдущему периоду'}
              </div>

              {/* Бейдж с трендом */}
              {hasPreviousData && overallPercent !== null ? (
                <div
                  className={`flex items-center ${dashboardTypography.cardBadge} gap-1.5 mb-4`}
                  style={{ color: percentColor }}
                >
                  <Icon name={overallPercent > 0 ? 'ArrowUp' : overallPercent < 0 ? 'ArrowDown' : 'Minus'} size={14} />
                  {overallPercent > 0 ? '+' : ''}{overallPercent}% к предыдущему периоду
                </div>
              ) : (
                <div
                  className={`flex items-center ${dashboardTypography.cardBadge} gap-1.5 mb-4`}
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  <Icon name="Info" size={14} />
                  Нет данных за прошлый период для сравнения
                </div>
              )}

              {/* Детализация по сервисам */}
              {serviceDetails.length > 0 && (
                <div className="border-t border-border pt-3 space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Расшифровка по сервисам
                  </div>
                  {serviceDetails.slice(0, 5).map((item) => (
                    <div key={item.serviceKey} className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5 min-w-0 flex-1">
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                          style={{ background: item.percent > 0 ? '#ff6b6b' : item.percent < 0 ? '#01b574' : 'hsl(var(--muted-foreground))' }}
                        />
                        <span className="text-xs text-muted-foreground break-anywhere">{item.serviceName}</span>
                      </div>
                      <span
                        className="text-xs font-semibold flex-shrink-0"
                        style={{ color: item.percent > 0 ? '#ff6b6b' : item.percent < 0 ? '#01b574' : 'hsl(var(--muted-foreground))' }}
                      >
                        {item.percent > 0 ? '+' : ''}{item.percent}%
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

              {/* Сообщение при полном отсутствии данных */}
              {!hasPreviousData && serviceDetails.length === 0 && (
                <div className="border-t border-border pt-3">
                  <div className="text-xs text-muted-foreground text-center">
                    Нет данных за прошлый период для сравнения
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <IndexationDrillModal open={drillOpen} onClose={() => setDrillOpen(false)} />
    </>
  );
};

export default IndexationCard;