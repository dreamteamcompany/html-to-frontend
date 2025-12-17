import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface Service {
  name: string;
  amount: number;
  trend: number;
}

const Dashboard2ServicesDynamics = () => {
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const servicesData: Service[] = [
    { name: 'Облачные сервисы', amount: 150000, trend: 12 },
    { name: 'CRM-система', amount: 85000, trend: -5 },
    { name: 'Аналитика', amount: 65000, trend: 8 },
    { name: 'Хостинг', amount: 45000, trend: 0 },
    { name: 'Email-рассылки', amount: 35000, trend: 15 },
    { name: 'Видеоконференции', amount: 55000, trend: 10 },
    { name: 'Бухгалтерия', amount: 72000, trend: -3 },
    { name: 'Антивирус', amount: 28000, trend: 5 },
    { name: 'VPN-сервисы', amount: 42000, trend: 18 },
    { name: 'Мониторинг', amount: 38000, trend: 7 },
  ];

  const sortedData = [...servicesData].sort((a, b) => b.amount - a.amount);
  const maxAmount = Math.max(...sortedData.map(s => s.amount));
  const totalAmount = sortedData.reduce((sum, s) => sum + s.amount, 0);
  const avgTrend = Math.round(sortedData.reduce((sum, s) => sum + s.trend, 0) / sortedData.length);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  const barHeight = 24;
  const spacing = 32;
  const maxWidth = 320;
  const startX = 140;
  const barColors = ['#3965ff', '#2CD9FF', '#01B574', '#7551e9', '#ffb547'];

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #3965ff 0%, #2948cc 100%)',
              padding: '10px',
              borderRadius: '10px',
              boxShadow: '0 0 20px rgba(57, 101, 255, 0.6)',
              animation: 'pulse 3s infinite'
            }}>
              <Icon name="Activity" size={20} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Динамика Расходов по Сервисам</h3>
              <p style={{ fontSize: '12px', color: '#a3aed0', marginTop: '2px' }}>Топ-10 сервисов • Тренды за месяц</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ 
              background: 'rgba(57, 101, 255, 0.15)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(57, 101, 255, 0.3)'
            }}>
              <span style={{ color: '#3965ff', fontSize: '12px', fontWeight: '700' }}>{formatAmount(totalAmount)} общий</span>
            </div>
            <div style={{ 
              background: avgTrend >= 0 ? 'rgba(1, 181, 116, 0.15)' : 'rgba(255, 107, 107, 0.15)',
              padding: '6px 12px',
              borderRadius: '8px',
              border: avgTrend >= 0 ? '1px solid rgba(1, 181, 116, 0.3)' : '1px solid rgba(255, 107, 107, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Icon name={avgTrend >= 0 ? "TrendingUp" : "TrendingDown"} size={14} style={{ color: avgTrend >= 0 ? '#01b574' : '#ff6b6b' }} />
              <span style={{ color: avgTrend >= 0 ? '#01b574' : '#ff6b6b', fontSize: '12px', fontWeight: '700' }}>
                {avgTrend >= 0 ? '+' : ''}{avgTrend}% средний тренд
              </span>
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '12px',
          padding: '20px 16px 16px 16px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '16px',
          position: 'relative',
          minHeight: `${sortedData.length * spacing + 40}px`
        }}>
          <svg viewBox={`0 0 500 ${sortedData.length * spacing + 30}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
            <defs>
              {sortedData.map((_, index) => {
                const color = barColors[index % barColors.length];
                return (
                  <linearGradient key={`gradient-${index}`} id={`d2Bar-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="1" />
                  </linearGradient>
                );
              })}
              <filter id="d2Glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {[0, 0.5, 1].map((ratio, idx) => {
              const x = startX + ratio * maxWidth;
              const value = formatAmount(Math.round(ratio * maxAmount));
              return (
                <g key={`grid-${idx}`}>
                  <line
                    x1={x}
                    y1="10"
                    x2={x}
                    y2={sortedData.length * spacing + 10}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={x}
                    y="8"
                    textAnchor="middle"
                    fill="#a3aed0"
                    style={{ fontSize: '9px', fontWeight: '600' }}
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {sortedData.map((service, index) => {
              const y = 20 + index * spacing;
              const barWidth = (service.amount / maxAmount) * maxWidth;
              const isHovered = hoveredService === index;
              const color = barColors[index % barColors.length];
              
              return (
                <g 
                  key={`bar-${service.name}-${index}`}
                  onMouseEnter={() => setHoveredService(index)}
                  onMouseLeave={() => setHoveredService(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <text
                    x="10"
                    y={y + barHeight / 2 + 4}
                    textAnchor="start"
                    fill={isHovered ? color : '#a3aed0'}
                    style={{ 
                      fontSize: '11px', 
                      fontWeight: isHovered ? '700' : '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {service.name}
                  </text>

                  <rect
                    x={startX}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={`url(#d2Bar-${index})`}
                    rx="6"
                    filter={isHovered ? 'url(#d2Glow)' : 'none'}
                    style={{
                      transition: 'all 0.3s ease',
                      opacity: isHovered ? 1 : 0.85
                    }}
                  />

                  <text
                    x={startX + barWidth + 8}
                    y={y + barHeight / 2 + 4}
                    textAnchor="start"
                    fill={color}
                    style={{ 
                      fontSize: '11px', 
                      fontWeight: '700',
                      opacity: isHovered ? 1 : 0.9
                    }}
                  >
                    {formatAmount(service.amount)}
                  </text>

                  {service.trend !== 0 && (
                    <g>
                      <circle
                        cx={startX + barWidth + 90}
                        cy={y + barHeight / 2}
                        r="10"
                        fill={service.trend > 0 ? 'rgba(1, 181, 116, 0.15)' : 'rgba(255, 107, 107, 0.15)'}
                      />
                      <text
                        x={startX + barWidth + 90}
                        y={y + barHeight / 2 + 4}
                        textAnchor="middle"
                        fill={service.trend > 0 ? '#01b574' : '#ff6b6b'}
                        style={{ fontSize: '10px', fontWeight: '700' }}
                      >
                        {service.trend > 0 ? '+' : ''}{service.trend}%
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '12px'
        }}>
          {[
            { 
              icon: 'Layers', 
              label: 'Всего сервисов', 
              value: sortedData.length.toString(), 
              color: '#3965ff',
              bgGradient: 'rgba(57, 101, 255, 0.15)'
            },
            { 
              icon: 'TrendingUp', 
              label: 'Растущих', 
              value: sortedData.filter(s => s.trend > 0).length.toString(), 
              color: '#01B574',
              bgGradient: 'rgba(1, 181, 116, 0.15)'
            },
            { 
              icon: 'TrendingDown', 
              label: 'Снижающихся', 
              value: sortedData.filter(s => s.trend < 0).length.toString(), 
              color: '#ff6b6b',
              bgGradient: 'rgba(255, 107, 107, 0.15)'
            }
          ].map((stat, idx) => (
            <div key={idx} style={{ 
              background: `linear-gradient(135deg, ${stat.bgGradient} 0%, ${stat.bgGradient}80 100%)`,
              padding: '12px',
              borderRadius: '10px',
              border: `1px solid ${stat.color}30`,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = stat.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = `${stat.color}30`;
            }}>
              <Icon name={stat.icon} size={16} style={{ color: stat.color, marginBottom: '6px' }} />
              <div style={{ 
                color: stat.color, 
                fontSize: '18px', 
                fontWeight: '900',
                marginBottom: '4px'
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
  );
};

export default Dashboard2ServicesDynamics;
