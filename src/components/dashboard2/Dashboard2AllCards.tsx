import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

interface DashboardCard {
  id: string;
  title: string;
  type: 'stat' | 'chart';
}

const Dashboard2AllCards = () => {
  const [cardOrder, setCardOrder] = useState<DashboardCard[]>([]);

  const defaultCards: DashboardCard[] = [
    { id: 'total-expenses', title: 'Общие IT Расходы', type: 'stat' },
    { id: 'total-payments', title: 'Индексация', type: 'stat' },
    { id: 'annual-savings', title: 'Годовая Экономия', type: 'stat' },
    { id: 'attention-required', title: 'Требуют внимания', type: 'stat' },
    { id: 'monthly-dynamics', title: 'Динамика Расходов по Месяцам', type: 'chart' },
    { id: 'category-expenses', title: 'IT Расходы по Категориям', type: 'chart' },
    { id: 'contractor-comparison', title: 'Сравнение по Контрагентам', type: 'chart' },
    { id: 'expense-structure', title: 'Структура Расходов', type: 'chart' },
    { id: 'legal-entity-comparison', title: 'Сравнение по Юридическим Лицам', type: 'chart' },
    { id: 'department-comparison', title: 'Сравнение Затрат по Отделам-Заказчикам', type: 'chart' },
  ];

  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboard2-layout');
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setCardOrder(parsed);
      } catch (e) {
        console.error('Failed to parse saved layout:', e);
        setCardOrder(defaultCards);
      }
    } else {
      setCardOrder(defaultCards);
    }
  }, []);

  const renderCard = (card: DashboardCard) => {
    switch (card.id) {
      case 'total-expenses':
        return (
          <Card style={{ background: '#111c44', border: '1px solid rgba(117, 81, 233, 0.4)', borderTop: '4px solid #7551e9', boxShadow: '0 0 30px rgba(117, 81, 233, 0.2), inset 0 0 15px rgba(117, 81, 233, 0.05)' }}>
            <CardContent className="p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Общие IT Расходы</div>
                  <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>Все время</div>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(117, 81, 233, 0.1)', color: '#7551e9', border: '1px solid rgba(117, 81, 233, 0.2)' }}>
                  <Icon name="Server" size={20} />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>184,200 ₽</div>
              <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>Общая сумма расходов</div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: '#e31a1a' }}>
                <Icon name="ArrowUp" size={14} /> +12.5% с прошлого месяца
              </div>
            </CardContent>
          </Card>
        );

      case 'total-payments':
        return (
          <Card style={{ background: '#111c44', border: '1px solid rgba(255, 181, 71, 0.4)', borderTop: '4px solid #ffb547', boxShadow: '0 0 30px rgba(255, 181, 71, 0.2), inset 0 0 15px rgba(255, 181, 71, 0.05)' }}>
            <CardContent className="p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Индексация</div>
                  <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>Корректировка цен</div>
                </div>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 181, 71, 0.1)', color: '#ffb547', border: '1px solid rgba(255, 181, 71, 0.2)' }}>
                  <Icon name="TrendingUp" size={20} />
                </div>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>45,780 ₽</div>
              <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>за текущий период</div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: '#01b574' }}>
                <Icon name="ArrowUp" size={14} /> +15.3% к предыдущему периоду
              </div>
            </CardContent>
          </Card>
        );

      case 'attention-required':
        return (
          <Card style={{ 
            background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
            border: '1px solid rgba(255, 107, 107, 0.3)',
            boxShadow: '0 0 30px rgba(255, 107, 107, 0.15), inset 0 0 20px rgba(255, 107, 107, 0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '150%',
              height: '150%',
              background: 'radial-gradient(circle, rgba(255, 107, 107, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
            <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ 
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                  padding: '12px',
                  borderRadius: '12px',
                  boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
                  animation: 'pulse 2s infinite'
                }}>
                  <Icon name="AlertTriangle" size={24} style={{ color: '#fff' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Требуют внимания</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { icon: 'Clock3', text: 'Просрочено 4 платежа', color: '#ff6b6b', urgent: true },
                  { icon: 'XCircle', text: '2 отклоненных запроса', color: '#ffb547', urgent: false }
                ].map((alert, idx) => (
                  <div key={idx} style={{ 
                    background: alert.urgent ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 181, 71, 0.1)',
                    padding: '12px',
                    borderRadius: '12px',
                    border: `1px solid ${alert.color}40`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <Icon name={alert.icon} size={18} style={{ color: alert.color, flexShrink: 0 }} />
                    <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{alert.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'annual-savings':
        return (
          <Card style={{ 
            background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
            border: '1px solid rgba(1, 181, 116, 0.3)',
            boxShadow: '0 0 30px rgba(1, 181, 116, 0.15)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #01b574 0%, #018c5a 100%)',
                padding: '12px',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(1, 181, 116, 0.5)',
                display: 'inline-flex',
                marginBottom: '20px'
              }}>
                <Icon name="PiggyBank" size={24} style={{ color: '#fff' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
                Годовая Экономия
              </h3>
              <div style={{ 
                color: '#01b574', 
                fontSize: '42px', 
                fontWeight: '900',
                textShadow: '0 0 30px rgba(1, 181, 116, 0.6)',
                marginBottom: '12px'
              }}>
                ₽480K
              </div>
              <div style={{ color: '#a3aed0', fontSize: '14px' }}>
                За счет оптимизации подписок
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (cardOrder.length === 0) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 280px)', gap: '24px', marginBottom: '30px' }}>
      {cardOrder.map((card) => (
        <div key={card.id} style={{ width: '280px', height: '200px' }}>
          {renderCard(card)}
        </div>
      ))}
    </div>
  );
};

export default Dashboard2AllCards;