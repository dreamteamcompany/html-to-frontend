import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface TeamMember {
  name: string;
  tasks: number;
  efficiency: number;
}

const Dashboard2TeamPerformance = () => {
  const [hoveredMember, setHoveredMember] = useState<number | null>(null);

  const teamData: TeamMember[] = [
    { name: 'Иван', tasks: 45, efficiency: 92 },
    { name: 'Мария', tasks: 38, efficiency: 88 },
    { name: 'Петр', tasks: 52, efficiency: 95 },
    { name: 'Анна', tasks: 41, efficiency: 85 },
    { name: 'Сергей', tasks: 36, efficiency: 78 },
  ];

  const maxEfficiency = Math.max(...teamData.map(m => m.efficiency));
  const minEfficiency = Math.min(...teamData.map(m => m.efficiency));
  const avgEfficiency = Math.round(teamData.reduce((sum, m) => sum + m.efficiency, 0) / teamData.length);

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
        background: 'radial-gradient(circle, rgba(44, 217, 255, 0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
        animation: 'rotate 30s linear infinite'
      }} />
      <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #2CD9FF 0%, #0075FF 100%)',
              padding: '14px',
              borderRadius: '14px',
              boxShadow: '0 0 25px rgba(44, 217, 255, 0.6)',
              animation: 'pulse 3s infinite'
            }}>
              <Icon name="Users" size={28} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>Эффективность Команды</h3>
              <p style={{ fontSize: '14px', color: '#a3aed0', marginTop: '4px' }}>Радар-анализ продуктивности • 5 участников</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ 
              background: 'rgba(44, 217, 255, 0.15)',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(44, 217, 255, 0.3)'
            }}>
              <span style={{ color: '#2CD9FF', fontSize: '14px', fontWeight: '700' }}>{avgEfficiency}% средний</span>
            </div>
            <div style={{ 
              background: 'rgba(1, 181, 116, 0.15)',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '1px solid rgba(1, 181, 116, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Icon name="TrendingUp" size={16} style={{ color: '#01b574' }} />
              <span style={{ color: '#01b574', fontSize: '14px', fontWeight: '700' }}>+8% за месяц</span>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '24px',
          position: 'relative'
        }}>
          <div style={{ position: 'relative', width: '100%', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 400 400" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2CD9FF" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0075FF" stopOpacity="0.15" />
                </linearGradient>
                <filter id="radarGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <radialGradient id="centerGlow">
                  <stop offset="0%" stopColor="#2CD9FF" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2CD9FF" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Center glow */}
              <circle
                cx="200"
                cy="200"
                r="40"
                fill="url(#centerGlow)"
              />

              {/* Концентрические круги */}
              {[120, 100, 80, 60, 40, 20].map((radius, idx) => (
                <circle
                  key={idx}
                  cx="200"
                  cy="200"
                  r={radius}
                  fill="none"
                  stroke={idx === 0 ? 'rgba(44, 217, 255, 0.3)' : '#2C3E5D'}
                  strokeWidth={idx === 0 ? '2' : '1'}
                  opacity={idx === 0 ? '1' : '0.4'}
                  strokeDasharray={idx === 0 ? '5,5' : 'none'}
                />
              ))}

              {/* Лучи из центра */}
              {teamData.map((_, index) => {
                const angle = (index / teamData.length) * Math.PI * 2 - Math.PI / 2;
                const x = 200 + Math.cos(angle) * 120;
                const y = 200 + Math.sin(angle) * 120;
                
                return (
                  <line
                    key={`ray-${index}`}
                    x1="200"
                    y1="200"
                    x2={x}
                    y2={y}
                    stroke="#2C3E5D"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                );
              })}

              {/* Данные радара */}
              <g>
                {(() => {
                  const points = teamData.map((member, index) => {
                    const angle = (index / teamData.length) * Math.PI * 2 - Math.PI / 2;
                    const radius = (member.efficiency / 100) * 120;
                    return {
                      x: 200 + Math.cos(angle) * radius,
                      y: 200 + Math.sin(angle) * radius,
                    };
                  });
                  
                  const pathData = points.map((p, i) => 
                    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                  ).join(' ') + ' Z';
                  
                  return (
                    <>
                      {/* Shadow area */}
                      <path
                        d={pathData}
                        fill="url(#radarGradient)"
                        opacity="0.5"
                      />
                      {/* Main line */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke="#2CD9FF"
                        strokeWidth="3"
                        filter="url(#radarGlow)"
                      />
                      {/* Data points */}
                      {points.map((point, index) => (
                        <g 
                          key={`point-${index}`}
                          onMouseEnter={() => setHoveredMember(index)}
                          onMouseLeave={() => setHoveredMember(null)}
                          style={{ cursor: 'pointer' }}
                        >
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r={hoveredMember === index ? "10" : "6"}
                            fill="#0075FF"
                            opacity="0.3"
                            style={{ transition: 'all 0.3s ease' }}
                          />
                          <circle
                            cx={point.x}
                            cy={point.y}
                            r={hoveredMember === index ? "6" : "4"}
                            fill="#fff"
                            style={{ transition: 'all 0.3s ease' }}
                          />
                          {hoveredMember === index && (
                            <circle
                              cx={point.x}
                              cy={point.y}
                              r="15"
                              fill="none"
                              stroke="#2CD9FF"
                              strokeWidth="2"
                              opacity="0.4"
                              style={{
                                animation: 'pulse 1.5s infinite'
                              }}
                            />
                          )}
                        </g>
                      ))}
                    </>
                  );
                })()}
              </g>

              {/* Подписи участников */}
              {teamData.map((member, index) => {
                const angle = (index / teamData.length) * Math.PI * 2 - Math.PI / 2;
                const labelRadius = 150;
                const x = 200 + Math.cos(angle) * labelRadius;
                const y = 200 + Math.sin(angle) * labelRadius;
                const isHovered = hoveredMember === index;
                
                return (
                  <g 
                    key={`label-${index}`}
                    onMouseEnter={() => setHoveredMember(index)}
                    onMouseLeave={() => setHoveredMember(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Background for label */}
                    {isHovered && (
                      <rect
                        x={x - 35}
                        y={y - 25}
                        width="70"
                        height="50"
                        rx="8"
                        fill="rgba(26, 31, 55, 0.95)"
                        stroke="#2CD9FF"
                        strokeWidth="2"
                      />
                    )}
                    
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      fill={isHovered ? '#2CD9FF' : '#fff'}
                      style={{ 
                        fontSize: isHovered ? '15px' : '14px', 
                        fontWeight: '700',
                        transition: 'all 0.3s ease',
                        textShadow: isHovered ? '0 0 10px #2CD9FF' : 'none'
                      }}
                    >
                      {member.name}
                    </text>
                    <text
                      x={x}
                      y={y + 16}
                      textAnchor="middle"
                      fill="#2CD9FF"
                      style={{ 
                        fontSize: isHovered ? '13px' : '12px', 
                        fontWeight: '600',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {member.efficiency}%
                    </text>
                    {isHovered && (
                      <text
                        x={x}
                        y={y - 10}
                        textAnchor="middle"
                        fill="#a3aed0"
                        style={{ fontSize: '10px' }}
                      >
                        {member.tasks} задач
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Tooltip для hoveredMember */}
          {hoveredMember !== null && (
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(135deg, rgba(26, 31, 55, 0.98) 0%, rgba(17, 28, 68, 0.98) 100%)',
              border: '2px solid #2CD9FF',
              borderRadius: '12px',
              padding: '12px 20px',
              boxShadow: '0 0 30px rgba(44, 217, 255, 0.4)',
              pointerEvents: 'none',
              zIndex: 10,
              minWidth: '180px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: '#2CD9FF', fontSize: '18px', fontWeight: '900', marginBottom: '4px' }}>
                  {teamData[hoveredMember].name}
                </div>
                <div style={{ color: '#a3aed0', fontSize: '12px', marginBottom: '8px' }}>
                  {teamData[hoveredMember].tasks} выполненных задач
                </div>
                <div style={{ 
                  display: 'inline-block',
                  background: 'rgba(44, 217, 255, 0.2)',
                  border: '1px solid rgba(44, 217, 255, 0.4)',
                  borderRadius: '8px',
                  padding: '6px 14px'
                }}>
                  <span style={{ color: '#2CD9FF', fontSize: '16px', fontWeight: '800' }}>
                    {teamData[hoveredMember].efficiency}%
                  </span>
                  <span style={{ color: '#a3aed0', fontSize: '11px', marginLeft: '4px' }}>
                    эффективность
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Statistics grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '16px'
        }}>
          {[
            { 
              icon: 'Trophy', 
              label: 'Лидер команды', 
              value: teamData.find(m => m.efficiency === maxEfficiency)?.name || '', 
              sublabel: `${maxEfficiency}% эффективность`,
              color: '#FFB547',
              bgGradient: 'rgba(255, 181, 71, 0.15)'
            },
            { 
              icon: 'Target', 
              label: 'Средний показатель', 
              value: `${avgEfficiency}%`, 
              sublabel: 'По всей команде',
              color: '#2CD9FF',
              bgGradient: 'rgba(44, 217, 255, 0.15)'
            },
            { 
              icon: 'TrendingUp', 
              label: 'Рост эффективности', 
              value: '+8%', 
              sublabel: 'За последний месяц',
              color: '#01B574',
              bgGradient: 'rgba(1, 181, 116, 0.15)'
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
          background: 'linear-gradient(135deg, rgba(44, 217, 255, 0.15) 0%, rgba(44, 217, 255, 0.05) 100%)',
          border: '1px solid rgba(44, 217, 255, 0.3)',
          borderRadius: '14px',
          padding: '18px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #2CD9FF 0%, #0075FF 100%)',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(44, 217, 255, 0.5)'
          }}>
            <Icon name="Zap" size={24} style={{ color: '#fff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#2CD9FF', fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
              Команда показывает отличные результаты! ⚡
            </div>
            <div style={{ color: '#a3aed0', fontSize: '13px', lineHeight: '1.6' }}>
              Средняя эффективность <span style={{ color: '#2CD9FF', fontWeight: '700' }}>{avgEfficiency}%</span> — это на 8% выше, чем в прошлом месяце. Петр лидирует с результатом {maxEfficiency}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard2TeamPerformance;
