import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const LiveMetricsCard = () => {
  return (
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
  );
};

export default LiveMetricsCard;
