import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const AttentionRequiredCard = () => {
  return (
    <Card style={{ 
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
      border: '1px solid rgba(255, 107, 107, 0.3)',
      boxShadow: '0 0 30px rgba(255, 107, 107, 0.15)',
      position: 'relative',
      overflow: 'hidden',
      height: '300px'
    }}>
      <CardContent className="p-6" style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Требуют внимания</div>
            <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>Критические задачи</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', border: '1px solid rgba(255, 107, 107, 0.2)' }}>
            <Icon name="AlertTriangle" size={20} />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: 'Clock3', text: 'Просрочено 4 платежа', color: '#ff6b6b' },
            { icon: 'XCircle', text: '2 отклоненных запроса', color: '#ffb547' }
          ].map((alert, idx) => (
            <div key={idx} style={{ 
              background: 'rgba(255, 107, 107, 0.05)',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 107, 107, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Icon name={alert.icon} size={16} style={{ color: alert.color, flexShrink: 0 }} />
              <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{alert.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttentionRequiredCard;
