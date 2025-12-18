import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Dashboard2StatsCards = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '30px' }}>
      {/* Общие IT Расходы */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px' }}>Все время</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>Общие IT Расходы</div>
            </div>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <Icon name="Server" size={24} style={{ color: '#fff' }} />
            </div>
          </div>
          <div style={{ fontSize: '40px', fontWeight: '900', marginBottom: '12px', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>184,200 ₽</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(227, 26, 26, 0.2)',
            borderRadius: '8px',
            width: 'fit-content'
          }}>
            <Icon name="TrendingUp" size={16} style={{ color: '#ff6b6b' }} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>+12.5% с прошлого месяца</span>
          </div>
        </CardContent>
      </Card>

      {/* Серверная Инфраструктура */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        border: 'none',
        boxShadow: '0 8px 32px rgba(56, 239, 125, 0.4)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px' }}>Серверы</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>Инфраструктура</div>
            </div>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <Icon name="Database" size={24} style={{ color: '#fff' }} />
            </div>
          </div>
          <div style={{ fontSize: '40px', fontWeight: '900', marginBottom: '8px', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>98,500 ₽</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '12px', fontWeight: '600' }}>53.4% от общего бюджета</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(255, 107, 107, 0.2)',
            borderRadius: '8px',
            width: 'fit-content'
          }}>
            <Icon name="TrendingUp" size={16} style={{ color: '#ff6b6b' }} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>+8.2%</span>
          </div>
        </CardContent>
      </Card>

      {/* Коммуникационные Сервисы */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        border: 'none',
        boxShadow: '0 8px 32px rgba(79, 172, 254, 0.4)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px' }}>Связь</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>Коммуникации</div>
            </div>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <Icon name="MessageCircle" size={24} style={{ color: '#fff' }} />
            </div>
          </div>
          <div style={{ fontSize: '40px', fontWeight: '900', marginBottom: '8px', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>45,300 ₽</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '12px', fontWeight: '600' }}>24.6% от общего бюджета</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            width: 'fit-content'
          }}>
            <Icon name="Minus" size={16} style={{ color: '#fff' }} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Без изменений</span>
          </div>
        </CardContent>
      </Card>

      {/* Всего Платежей */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        border: 'none',
        boxShadow: '0 8px 32px rgba(250, 112, 154, 0.4)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '1px' }}>История</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff' }}>Всего Платежей</div>
            </div>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              background: 'rgba(255, 255, 255, 0.15)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <Icon name="Box" size={24} style={{ color: '#fff' }} />
            </div>
          </div>
          <div style={{ fontSize: '40px', fontWeight: '900', marginBottom: '8px', color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>23</div>
          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '12px', fontWeight: '600' }}>платежей за все время</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 12px',
            background: 'rgba(255, 107, 107, 0.2)',
            borderRadius: '8px',
            width: 'fit-content'
          }}>
            <Icon name="TrendingUp" size={16} style={{ color: '#fff' }} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>+3 за месяц</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard2StatsCards;
