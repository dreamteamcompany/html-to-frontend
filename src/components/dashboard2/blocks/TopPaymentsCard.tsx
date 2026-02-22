import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';

interface TopPayment {
  id: number;
  description: string;
  amount: number;
  category_name: string;
  category_icon: string;
  service_name: string;
  status: string;
}

const TopPaymentsCard = () => {
  const [payments, setPayments] = useState<TopPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const loadTopPayments = async () => {
      try {
        const response = await apiFetch(API_ENDPOINTS.statsApi);
        if (controller.signal.aborted) return;
        const data = await response.json();
        setPayments(data.top_payments || []);
      } catch {
        // silent
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    loadTopPayments();
    return () => controller.abort();
  }, []);

  const getColor = (index: number) => {
    const colors = ['#7551e9', '#3965ff', '#01b574', '#ffb547', '#ff6b6b'];
    return colors[index] || '#7551e9';
  };

  const maxAmount = payments.length > 0 ? Math.max(...payments.map(p => p.amount)) : 1;

  if (loading) {
    return (
      <Card style={{ 
        background: 'hsl(var(--card))', 
        border: '1px solid hsl(var(--border))',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card style={{ 
      background: 'hsl(var(--card))', 
      border: '1px solid hsl(var(--border))',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent className="p-4 sm:p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }} className="sm:gap-3 sm:mb-6">
          <div style={{ 
            background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
            padding: '8px',
            borderRadius: '10px',
            boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)'
          }} className="sm:p-3">
            <Icon name="TrendingUp" size={18} style={{ color: '#fff' }} className="sm:w-6 sm:h-6" />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'hsl(var(--foreground))' }} className="sm:text-lg">Топ-5 Платежей</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }} className="sm:gap-4">
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Нет данных о платежах
            </div>
          ) : (
            payments.map((payment, idx) => {
              const color = getColor(idx);
              const percent = (payment.amount / maxAmount) * 100;
              
              return (
                <div key={payment.id} style={{ 
                  background: 'hsl(var(--muted))',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '1px solid hsl(var(--border))',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.boxShadow = `0 2px 8px ${color}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'hsl(var(--border))';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'flex-start' }} className="sm:mb-2">
                    <div style={{ flex: 1 }}>
                      <div style={{ color: 'hsl(var(--foreground))', fontSize: '18px', fontWeight: '600', marginBottom: '2px' }} className="sm:text-xl">
                        {payment.service_name || 'Без сервиса'}
                      </div>
                      <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '15px', fontWeight: '500' }} className="sm:text-base">
                        {payment.category_name || 'Без категории'}
                      </div>
                    </div>
                    <span style={{ color: color, fontSize: '18px', fontWeight: '700', marginLeft: '8px', whiteSpace: 'nowrap' }} className="sm:text-xl">
                      {new Intl.NumberFormat('ru-RU').format(payment.amount)} ₽
                    </span>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '5px', 
                    background: 'hsl(var(--muted))', 
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{ 
                      width: `${percent}%`, 
                      height: '100%', 
                      background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
                      borderRadius: '10px',
                      boxShadow: `0 2px 8px ${color}40`,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPaymentsCard;