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

  const barHeight = 36;
  const spacing = 50;
  const maxWidth = 420;
  const startX = 180;
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #3965ff 0%, #2948cc 100%)',
              padding: '14px',
              borderRadius: '14px',
              boxShadow: '0 0 25px rgba(57, 101, 255, 0.6)',
              animation: 'pulse 3s infinite'
            }}>
              <Icon name="Activity" size={28} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>Динамика Расходов по Сервисам</h3>
              <p style={{ fontSize: '14px', color: '#a3aed0', marginTop: '4px' }}>Топ-10 сервисов • Тренды за месяц</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ 
              background: 'rgba(57, 101, 255, 0.15)',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(57, 101, 255, 0.3)'
            }}>
              <span style={{ color: '#3965ff', fontSize: '14px', fontWeight: '700' }}>{formatAmount(totalAmount)} общий</span>
            </div>
            <div style={{ 
              background: avgTrend >= 0 ? 'rgba(1, 181, 116, 0.15)' : 'rgba(255, 107, 107, 0.15)',
              padding: '10px 18px',
              borderRadius: '10px',
              border: avgTrend >= 0 ? '1px solid rgba(1, 181, 116, 0.3)' : '1px solid rgba(255, 107, 107, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Icon name={avgTrend >= 0 ? "TrendingUp" : "TrendingDown"} size={16} style={{ color: avgTrend >= 0 ? '#01b574' : '#ff6b6b' }} />
              <span style={{ color: avgTrend >= 0 ? '#01b574' : '#ff6b6b', fontSize: '14px', fontWeight: '700' }}>
                {avgTrend >= 0 ? '+' : ''}{avgTrend}% средний тренд
              </span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '16px',
          padding: '32px 24px 24px 24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '24px',
          position: 'relative',
          minHeight: `${sortedData.length * spacing + 60}px`
        }}>
          <svg viewBox={`0 0 650 ${sortedData.length * spacing + 40}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="d2LineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2CD9FF" />
                <stop offset="100%" stopColor="#3965ff" />
              </linearGradient>
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

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const x = startX + ratio * maxWidth;
              const value = formatAmount(Math.round(ratio * maxAmount));
              return (
                <g key={`grid-${idx}`}>
                  <line
                    x1={x}
                    y1="15"
                    x2={x}
                    y2={sortedData.length * spacing + 15}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={x}
                    y="12"
                    textAnchor="middle"
                    fill="#a3aed0"
                    style={{ fontSize: '11px', fontWeight: '600' }}
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {sortedData.map((service, index) => {
              const y = 30 + index * spacing;
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
                  {/* Service name */}
                  <text
                    x="15"
                    y={y + barHeight / 2 + 5}
                    textAnchor="start"
                    fill={isHovered ? color : '#a3aed0'}
                    style={{ 
                      fontSize: '14px', 
                      fontWeight: isHovered ? '700' : '600',
                      transition: 'all 0.3s ease',
                      textShadow: isHovered ? `0 0 10px ${color}` : 'none'
                    }}
                  >
                    {service.name}
                  </text>

                  {/* Bar */}
                  <rect
                    x={startX}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={`url(#d2Bar-${index})`}
                    rx="10"
                    filter={isHovered ? 'url(#d2Glow)' : 'none'}
                    style={{
                      transition: 'all 0.3s ease',
                      opacity: isHovered ? 1 : 0.9
                    }}
                  />

                  {/* Bar glow on hover */}
                  {isHovered && (
                    <rect
                      x={startX}
                      y={y}
                      width={barWidth}
                      height={barHeight}
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      rx="10"
                      opacity="0.6"
                    />
                  )}

                  {/* Amount */}
                  <text
                    x={startX + barWidth + 12}
                    y={y + barHeight / 2 + 5}
                    textAnchor="start"
                    fill={isHovered ? '#fff' : '#e0e0e0'}
                    style={{ 
                      fontSize: isHovered ? '15px' : '14px', 
                      fontWeight: '700',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {formatAmount(service.amount)}
                  </text>

                  {/* Trend badge */}
                  {service.trend !== 0 && (
                    <g>
                      <rect
                        x={startX + barWidth + 110}
                        y={y + barHeight / 2 - 10}
                        width="50"
                        height="20"
                        rx="6"
                        fill={service.trend > 0 ? '#01B574' : '#ff6b6b'}
                        opacity={isHovered ? 1 : 0.9}
                        style={{ transition: 'all 0.3s ease' }}
                      />
                      <text
                        x={startX + barWidth + 135}
                        y={y + barHeight / 2 + 5}
                        textAnchor="middle"
                        fill="#fff"
                        style={{ 
                          fontSize: '12px', 
                          fontWeight: '800'
                        }}
                      >
                        {service.trend > 0 ? '+' : ''}{service.trend}%
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Trend line */}
            {(() => {
              const points = sortedData.map((service, index) => {
                const y = 30 + index * spacing + barHeight / 2;
                const barWidth = (service.amount / maxAmount) * maxWidth;
                const x = startX + barWidth;
                return { x, y };
              });

              const linePath = points.map((p, i) => 
                `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
              ).join(' ');

              return (
                <>
                  <path
                    d={linePath}
                    stroke="url(#d2LineGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#d2Glow)"
                    opacity="0.8"
                  />
                  {points.map((point, index) => (
                    <g key={`point-${index}`}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={hoveredService === index ? "8" : "6"}
                        fill={barColors[index % barColors.length]}
                        opacity="0.3"
                        style={{ transition: 'all 0.3s ease' }}
                      />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r={hoveredService === index ? "5" : "3"}
                        fill="#fff"
                        style={{ transition: 'all 0.3s ease' }}
                      />
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>

        {/* Statistics grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px'
        }}>
          {[
            { 
              icon: 'TrendingUp', 
              label: 'Топ сервис', 
              value: sortedData[0]?.name || '', 
              sublabel: formatAmount(sortedData[0]?.amount || 0),
              color: '#3965ff',
              bgGradient: 'rgba(57, 101, 255, 0.15)'
            },
            { 
              icon: 'DollarSign', 
              label: 'Общие расходы', 
              value: formatAmount(totalAmount), 
              sublabel: `${sortedData.length} активных сервисов`,
              color: '#2CD9FF',
              bgGradient: 'rgba(44, 217, 255, 0.15)'
            },
            { 
              icon: 'BarChart3', 
              label: 'Средний тренд', 
              value: `${avgTrend >= 0 ? '+' : ''}${avgTrend}%`, 
              sublabel: 'Изменение за месяц',
              color: avgTrend >= 0 ? '#01B574' : '#ff6b6b',
              bgGradient: avgTrend >= 0 ? 'rgba(1, 181, 116, 0.15)' : 'rgba(255, 107, 107, 0.15)'
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
                fontSize: '20px', 
                fontWeight: '900',
                marginBottom: '6px',
                textShadow: `0 0 20px ${stat.color}60`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
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
          background: 'linear-gradient(135deg, rgba(57, 101, 255, 0.15) 0%, rgba(57, 101, 255, 0.05) 100%)',
          border: '1px solid rgba(57, 101, 255, 0.3)',
          borderRadius: '14px',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #3965ff 0%, #2948cc 100%)',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(57, 101, 255, 0.5)'
          }}>
            <Icon name="Lightbulb" size={24} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#3965ff', fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
              Возможна оптимизация расходов 💡
            </div>
            <div style={{ color: '#a3aed0', fontSize: '13px', lineHeight: '1.6' }}>
              {sortedData[0]?.name} — крупнейшая статья расходов (<span style={{ color: '#3965ff', fontWeight: '700' }}>{formatAmount(sortedData[0]?.amount || 0)}</span>). Рекомендуем пересмотреть тарифный план
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
              Подробнее →
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard2ServicesDynamics;
