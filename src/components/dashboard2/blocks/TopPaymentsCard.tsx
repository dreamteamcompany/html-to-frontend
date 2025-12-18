import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const TopPaymentsCard = () => {
  return (
    <Card style={{ 
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
      border: '1px solid rgba(117, 81, 233, 0.3)',
      boxShadow: '0 0 30px rgba(117, 81, 233, 0.15), inset 0 0 20px rgba(117, 81, 233, 0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-50%',
        right: '-50%',
        width: '200%',
        height: '200%',
        background: 'radial-gradient(circle, rgba(117, 81, 233, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(117, 81, 233, 0.5)'
          }}>
            <Icon name="TrendingUp" size={24} style={{ color: '#fff' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Топ-5 Платежей</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { name: 'AWS Hosting', amount: 45000, percent: 100, color: '#7551e9' },
            { name: 'Google Ads', amount: 38000, percent: 84, color: '#3965ff' },
            { name: 'Зарплата ИТ', amount: 32000, percent: 71, color: '#01b574' },
            { name: 'Софт лицензии', amount: 24000, percent: 53, color: '#ffb547' },
            { name: 'Обучение', amount: 18000, percent: 40, color: '#ff6b6b' }
          ].map((item, idx) => (
            <div key={idx} style={{ 
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = item.color;
              e.currentTarget.style.boxShadow = `0 0 20px ${item.color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{item.name}</span>
                <span style={{ color: item.color, fontSize: '14px', fontWeight: '700' }}>
                  {new Intl.NumberFormat('ru-RU').format(item.amount)} ₽
                </span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '6px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${item.percent}%`, 
                  height: '100%', 
                  background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}aa 100%)`,
                  borderRadius: '10px',
                  boxShadow: `0 0 10px ${item.color}`,
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPaymentsCard;
