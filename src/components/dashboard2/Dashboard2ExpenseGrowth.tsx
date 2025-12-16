import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Dashboard2ExpenseGrowth = () => {
  return (
    <Card style={{ 
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
      border: '1px solid rgba(57, 101, 255, 0.3)',
      boxShadow: '0 0 40px rgba(57, 101, 255, 0.2), inset 0 0 30px rgba(57, 101, 255, 0.08)',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '30px'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '180%',
        height: '180%',
        background: 'radial-gradient(circle, rgba(57, 101, 255, 0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
        animation: 'rotate 30s linear infinite'
      }} />
      <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #3965ff 0%, #2948cc 100%)',
              padding: '14px',
              borderRadius: '14px',
              boxShadow: '0 0 25px rgba(57, 101, 255, 0.6)',
              animation: 'pulse 3s infinite'
            }}>
              <Icon name="TrendingUp" size={28} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>Динамика Роста Затрат</h3>
              <p style={{ fontSize: '14px', color: '#a3aed0', marginTop: '4px' }}>Последние 12 месяцев • Тренд и анализ</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ 
              background: 'rgba(1, 181, 116, 0.15)',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(1, 181, 116, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Icon name="TrendingDown" size={16} style={{ color: '#01b574' }} />
              <span style={{ color: '#01b574', fontSize: '14px', fontWeight: '700' }}>-12% оптимизация</span>
            </div>
            <div style={{ 
              background: 'rgba(57, 101, 255, 0.15)',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(57, 101, 255, 0.3)'
            }}>
              <span style={{ color: '#3965ff', fontSize: '14px', fontWeight: '700' }}>₽4.2M за год</span>
            </div>
          </div>
        </div>

        {/* Chart visualization */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', height: '260px' }}>
            {[
              { month: 'Янв', value: 340000, percent: 68, color: '#7551e9', trend: '+5%' },
              { month: 'Фев', value: 355000, percent: 71, color: '#7551e9', trend: '+4%' },
              { month: 'Мар', value: 380000, percent: 76, color: '#3965ff', trend: '+7%' },
              { month: 'Апр', value: 370000, percent: 74, color: '#3965ff', trend: '-3%' },
              { month: 'Май', value: 395000, percent: 79, color: '#3965ff', trend: '+7%' },
              { month: 'Июн', value: 410000, percent: 82, color: '#ffb547', trend: '+4%' },
              { month: 'Июл', value: 425000, percent: 85, color: '#ffb547', trend: '+4%' },
              { month: 'Авг', value: 405000, percent: 81, color: '#01b574', trend: '-5%' },
              { month: 'Сен', value: 390000, percent: 78, color: '#01b574', trend: '-4%' },
              { month: 'Окт', value: 360000, percent: 72, color: '#01b574', trend: '-8%' },
              { month: 'Ноя', value: 345000, percent: 69, color: '#01b574', trend: '-4%' },
              { month: 'Дек', value: 330000, percent: 66, color: '#01b574', trend: '-4%' }
            ].map((item, idx) => {
              const isPositiveTrend = item.trend.startsWith('+');
              const isHighlight = idx === 11;
              
              return (
                <div 
                  key={idx} 
                  style={{ 
                    flex: 1, 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    const bar = e.currentTarget.querySelector('[data-bar]') as HTMLElement;
                    if (bar) {
                      bar.style.transform = 'scaleY(1.1)';
                      bar.style.boxShadow = `0 0 30px ${item.color}, 0 -10px 40px ${item.color}80`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    const bar = e.currentTarget.querySelector('[data-bar]') as HTMLElement;
                    if (bar) {
                      bar.style.transform = 'scaleY(1)';
                      bar.style.boxShadow = `0 0 20px ${item.color}80`;
                    }
                  }}
                >
                  {/* Trend badge */}
                  <div style={{
                    background: isPositiveTrend 
                      ? 'rgba(255, 107, 107, 0.15)' 
                      : 'rgba(1, 181, 116, 0.15)',
                    border: isPositiveTrend 
                      ? '1px solid rgba(255, 107, 107, 0.3)' 
                      : '1px solid rgba(1, 181, 116, 0.3)',
                    borderRadius: '6px',
                    padding: '3px 6px',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: isPositiveTrend ? '#ff6b6b' : '#01b574',
                    minWidth: '35px',
                    textAlign: 'center'
                  }}>
                    {item.trend}
                  </div>

                  {/* Value on hover */}
                  <div style={{
                    opacity: 0,
                    fontSize: '11px',
                    fontWeight: '700',
                    color: item.color,
                    transition: 'opacity 0.3s ease',
                    minHeight: '16px'
                  }}
                  className="bar-value">
                    ₽{Math.round(item.value / 1000)}K
                  </div>

                  {/* Bar */}
                  <div
                    data-bar
                    style={{
                      width: '100%',
                      height: `${item.percent}%`,
                      background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}cc 100%)`,
                      borderRadius: '8px 8px 4px 4px',
                      boxShadow: `0 0 20px ${item.color}80`,
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      border: isHighlight ? `2px solid ${item.color}` : 'none',
                      animation: isHighlight ? 'pulse 2s infinite' : 'none'
                    }}
                  >
                    {/* Glow effect on top */}
                    <div style={{
                      position: 'absolute',
                      top: '-6px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '80%',
                      height: '6px',
                      background: `radial-gradient(circle, ${item.color} 0%, transparent 70%)`,
                      borderRadius: '50%',
                      opacity: 0.8
                    }} />
                  </div>

                  {/* Month label */}
                  <div style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: isHighlight ? item.color : '#a3aed0',
                    textAlign: 'center'
                  }}>
                    {item.month}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Statistics grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px'
        }}>
          {[
            { 
              icon: 'ArrowUpRight', 
              label: 'Пик затрат', 
              value: '₽425K', 
              sublabel: 'Июль 2024',
              color: '#ffb547',
              bgGradient: 'rgba(255, 181, 71, 0.15)'
            },
            { 
              icon: 'ArrowDownRight', 
              label: 'Минимум', 
              value: '₽330K', 
              sublabel: 'Декабрь 2024',
              color: '#01b574',
              bgGradient: 'rgba(1, 181, 116, 0.15)'
            },
            { 
              icon: 'Activity', 
              label: 'Средний месяц', 
              value: '₽375K', 
              sublabel: 'Медиана значений',
              color: '#3965ff',
              bgGradient: 'rgba(57, 101, 255, 0.15)'
            },
            { 
              icon: 'Target', 
              label: 'Прогноз на январь', 
              value: '₽320K', 
              sublabel: '-3% к декабрю',
              color: '#7551e9',
              bgGradient: 'rgba(117, 81, 233, 0.15)'
            }
          ].map((stat, idx) => (
            <div key={idx} style={{ 
              background: `linear-gradient(135deg, ${stat.bgGradient} 0%, ${stat.bgGradient}80 100%)`,
              padding: '18px',
              borderRadius: '14px',
              border: `1px solid ${stat.color}30`,
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 10px 30px ${stat.color}40`;
              e.currentTarget.style.borderColor = stat.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = `${stat.color}30`;
            }}>
              <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '80px',
                height: '80px',
                background: `radial-gradient(circle, ${stat.color}20 0%, transparent 70%)`,
                pointerEvents: 'none'
              }} />
              <Icon name={stat.icon} size={20} style={{ color: stat.color, marginBottom: '10px' }} />
              <div style={{ 
                color: stat.color, 
                fontSize: '22px', 
                fontWeight: '900',
                marginBottom: '6px',
                textShadow: `0 0 20px ${stat.color}60`
              }}>
                {stat.value}
              </div>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                {stat.label}
              </div>
              <div style={{ color: '#a3aed0', fontSize: '11px', fontWeight: '500' }}>
                {stat.sublabel}
              </div>
            </div>
          ))}
        </div>

        {/* Insight banner */}
        <div style={{
          marginTop: '24px',
          background: 'linear-gradient(135deg, rgba(1, 181, 116, 0.15) 0%, rgba(1, 181, 116, 0.05) 100%)',
          border: '1px solid rgba(1, 181, 116, 0.3)',
          borderRadius: '14px',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #01b574 0%, #018c5a 100%)',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(1, 181, 116, 0.5)'
          }}>
            <Icon name="Lightbulb" size={24} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#01b574', fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
              Отличная динамика! 🚀
            </div>
            <div style={{ color: '#a3aed0', fontSize: '13px', lineHeight: '1.6' }}>
              За последние 5 месяцев затраты снизились на <span style={{ color: '#01b574', fontWeight: '700' }}>12%</span> благодаря оптимизации подписок и автоматизации процессов
            </div>
          </div>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '10px 20px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.transform = 'scale(1)';
          }}>
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
              Детальный отчет →
            </span>
          </div>
        </div>
      </CardContent>

      <style>{`
        [data-bar]:hover ~ .bar-value {
          opacity: 1 !important;
        }
      `}</style>
    </Card>
  );
};

export default Dashboard2ExpenseGrowth;
