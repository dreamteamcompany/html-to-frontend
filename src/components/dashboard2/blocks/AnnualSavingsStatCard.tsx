import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';

interface Saving {
  id: number;
  service_name: string;
  description: string;
  amount: number;
  frequency: string;
  currency: string;
  employee_name: string;
  reason_name: string;
  annual_amount: number;
}

interface SavingsData {
  savings: Saving[];
  total_annual: number;
  currency: string;
}

const AnnualSavingsStatCard = () => {
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      loadSavingsData();
    }
  }, [token]);

  const loadSavingsData = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=savings-dashboard', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Savings data loaded:', data);
        setSavingsData(data);
      } else {
        console.error('Failed to load savings, status:', response.status);
      }
    } catch (err) {
      console.error('Failed to load savings data:', err);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="h-full" style={{ 
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
      border: '1px solid rgba(1, 181, 116, 0.3)',
      boxShadow: '0 0 30px rgba(1, 181, 116, 0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex justify-between items-start mb-4 sm:mb-5">
          <div>
            <div className="text-base sm:text-lg font-bold mb-2 text-white">Экономия</div>
            <div className="text-xs sm:text-sm font-medium" style={{ color: '#a3aed0' }}>Общая экономия по реестру</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(1, 181, 116, 0.1)', color: '#01b574', border: '1px solid rgba(1, 181, 116, 0.2)' }}>
            <Icon name="PiggyBank" size={18} className="sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ color: '#01b574', textShadow: '0 0 20px rgba(1, 181, 116, 0.4)' }}>
          {savingsData ? formatAmount(savingsData.total_annual) : '—'}
        </div>
        <div className="text-xs sm:text-sm font-medium mb-3" style={{ color: '#a3aed0' }}>
          {savingsData ? `${savingsData.savings.length} ${savingsData.savings.length === 1 ? 'запись' : savingsData.savings.length < 5 ? 'записи' : 'записей'} в реестре` : 'Загрузка...'}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnualSavingsStatCard;