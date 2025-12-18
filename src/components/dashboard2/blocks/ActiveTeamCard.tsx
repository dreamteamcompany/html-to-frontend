import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const ActiveTeamCard = () => {
  return (
    <Card style={{ 
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
      border: '1px solid rgba(117, 81, 233, 0.3)',
      boxShadow: '0 0 30px rgba(117, 81, 233, 0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        width: '250px',
        height: '250px',
        background: 'radial-gradient(circle, rgba(117, 81, 233, 0.12) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        animation: 'breathe 4s infinite'
      }} />
      <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
          padding: '12px',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(117, 81, 233, 0.5)',
          display: 'inline-flex',
          marginBottom: '20px'
        }}>
          <Icon name="Users" size={24} style={{ color: '#fff' }} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
          Активная Команда
        </h3>
        <div style={{ 
          color: '#7551e9', 
          fontSize: '42px', 
          fontWeight: '900',
          textShadow: '0 0 30px rgba(117, 81, 233, 0.6)',
          marginBottom: '12px'
        }}>
          24
        </div>
        <div style={{ color: '#a3aed0', fontSize: '14px', marginBottom: '20px' }}>
          Сотрудников работают с системой
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <span style={{ color: '#a3aed0', fontSize: '13px' }}>Финансисты</span>
            <span style={{ color: '#7551e9', fontSize: '14px', fontWeight: '700' }}>12</span>
          </div>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <span style={{ color: '#a3aed0', fontSize: '13px' }}>IT отдел</span>
            <span style={{ color: '#01b574', fontSize: '14px', fontWeight: '700' }}>8</span>
          </div>
          <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <span style={{ color: '#a3aed0', fontSize: '13px' }}>Менеджеры</span>
            <span style={{ color: '#ffb547', fontSize: '14px', fontWeight: '700' }}>4</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveTeamCard;
