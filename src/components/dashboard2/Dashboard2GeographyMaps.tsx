import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Dashboard2GeographyMaps = () => {
  return (
    <>
      {/* Russia Regional Heatmap - Placeholder for complex SVG map */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1117 100%)', 
        border: '1px solid rgba(117, 81, 233, 0.3)',
        boxShadow: '0 0 40px rgba(117, 81, 233, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '30px'
      }}>
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
                padding: '14px',
                borderRadius: '14px',
                boxShadow: '0 0 25px rgba(117, 81, 233, 0.6)'
              }}>
                <Icon name="Map" size={28} style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Тепловая Карта Расходов по Регионам</h3>
                <p style={{ fontSize: '14px', color: '#a3aed0', marginTop: '4px' }}>Географическое распределение платежей по России</p>
              </div>
            </div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ color: '#a3aed0', fontSize: '13px', marginRight: '8px' }}>Всего регионов:</span>
              <span style={{ color: '#7551e9', fontSize: '18px', fontWeight: '700' }}>9</span>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '20px',
            padding: '40px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center', color: '#a3aed0' }}>
              <Icon name="Map" size={64} style={{ color: '#7551e9', marginBottom: '20px', opacity: 0.5 }} />
              <p style={{ fontSize: '18px', fontWeight: '600' }}>Russia Regional Heatmap</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Interactive SVG Map Component</p>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(5, 1fr)', 
            gap: '16px',
            marginTop: '30px'
          }}>
            {[
              { icon: 'MapPin', label: 'Всего регионов', value: '9', color: '#7551e9' },
              { icon: 'TrendingUp', label: 'Средний рост', value: '+11%', color: '#01b574' },
              { icon: 'Target', label: 'Топ регион', value: 'Москва', color: '#ff0000' },
              { icon: 'DollarSign', label: 'Общий объем', value: '₽1.8М', color: '#ffb547' },
              { icon: 'Activity', label: 'Активность', value: 'Высокая', color: '#3965ff' }
            ].map((stat, idx) => (
              <div key={idx} style={{ 
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}08 100%)`,
                padding: '16px',
                borderRadius: '12px',
                border: `1px solid ${stat.color}30`,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 10px 30px ${stat.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <Icon name={stat.icon} size={20} style={{ color: stat.color, marginBottom: '8px' }} />
                <div style={{ 
                  color: stat.color, 
                  fontSize: '20px', 
                  fontWeight: '800',
                  marginBottom: '4px',
                  textShadow: `0 0 15px ${stat.color}60`
                }}>
                  {stat.value}
                </div>
                <div style={{ color: '#a3aed0', fontSize: '11px', fontWeight: '600' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Global Hexagonal Map */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1117 100%)', 
        border: '1px solid rgba(117, 81, 233, 0.3)',
        boxShadow: '0 0 40px rgba(117, 81, 233, 0.2)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '30px'
      }}>
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
                padding: '14px',
                borderRadius: '14px',
                boxShadow: '0 0 25px rgba(117, 81, 233, 0.6)'
              }}>
                <Icon name="Globe2" size={28} style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Глобальная География Расходов</h3>
                <p style={{ fontSize: '14px', color: '#a3aed0', marginTop: '4px' }}>Распределение пользователей по миру</p>
              </div>
            </div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.05)',
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <span style={{ color: '#a3aed0', fontSize: '13px', marginRight: '8px' }}>Всего пользователей:</span>
              <span style={{ color: '#7551e9', fontSize: '18px', fontWeight: '700' }}>22,650</span>
            </div>
          </div>

          <div style={{ 
            background: '#0a0e1a',
            borderRadius: '20px',
            padding: '40px 20px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            position: 'relative',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ textAlign: 'center', color: '#a3aed0' }}>
              <Icon name="Globe2" size={64} style={{ color: '#3965ff', marginBottom: '20px', opacity: 0.5 }} />
              <p style={{ fontSize: '18px', fontWeight: '600' }}>Global Hexagonal Map</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Interactive World Map Component</p>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)', 
            gap: '16px',
            marginTop: '30px'
          }}>
            {[
              { region: 'Европа', users: '8,420', color: '#3b82f6' },
              { region: 'Сев. Америка', users: '6,890', color: '#f59e0b' },
              { region: 'Азия', users: '4,230', color: '#10b981' },
              { region: 'Юж. Америка', users: '1,850', color: '#ec4899' },
              { region: 'Африка', users: '890', color: '#8b5cf6' },
              { region: 'Австралия', users: '370', color: '#06b6d4' }
            ].map((region, idx) => (
              <div key={idx} style={{ 
                background: `linear-gradient(135deg, ${region.color}15 0%, ${region.color}08 100%)`,
                padding: '16px',
                borderRadius: '12px',
                border: `1px solid ${region.color}30`,
                textAlign: 'center',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 10px 30px ${region.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ 
                  color: region.color, 
                  fontSize: '24px', 
                  fontWeight: '800',
                  marginBottom: '8px',
                  textShadow: `0 0 15px ${region.color}60`
                }}>
                  {region.users}
                </div>
                <div style={{ color: '#a3aed0', fontSize: '12px', fontWeight: '600' }}>
                  {region.region}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default Dashboard2GeographyMaps;
