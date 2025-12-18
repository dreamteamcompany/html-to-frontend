import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const AverageSpeedCard = () => {
  return (
    <Card style={{ 
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
      border: '1px solid rgba(168, 85, 247, 0.3)',
      boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        width: '200px',
        height: '200px',
        background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
        bottom: '-100px',
        right: '-100px',
        animation: 'pulse 3s infinite'
      }} />
      <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
          padding: '12px',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
          display: 'inline-flex',
          marginBottom: '20px'
        }}>
          <Icon name="Zap" size={24} style={{ color: '#fff' }} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
          Средняя Скорость
        </h3>
        <div style={{ 
          color: '#a855f7', 
          fontSize: '42px', 
          fontWeight: '900',
          textShadow: '0 0 30px rgba(168, 85, 247, 0.6)',
          marginBottom: '12px'
        }}>
          1.8ч
        </div>
        <div style={{ color: '#a3aed0', fontSize: '14px', marginBottom: '20px' }}>
          Обработка платежного запроса
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ 
            flex: 1,
            background: 'rgba(1, 181, 116, 0.15)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(1, 181, 116, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ color: '#01b574', fontSize: '20px', fontWeight: '700' }}>-24%</div>
            <div style={{ color: '#a3aed0', fontSize: '11px', marginTop: '4px' }}>vs месяц назад</div>
          </div>
          <div style={{ 
            flex: 1,
            background: 'rgba(117, 81, 233, 0.15)',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid rgba(117, 81, 233, 0.3)',
            textAlign: 'center'
          }}>
            <div style={{ color: '#7551e9', fontSize: '20px', fontWeight: '700' }}>94%</div>
            <div style={{ color: '#a3aed0', fontSize: '11px', marginTop: '4px' }}>Автоматизация</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AverageSpeedCard;
