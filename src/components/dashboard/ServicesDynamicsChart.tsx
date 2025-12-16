import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Service {
  name: string;
  amount: number;
  trend: number;
}

interface ServicesDynamicsChartProps {
  servicesData: Service[];
}

const ServicesDynamicsChart = ({ servicesData }: ServicesDynamicsChartProps) => {
  return (
    <Card className="relative" style={{
      background: '#111c44',
      backdropFilter: 'blur(60px)',
      border: 'none',
      boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
      width: '1000px',
      maxWidth: '100%',
      minHeight: '380px',
      overflow: 'hidden',
    }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
          <Icon name="Activity" style={{ color: '#2CD9FF' }} />
          Динамика расходов по сервисам
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4" style={{ overflow: 'auto' }}>
        <div className="relative" style={{ width: '100%', minHeight: `${servicesData.length * 60 + 40}px` }}>
          <svg viewBox={`0 0 1000 ${servicesData.length * 60 + 40}`} style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
            {(() => {
              const maxAmount = Math.max(...servicesData.map(s => s.amount));
              const barHeight = 40;
              const spacing = 60;
              const maxWidth = 800;
              const startX = 250;
              const barColors = ['#0075FF', '#2CD9FF', '#01B574', '#7B61FF', '#FF6B6B'];
              
              const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
                x: startX + ratio * maxWidth,
                value: (ratio * maxAmount / 1000).toFixed(0)
              }));
              
              const points = servicesData.map((service, index) => {
                const y = 30 + index * spacing;
                const barWidth = (service.amount / maxAmount) * maxWidth;
                const x = startX + barWidth;
                return { x, y: y + barHeight / 2 };
              });
              
              const linePath = points.map((p, i) => 
                `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
              ).join(' ');
              
              return (
                <>
                  <defs>
                    <linearGradient id="visionLineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#2CD9FF" />
                      <stop offset="100%" stopColor="#0075FF" />
                    </linearGradient>
                    {servicesData.map((_, index) => {
                      const color = barColors[index % barColors.length];
                      return (
                        <linearGradient key={`gradient-${index}`} id={`visionBar-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={color} stopOpacity="1" />
                        </linearGradient>
                      );
                    })}
                  </defs>
                  
                  {gridLines.map((line, idx) => (
                    <g key={`grid-${idx}`}>
                      <line
                        x1={line.x}
                        y1="20"
                        x2={line.x}
                        y2={servicesData.length * spacing + 20}
                        stroke="#56577A"
                        strokeWidth="1"
                        strokeDasharray="5 5"
                      />
                      <text
                        x={line.x}
                        y="15"
                        textAnchor="middle"
                        fill="#c8cfca"
                        style={{ fontSize: '14px', fontWeight: '500' }}
                      >
                        {line.value}k
                      </text>
                    </g>
                  ))}
                  
                  {servicesData.map((service, index) => {
                    const y = 30 + index * spacing;
                    const barWidth = (service.amount / maxAmount) * maxWidth;
                    
                    return (
                      <g key={`bar-${service.name}-${index}`}>
                        <rect
                          x={startX}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          fill={`url(#visionBar-${index})`}
                          rx="8"
                        />
                        <text
                          x="20"
                          y={y + barHeight / 2 + 5}
                          textAnchor="start"
                          fill="#c8cfca"
                          style={{ fontSize: '16px' }}
                        >
                          {service.name}
                        </text>
                        <text
                          x={startX + barWidth + 12}
                          y={y + barHeight / 2 + 5}
                          textAnchor="start"
                          fill="#fff"
                          style={{ fontSize: '16px', fontWeight: '600' }}
                        >
                          {(service.amount / 1000).toFixed(0)}k
                        </text>
                        {service.trend !== 0 && (
                          <g>
                            <rect
                              x={startX + barWidth + 60}
                              y={y + barHeight / 2 - 11}
                              width="50"
                              height="22"
                              rx="4"
                              fill={service.trend > 0 ? '#01B574' : '#E31A1A'}
                              opacity="0.9"
                            />
                            <text
                              x={startX + barWidth + 85}
                              y={y + barHeight / 2 + 5}
                              textAnchor="middle"
                              fill="#fff"
                              style={{ fontSize: '14px', fontWeight: 'bold' }}
                            >
                              {service.trend > 0 ? '+' : ''}{service.trend}%
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                  
                  <path
                    d={linePath}
                    stroke="url(#visionLineGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {points.map((point, index) => (
                    <g key={`point-${index}`}>
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="8"
                        fill="#2CD9FF"
                        opacity="0.3"
                      />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="5"
                        fill="#fff"
                      />
                    </g>
                  ))}
                </>
              );
            })()}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServicesDynamicsChart;