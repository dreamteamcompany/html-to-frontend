import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';

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
    <Card style={{ background: '#111c44', border: '1px solid rgba(255, 181, 71, 0.4)', borderTop: '4px solid #ffb547', boxShadow: '0 0 30px rgba(255, 181, 71, 0.2), inset 0 0 15px rgba(255, 181, 71, 0.05)' }}>
      <CardContent className="p-4 sm:p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }} className="sm:mb-5">
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: '#fff' }} className="sm:text-lg sm:mb-2">Индексация</div>
            <div style={{ color: '#a3aed0', fontSize: '12px', fontWeight: '500' }} className="sm:text-sm">Корректировка цен</div>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 181, 71, 0.1)', color: '#ffb547', border: '1px solid rgba(255, 181, 71, 0.2)' }} className="sm:w-12 sm:h-12">
            <Icon name="TrendingUp" size={18} className="sm:w-5 sm:h-5" />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: '60px' }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '6px', color: '#fff' }} className="sm:text-3xl sm:mb-2">
              {new Intl.NumberFormat('ru-RU').format(indexationAmount)} ₽
            </div>
            <div style={{ color: '#a3aed0', fontSize: '12px', fontWeight: '500', marginBottom: '10px' }} className="sm:text-sm sm:mb-3">за текущий период</div>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', fontWeight: '600', gap: '4px', color: indexationPercent >= 0 ? '#01b574' : '#ff6b6b' }} className="sm:text-sm sm:gap-1.5">
              <Icon name={indexationPercent >= 0 ? "ArrowUp" : "ArrowDown"} size={12} className="sm:w-3.5 sm:h-3.5" /> 
              {indexationPercent >= 0 ? '+' : ''}{indexationPercent}% к предыдущему периоду
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IndexationCard;