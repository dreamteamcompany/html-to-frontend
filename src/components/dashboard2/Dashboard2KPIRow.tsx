import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Dashboard2KPIRow = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '30px' }}>
      {/* Экономия за год */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(1, 181, 116, 0.3)',
        boxShadow: '0 0 30px rgba(1, 181, 116, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(1, 181, 116, 0.2) 0%, transparent 70%)',
          top: '-150px',
          left: '-150px',
          animation: 'rotate 20s linear infinite'
        }} />
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
          <div style={{ color: '#a3aed0', fontSize: '14px', marginBottom: '20px' }}>
            За счет оптимизации подписок
          </div>
          <div style={{ 
            background: 'rgba(1, 181, 116, 0.1)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(1, 181, 116, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#a3aed0', fontSize: '13px' }}>Прогресс цели</span>
              <span style={{ color: '#01b574', fontSize: '13px', fontWeight: '700' }}>73%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: '73%', 
                height: '100%', 
                background: 'linear-gradient(90deg, #01b574 0%, #01b574aa 100%)',
                borderRadius: '10px',
                boxShadow: '0 0 15px #01b574',
                animation: 'progress 2s ease-out'
              }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Скорость обработки */}
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

      {/* Команда */}
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
    </div>
  );
};

export default Dashboard2KPIRow;
