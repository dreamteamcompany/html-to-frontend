import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';

interface DashboardStats {
  total_amount: number;
  total_count: number;
  change_percent: number;
  is_increase: boolean;
}

const TotalExpensesCard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/4c572eb4-70f6-460c-b2ba-6f15f83abed6');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ₽';
  };

  return (
    <Card style={{ background: '#111c44', border: '1px solid rgba(117, 81, 233, 0.4)', borderTop: '4px solid #7551e9', boxShadow: '0 0 30px rgba(117, 81, 233, 0.2), inset 0 0 15px rgba(117, 81, 233, 0.05)' }}>
      <CardContent className="p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Общие IT Расходы</div>
            <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>
              {loading ? 'Загрузка...' : `${stats?.total_count || 0} платежей`}
            </div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(117, 81, 233, 0.1)', color: '#7551e9', border: '1px solid rgba(117, 81, 233, 0.2)' }}>
            <Icon name="Server" size={20} />
          </div>
        </div>
        <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
          {loading ? '...' : formatAmount(stats?.total_amount || 0)}
        </div>
        <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>Общая сумма расходов</div>
        {!loading && stats && (
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: stats.is_increase ? '#e31a1a' : '#01b574' }}>
            <Icon name={stats.is_increase ? "ArrowUp" : "ArrowDown"} size={14} />
            {stats.is_increase ? '+' : ''}{stats.change_percent}% с прошлого месяца
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TotalExpensesCard;