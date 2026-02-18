import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { dashboardTypography } from '../dashboardStyles';

interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  service_id?: number;
  [key: string]: unknown;
}

const IndexationCard = () => {
  const [indexationAmount, setIndexationAmount] = useState(0);
  const [indexationPercent, setIndexationPercent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIndexationData = async () => {
      try {
        const response = await apiFetch(`${API_ENDPOINTS.main}?endpoint=payments`);
        const data = await response.json();
        
        const approvedPayments = (Array.isArray(data) ? data : []).filter((p: PaymentRecord) => 
          p.status === 'approved' || p.status === 'paid'
        );

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const currentMonthPayments = approvedPayments.filter((p: PaymentRecord) => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate >= currentMonthStart;
        });

        const previousMonthPayments = approvedPayments.filter((p: PaymentRecord) => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate >= previousMonthStart && paymentDate <= previousMonthEnd;
        });

        // Группируем платежи по сервисам для текущего месяца
        const currentByService: {[key: string]: number} = {};
        currentMonthPayments.forEach((p: PaymentRecord) => {
          const serviceKey = p.service_id ? `service_${p.service_id}` : 'no_service';
          currentByService[serviceKey] = (currentByService[serviceKey] || 0) + p.amount;
        });

        // Группируем платежи по сервисам для предыдущего месяца
        const previousByService: {[key: string]: number} = {};
        previousMonthPayments.forEach((p: PaymentRecord) => {
          const serviceKey = p.service_id ? `service_${p.service_id}` : 'no_service';
          previousByService[serviceKey] = (previousByService[serviceKey] || 0) + p.amount;
        });

        // Вычисляем индексацию только для сервисов, которые были в оба периода
        let totalIndexation = 0;
        let servicesWithIndexation = 0;

        Object.keys(currentByService).forEach((serviceKey) => {
          if (previousByService[serviceKey]) {
            const currentAmount = currentByService[serviceKey];
            const previousAmount = previousByService[serviceKey];
            const diff = currentAmount - previousAmount;
            totalIndexation += diff;
            servicesWithIndexation++;
          }
        });

        const currentTotal = Object.values(currentByService).reduce((sum, val) => sum + val, 0);
        const previousTotal = Object.values(previousByService).reduce((sum, val) => sum + val, 0);
        
        const percentChange = previousTotal > 0 
          ? ((currentTotal - previousTotal) / previousTotal) * 100 
          : 0;

        setIndexationAmount(Math.abs(totalIndexation));
        setIndexationPercent(parseFloat(percentChange.toFixed(1)));
      } catch (error) {
        console.error('Failed to fetch indexation data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndexationData();
  }, []);

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
            <div className={`${dashboardTypography.cardValue} text-white mb-2`}>
              {new Intl.NumberFormat('ru-RU').format(indexationAmount)} ₽
            </div>
            <div className={`${dashboardTypography.cardSecondary} mb-3`}>за текущий период</div>
            <div className={`flex items-center ${dashboardTypography.cardBadge} gap-1.5`} style={{ color: indexationPercent >= 0 ? '#01b574' : '#ff6b6b' }}>
              <Icon name={indexationPercent >= 0 ? "ArrowUp" : "ArrowDown"} size={14} /> 
              {indexationPercent >= 0 ? '+' : ''}{indexationPercent}% к предыдущему периоду
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IndexationCard;