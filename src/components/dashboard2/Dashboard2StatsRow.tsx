import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Dashboard2StatsRow = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '30px' }}>
      {/* Топ Платежей с неоновым свечением */}
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

      {/* Статистика в реальном времени */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(1, 181, 116, 0.3)',
        boxShadow: '0 0 30px rgba(1, 181, 116, 0.15), inset 0 0 20px rgba(1, 181, 116, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(1, 181, 116, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #01b574 0%, #018c5a 100%)',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(1, 181, 116, 0.5)'
            }}>
              <Icon name="Activity" size={24} style={{ color: '#fff' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Live Метрики</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              background: 'rgba(1, 181, 116, 0.1)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(1, 181, 116, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ color: '#01b574', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Обработано сегодня
              </div>
              <div style={{ 
                color: '#fff', 
                fontSize: '36px', 
                fontWeight: '800',
                textShadow: '0 0 20px rgba(1, 181, 116, 0.5)'
              }}>
                127
              </div>
              <div style={{ color: '#a3aed0', fontSize: '13px', marginTop: '4px' }}>
                +18 за последний час
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ 
                background: 'rgba(255, 181, 71, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 181, 71, 0.2)',
                textAlign: 'center'
              }}>
                <Icon name="Clock" size={20} style={{ color: '#ffb547', marginBottom: '8px' }} />
                <div style={{ color: '#ffb547', fontSize: '24px', fontWeight: '700' }}>2.4ч</div>
                <div style={{ color: '#a3aed0', fontSize: '12px', marginTop: '4px' }}>Ср. время</div>
              </div>
              <div style={{ 
                background: 'rgba(117, 81, 233, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(117, 81, 233, 0.2)',
                textAlign: 'center'
              }}>
                <Icon name="CheckCircle2" size={20} style={{ color: '#7551e9', marginBottom: '8px' }} />
                <div style={{ color: '#7551e9', fontSize: '24px', fontWeight: '700' }}>94%</div>
                <div style={{ color: '#a3aed0', fontSize: '12px', marginTop: '4px' }}>Согласовано</div>
              </div>
            </div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#a3aed0', fontSize: '13px' }}>На согласовании</span>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>23</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '6px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: '64%', 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #01b574 0%, #01b574aa 100%)',
                  borderRadius: '10px',
                  boxShadow: '0 0 10px #01b574',
                  animation: 'pulse 2s infinite'
                }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Критичные уведомления */}
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
              { icon: 'XCircle', text: '2 отклоненных запроса', color: '#ffb547', urgent: false },
              { icon: 'AlertCircle', text: 'Лимит приближается к 80%', color: '#ff6b6b', urgent: true },
              { icon: 'FileWarning', text: '3 документа без подписи', color: '#ffb547', urgent: false }
            ].map((alert, idx) => (
              <div key={idx} style={{ 
                background: alert.urgent ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 181, 71, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                border: `1px solid ${alert.color}40`,
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = `0 0 20px ${alert.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <Icon name={alert.icon} size={20} style={{ color: alert.color, flexShrink: 0 }} />
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{alert.text}</span>
              </div>
            ))}
          </div>
          <div style={{ 
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(117, 81, 233, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(117, 81, 233, 0.2)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(117, 81, 233, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(117, 81, 233, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(117, 81, 233, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <span style={{ color: '#7551e9', fontSize: '14px', fontWeight: '600' }}>
              Посмотреть все уведомления
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard2StatsRow;
