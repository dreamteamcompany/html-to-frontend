import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Dashboard2BudgetBreakdown = () => {
  return (
    <Card style={{ 
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
      border: '1px solid rgba(117, 81, 233, 0.3)',
      boxShadow: '0 0 40px rgba(117, 81, 233, 0.2), inset 0 0 30px rgba(117, 81, 233, 0.08)',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '30px'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        width: '100%',
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(117, 81, 233, 0.5) 50%, transparent 100%)',
        pointerEvents: 'none',
        animation: 'slide 3s infinite'
      }} />
      <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
              padding: '14px',
              borderRadius: '14px',
              boxShadow: '0 0 25px rgba(117, 81, 233, 0.6)'
            }}>
              <Icon name="PieChart" size={28} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>Детальная Разбивка IT Бюджета</h3>
              <p style={{ fontSize: '14px', color: '#a3aed0', marginTop: '4px' }}>Полный анализ всех категорий расходов</p>
            </div>
          </div>
          <div style={{ 
            background: 'rgba(117, 81, 233, 0.15)',
            padding: '12px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(117, 81, 233, 0.3)'
          }}>
            <span style={{ color: '#7551e9', fontSize: '16px', fontWeight: '700' }}>Общий бюджет: ₽1.8М</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { icon: 'Server', name: 'Серверы & Хостинг', amount: 540000, percent: 30, color: '#7551e9', details: ['AWS: ₽320K', 'Azure: ₽150K', 'DigitalOcean: ₽70K'] },
            { icon: 'Cloud', name: 'SaaS Подписки', amount: 360000, percent: 20, color: '#3965ff', details: ['Microsoft 365: ₽140K', 'Slack: ₽120K', 'Adobe: ₽100K'] },
            { icon: 'Shield', name: 'Безопасность', amount: 324000, percent: 18, color: '#01b574', details: ['Антивирус: ₽150K', 'VPN: ₽100K', 'Firewall: ₽74K'] },
            { icon: 'Cpu', name: 'Оборудование', amount: 288000, percent: 16, color: '#ffb547', details: ['Ноутбуки: ₽180K', 'Мониторы: ₽68K', 'Сеть: ₽40K'] },
            { icon: 'Code', name: 'Dev Tools', amount: 180000, percent: 10, color: '#ff6b6b', details: ['GitHub: ₽80K', 'JetBrains: ₽60K', 'Postman: ₽40K'] },
            { icon: 'Database', name: 'Базы Данных', amount: 108000, percent: 6, color: '#a855f7', details: ['PostgreSQL: ₽50K', 'MongoDB: ₽38K', 'Redis: ₽20K'] }
          ].map((category, idx) => (
            <div key={idx} style={{ 
              background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}08 100%)`,
              padding: '20px',
              borderRadius: '16px',
              border: `1px solid ${category.color}30`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = `0 20px 40px ${category.color}40, 0 0 30px ${category.color}30`;
              e.currentTarget.style.borderColor = category.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = `${category.color}30`;
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '150%',
                height: '150%',
                background: `radial-gradient(circle, ${category.color}20 0%, transparent 70%)`,
                pointerEvents: 'none',
                opacity: 0,
                transition: 'opacity 0.4s ease'
              }} className="hover-glow" />
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{ 
                  background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}cc 100%)`,
                  padding: '10px',
                  borderRadius: '10px',
                  boxShadow: `0 0 20px ${category.color}60`
                }}>
                  <Icon name={category.icon} size={20} style={{ color: '#fff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {category.name}
                  </div>
                  <div style={{ color: '#a3aed0', fontSize: '12px' }}>{category.percent}% бюджета</div>
                </div>
              </div>
              <div style={{ 
                color: category.color, 
                fontSize: '24px', 
                fontWeight: '800',
                marginBottom: '12px',
                textShadow: `0 0 20px ${category.color}60`
              }}>
                {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(category.amount)}
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                background: 'rgba(255, 255, 255, 0.08)', 
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '12px'
              }}>
                <div style={{ 
                  width: `${category.percent * 3.33}%`, 
                  height: '100%', 
                  background: `linear-gradient(90deg, ${category.color} 0%, ${category.color}aa 100%)`,
                  borderRadius: '10px',
                  boxShadow: `0 0 15px ${category.color}`,
                  transition: 'width 1s ease'
                }} />
              </div>
              <div style={{ fontSize: '12px', color: '#a3aed0', lineHeight: '1.6' }}>
                {category.details.map((detail, i) => (
                  <div key={i} style={{ marginBottom: '4px' }}>• {detail}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard2BudgetBreakdown;
