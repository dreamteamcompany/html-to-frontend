import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { dashboardTypography } from '../dashboardStyles';
import { usePeriod } from '@/contexts/PeriodContext';

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
  current: number;
  previous: number;
  diff: number;
  percent: number;
}

const IndexationCard = () => {
  const { getDateRange, period } = usePeriod();
  const [indexationAmount, setIndexationAmount] = useState(0);
  const [indexationPercent, setIndexationPercent] = useState(0);
  const [serviceDetails, setServiceDetails] = useState<ServiceIndexation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndexationData = async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`${API_ENDPOINTS.main}?endpoint=payments`);
        const data = await response.json();

        const approvedPayments = (Array.isArray(data) ? data : []).filter((p: PaymentRecord) =>
          p.status === 'approved' || p.status === 'paid'
        );

        const { from, to } = getDateRange();
        const periodMs = to.getTime() - from.getTime();

        const prevTo = new Date(from.getTime() - 1);
        const prevFrom = new Date(prevTo.getTime() - periodMs);

        const currentPayments = approvedPayments.filter((p: PaymentRecord) => {
          const d = new Date(p.payment_date);
          return d >= from && d <= to;
        });

        const previousPayments = approvedPayments.filter((p: PaymentRecord) => {
          const d = new Date(p.payment_date);
          return d >= prevFrom && d <= prevTo;
        });

        const currentByService: { [key: string]: { amount: number; name: string } } = {};
        currentPayments.forEach((p: PaymentRecord) => {
          const serviceKey = p.service_id ? `service_${p.service_id}` : 'no_service';
          const serviceName = p.service_name || (p.service_id ? `Сервис ${p.service_id}` : 'Без сервиса');
          if (!currentByService[serviceKey]) {
            currentByService[serviceKey] = { amount: 0, name: serviceName };
          }
          currentByService[serviceKey].amount += p.amount;
        });

        const previousByService: { [key: string]: { amount: number; name: string } } = {};
        previousPayments.forEach((p: PaymentRecord) => {
          const serviceKey = p.service_id ? `service_${p.service_id}` : 'no_service';
          const serviceName = p.service_name || (p.service_id ? `Сервис ${p.service_id}` : 'Без сервиса');
          if (!previousByService[serviceKey]) {
            previousByService[serviceKey] = { amount: 0, name: serviceName };
          }
          previousByService[serviceKey].amount += p.amount;
        });

        let totalIndexation = 0;
        const details: ServiceIndexation[] = [];

        const allServiceKeys = new Set([
          ...Object.keys(currentByService),
          ...Object.keys(previousByService),
        ]);

        allServiceKeys.forEach((serviceKey) => {
          const current = currentByService[serviceKey]?.amount || 0;
          const previous = previousByService[serviceKey]?.amount || 0;
          const name = currentByService[serviceKey]?.name || previousByService[serviceKey]?.name || serviceKey;

          if (previous > 0 && current > 0) {
            const diff = current - previous;
            const percent = parseFloat(((diff / previous) * 100).toFixed(1));
            totalIndexation += diff;
            details.push({ serviceKey, serviceName: name, current, previous, diff, percent });
          }
        });

        details.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

        const currentTotal = Object.values(currentByService).reduce((sum, v) => sum + v.amount, 0);
        const previousTotal = Object.values(previousByService).reduce((sum, v) => sum + v.amount, 0);

        const percentChange = previousTotal > 0
          ? ((currentTotal - previousTotal) / previousTotal) * 100
          : 0;

        setIndexationAmount(Math.abs(totalIndexation));
        setIndexationPercent(parseFloat(percentChange.toFixed(1)));
        setServiceDetails(details);
      } catch (error) {
        console.error('Failed to fetch indexation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndexationData();
  }, [period, getDateRange]);

  return (
    <Card className="h-full" style={{ background: '#111c44', border: '1px solid rgba(255, 181, 71, 0.4)', borderTop: '4px solid #ffb547', boxShadow: '0 0 30px rgba(255, 181, 71, 0.2), inset 0 0 15px rgba(255, 181, 71, 0.05)' }}>
      <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4 sm:mb-5">
          <div>
            <div className={`${dashboardTypography.cardTitle} text-white mb-2`}>Индексация</div>
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
            <div className={`${dashboardTypography.cardValue} text-white mb-1`}>
              {new Intl.NumberFormat('ru-RU').format(indexationAmount)} ₽
            </div>
            <div className={`${dashboardTypography.cardSecondary} mb-2`}>за выбранный период</div>
            <div className={`flex items-center ${dashboardTypography.cardBadge} gap-1.5 mb-4`} style={{ color: indexationPercent >= 0 ? '#01b574' : '#ff6b6b' }}>
              <Icon name={indexationPercent >= 0 ? "ArrowUp" : "ArrowDown"} size={14} />
              {indexationPercent >= 0 ? '+' : ''}{indexationPercent}% к предыдущему периоду
            </div>

            {serviceDetails.length > 0 && (
              <div className="border-t border-white/10 pt-3 space-y-2">
                <div className="text-xs font-semibold text-[#a3aed0] uppercase tracking-wide mb-2">Расшифровка по сервисам</div>
                {serviceDetails.slice(0, 5).map((item) => (
                  <div key={item.serviceKey} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: item.diff >= 0 ? '#01b574' : '#ff6b6b' }}
                      />
                      <span className="text-xs text-[#a3aed0] truncate">{item.serviceName}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold" style={{ color: item.diff >= 0 ? '#01b574' : '#ff6b6b' }}>
                        {item.diff >= 0 ? '+' : ''}{new Intl.NumberFormat('ru-RU').format(Math.round(item.diff))} ₽
                      </span>
                      <span className="text-xs" style={{ color: item.percent >= 0 ? '#01b574' : '#ff6b6b' }}>
                        ({item.percent >= 0 ? '+' : ''}{item.percent}%)
                      </span>
                    </div>
                  </div>
                ))}
                {serviceDetails.length > 5 && (
                  <div className="text-xs text-[#a3aed0] text-center pt-1">
                    +{serviceDetails.length - 5} сервисов
                  </div>
                )}
              </div>
            )}

            {serviceDetails.length === 0 && !loading && (
              <div className="border-t border-white/10 pt-3">
                <div className="text-xs text-[#a3aed0] text-center">Нет данных для сравнения с предыдущим периодом</div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IndexationCard;
