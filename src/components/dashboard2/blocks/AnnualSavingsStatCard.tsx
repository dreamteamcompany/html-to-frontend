import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';

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

interface TopDepartment {
  department_name: string;
  total_saved: number;
}

interface SavingsData {
  savings: Saving[];
  total_annual: number;
  currency: string;
  total_amount: number;
  count: number;
  top_departments: TopDepartment[];
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
      const response = await fetch(`${API_ENDPOINTS.main}?endpoint=savings-dashboard`, {
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
          {savingsData ? formatAmount(savingsData.total_amount) : '—'}
        </div>
        <div className="text-xs sm:text-sm font-medium mb-3" style={{ color: '#a3aed0' }}>
          {savingsData ? `${savingsData.count} ${savingsData.count === 1 ? 'запись' : savingsData.count < 5 ? 'записи' : 'записей'} в реестре` : 'Загрузка...'}
        </div>

        {savingsData && savingsData.top_departments && savingsData.top_departments.length > 0 && (
          <div className="border-t border-white/10 pt-3 mt-3">
            <div className="text-xs sm:text-sm font-semibold mb-2" style={{ color: '#a3aed0' }}>
              Топ отделов-заказчиков:
            </div>
            <div className="flex flex-col gap-1.5">
              {savingsData.top_departments.slice(0, 3).map((dept, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center text-xs"
                >
                  <div className="flex items-center gap-1.5 text-white min-w-0 flex-1">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{
                      background: index === 0 ? 'rgba(1, 181, 116, 0.2)' : 'rgba(163, 174, 208, 0.1)',
                      color: index === 0 ? '#01b574' : '#a3aed0'
                    }}>
                      {index + 1}
                    </span>
                    <span className="font-medium truncate">{dept.department_name}</span>
                  </div>
                  <span className="font-semibold ml-2 flex-shrink-0" style={{ color: '#01b574' }}>
                    {formatAmount(dept.total_saved)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnnualSavingsStatCard;