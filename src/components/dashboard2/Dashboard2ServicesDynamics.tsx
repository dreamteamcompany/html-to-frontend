import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Service {
  name: string;
  amount: number;
  trend: number;
  color: string;
}

const Dashboard2ServicesDynamics = () => {
  const servicesData: Service[] = [
    { name: 'Облачные сервисы', amount: 150000, trend: 12, color: '#3965ff' },
    { name: 'CRM-система', amount: 85000, trend: -5, color: '#2CD9FF' },
    { name: 'Аналитика', amount: 65000, trend: 8, color: '#01B574' },
    { name: 'Хостинг', amount: 45000, trend: 0, color: '#7551e9' },
    { name: 'Email-рассылки', amount: 35000, trend: 15, color: '#ffb547' },
  ];

  const totalAmount = servicesData.reduce((sum, s) => sum + s.amount, 0);
  const formatAmount = (amount: number) => amount.toLocaleString('ru-RU') + ' ₽';

  return (
    <Card style={{ 
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
      border: '1px solid rgba(57, 101, 255, 0.3)',
      boxShadow: '0 0 40px rgba(57, 101, 255, 0.2)',
      marginBottom: '30px'
    }}>
      <CardContent className="p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #3965ff 0%, #2948cc 100%)',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(57, 101, 255, 0.5)'
            }}>
              <Icon name="Activity" size={24} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>Динамика Расходов по Сервисам</h3>
              <p style={{ fontSize: '13px', color: '#a3aed0', marginTop: '4px' }}>Топ-5 сервисов</p>
            </div>
          </div>
          <div style={{ 
            background: 'rgba(57, 101, 255, 0.15)',
            padding: '10px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(57, 101, 255, 0.3)'
          }}>
            <span style={{ color: '#3965ff', fontSize: '14px', fontWeight: '700' }}>{formatAmount(totalAmount)}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {servicesData.map((service, index) => (
            <div key={index} style={{
              background: 'rgba(255, 255, 255, 0.02)',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = service.color;
              e.currentTarget.style.transform = 'translateX(4px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateX(0)';
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    background: service.color,
                    boxShadow: `0 0 10px ${service.color}`
                  }} />
                  <span style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>{service.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: service.color, fontSize: '16px', fontWeight: '700' }}>
                    {formatAmount(service.amount)}
                  </span>
                  <div style={{
                    background: service.trend >= 0 ? 'rgba(1, 181, 116, 0.15)' : 'rgba(255, 107, 107, 0.15)',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Icon 
                      name={service.trend >= 0 ? "TrendingUp" : "TrendingDown"} 
                      size={14} 
                      style={{ color: service.trend >= 0 ? '#01b574' : '#ff6b6b' }} 
                    />
                    <span style={{ 
                      color: service.trend >= 0 ? '#01b574' : '#ff6b6b', 
                      fontSize: '12px', 
                      fontWeight: '700' 
                    }}>
                      {service.trend >= 0 ? '+' : ''}{service.trend}%
                    </span>
                  </div>
                </div>
              </div>
              <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '3px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  width: `${(service.amount / totalAmount) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${service.color}60, ${service.color})`,
                  borderRadius: '3px',
                  boxShadow: `0 0 10px ${service.color}80`,
                  transition: 'width 0.6s ease'
                }} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard2ServicesDynamics;
