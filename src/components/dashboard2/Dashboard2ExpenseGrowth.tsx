import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

const Dashboard2ExpenseGrowth = () => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const data = [
    { month: 'Янв', value: 340000, color: '#7551e9', trend: '+5%' },
    { month: 'Фев', value: 355000, color: '#7551e9', trend: '+4%' },
    { month: 'Мар', value: 380000, color: '#3965ff', trend: '+7%' },
    { month: 'Апр', value: 370000, color: '#3965ff', trend: '-3%' },
    { month: 'Май', value: 395000, color: '#3965ff', trend: '+7%' },
    { month: 'Июн', value: 410000, color: '#ffb547', trend: '+4%' },
    { month: 'Июл', value: 425000, color: '#ffb547', trend: '+4%' },
    { month: 'Авг', value: 405000, color: '#01b574', trend: '-5%' },
    { month: 'Сен', value: 390000, color: '#01b574', trend: '-4%' },
    { month: 'Окт', value: 360000, color: '#01b574', trend: '-8%' },
    { month: 'Ноя', value: 345000, color: '#01b574', trend: '-4%' },
    { month: 'Дек', value: 330000, color: '#01b574', trend: '-4%' }
  ];

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const chartHeight = 260;
  const chartWidth = 100;

  const getY = (value: number) => {
    const normalizedValue = (value - minValue) / (maxValue - minValue);
    return chartHeight - (normalizedValue * (chartHeight - 40)) - 20;
  };

  const points = data.map((item, idx) => ({
    x: (idx / (data.length - 1)) * chartWidth,
    y: getY(item.value),
    ...item
  }));

  const pathData = points.map((p, idx) => 
    `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ');

  const gradientId = 'lineGradient';
  const areaPath = `${pathData} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`;

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

        {/* Line Chart */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '16px',
          padding: '32px 24px 24px 24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            style={{ width: '100%', height: '280px' }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3965ff" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#7551e9" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#01b574" stopOpacity="0.05" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((percent) => {
              const y = (chartHeight * percent) / 100;
              return (
                <line
                  key={percent}
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="0.5"
                />
              );
            })}

            {/* Area under line */}
            <path
              d={areaPath}
              fill={`url(#${gradientId})`}
              opacity="0.6"
            />

            {/* Main line */}
            <path
              d={pathData}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
              style={{
                transition: 'all 0.3s ease'
              }}
            />

            {/* Highlight line on hover */}
            <path
              d={pathData}
              fill="none"
              stroke="#3965ff"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={hoveredPoint !== null ? "0.3" : "0"}
              style={{
                transition: 'opacity 0.3s ease'
              }}
            />

            {/* Data points */}
            {points.map((point, idx) => {
              const isHovered = hoveredPoint === idx;
              const isLast = idx === points.length - 1;
              
              return (
                <g key={idx}>
                  {/* Outer glow circle */}
                  {isHovered && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="3"
                      fill={point.color}
                      opacity="0.3"
                      style={{
                        animation: 'pulse 1.5s infinite'
                      }}
                    />
                  )}
                  
                  {/* Main point */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? "1.5" : isLast ? "1.2" : "0.8"}
                    fill={point.color}
                    stroke="#fff"
                    strokeWidth={isHovered ? "0.5" : isLast ? "0.4" : "0.3"}
                    filter="url(#glow)"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isLast ? `0 0 20px ${point.color}` : 'none'
                    }}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  
                  {/* Larger invisible hitbox for better hover */}
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill="transparent"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}
          </svg>

          {/* Month labels */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            marginTop: '16px',
            paddingLeft: '8px',
            paddingRight: '8px'
          }}>
            {data.map((item, idx) => (
              <div 
                key={idx}
                style={{ 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: hoveredPoint === idx ? item.color : idx === data.length - 1 ? item.color : '#a3aed0',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  textShadow: hoveredPoint === idx ? `0 0 10px ${item.color}` : 'none'
                }}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {item.month}
              </div>
            ))}
          </div>

          {/* Hover tooltip */}
          {hoveredPoint !== null && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'linear-gradient(135deg, rgba(26, 31, 55, 0.98) 0%, rgba(17, 28, 68, 0.98) 100%)',
              border: `2px solid ${data[hoveredPoint].color}`,
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: `0 0 40px ${data[hoveredPoint].color}60`,
              pointerEvents: 'none',
              zIndex: 10
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#a3aed0', fontSize: '12px', marginBottom: '6px' }}>
                  {data[hoveredPoint].month} 2024
                </div>
                <div style={{ 
                  color: data[hoveredPoint].color, 
                  fontSize: '24px', 
                  fontWeight: '900',
                  textShadow: `0 0 20px ${data[hoveredPoint].color}`,
                  marginBottom: '4px'
                }}>
                  ₽{Math.round(data[hoveredPoint].value / 1000)}K
                </div>
                <div style={{
                  display: 'inline-block',
                  background: data[hoveredPoint].trend.startsWith('+') 
                    ? 'rgba(255, 107, 107, 0.2)' 
                    : 'rgba(1, 181, 116, 0.2)',
                  border: data[hoveredPoint].trend.startsWith('+')
                    ? '1px solid rgba(255, 107, 107, 0.4)' 
                    : '1px solid rgba(1, 181, 116, 0.4)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: '700',
                  color: data[hoveredPoint].trend.startsWith('+') ? '#ff6b6b' : '#01b574'
                }}>
                  {data[hoveredPoint].trend}
                </div>
              </div>
            </div>
          )}
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
    </Card>
  );
};

export default Dashboard2ExpenseGrowth;
