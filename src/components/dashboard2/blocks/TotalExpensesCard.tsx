import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { dashboardTypography } from '../dashboardStyles';
import { usePeriod } from '@/contexts/PeriodContext';

interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  [key: string]: unknown;
}

const TotalExpensesCard = () => {
  const { token } = useAuth();
  const { getDateRange } = usePeriod();
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [changePercent, setChangePercent] = useState(0);
  const [isIncrease, setIsIncrease] = useState(false);
  const [loading, setLoading] = useState(true);

  const { period } = usePeriod();

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const response = await fetch(
          `${API_ENDPOINTS.main}?endpoint=payments`,
          { headers: { 'X-Auth-Token': token } }
        );
        const data = await response.json();
        const payments: PaymentRecord[] = (Array.isArray(data) ? data : []).filter(
          (p: PaymentRecord) => p.status === 'approved' || p.status === 'paid'
        );

        const { from, to } = getDateRange();
        const periodMs = to.getTime() - from.getTime();

        const current = payments.filter((p) => {
          const d = new Date(p.payment_date);
          return d >= from && d <= to;
        });

        const prevTo = new Date(from.getTime() - 1);
        const prevFrom = new Date(prevTo.getTime() - periodMs);
        const previous = payments.filter((p) => {
          const d = new Date(p.payment_date);
          return d >= prevFrom && d <= prevTo;
        });

        const currentTotal = current.reduce((sum, p) => sum + p.amount, 0);
        const previousTotal = previous.reduce((sum, p) => sum + p.amount, 0);

        const diff = previousTotal > 0
          ? parseFloat((((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1))
          : 0;

        setTotal(currentTotal);
        setCount(current.length);
        setChangePercent(Math.abs(diff));
        setIsIncrease(diff > 0);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, period]);

  const formatAmount = (amount: number) =>
    amount.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ₽';

  return (
    <Card className="h-full" style={{ background: '#111c44', border: '1px solid rgba(117, 81, 233, 0.4)', borderTop: '4px solid #7551e9', boxShadow: '0 0 30px rgba(117, 81, 233, 0.2), inset 0 0 15px rgba(117, 81, 233, 0.05)' }}>
      <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4 sm:mb-5">
          <div>
            <div className={`${dashboardTypography.cardTitle} text-white mb-2`}>Общие IT Расходы</div>
            <div className={dashboardTypography.cardSubtitle}>
              {loading ? 'Загрузка...' : `${count} платежей`}
            </div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(117, 81, 233, 0.1)', color: '#7551e9', border: '1px solid rgba(117, 81, 233, 0.2)' }}>
            <Icon name="Server" size={18} className="sm:w-5 sm:h-5" />
          </div>
        </div>
        <div className={`${dashboardTypography.cardValue} text-white mb-2`}>
          {loading ? '...' : formatAmount(total)}
        </div>
        <div className={`${dashboardTypography.cardSecondary} mb-3`}>Общая сумма расходов</div>
        {!loading && (
          <div className={`flex items-center ${dashboardTypography.cardBadge} gap-1.5`} style={{ color: isIncrease ? '#e31a1a' : '#01b574' }}>
            <Icon name={isIncrease ? "ArrowUp" : "ArrowDown"} size={14} />
            {isIncrease ? '+' : '-'}{changePercent}% к предыдущему периоду
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TotalExpensesCard;
