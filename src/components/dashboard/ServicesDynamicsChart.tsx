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
    <Card className="relative overflow-hidden" style={{
      background: '#111c44',
      backdropFilter: 'blur(60px)',
      border: 'none',
      boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
      width: '100%',
      maxWidth: '100%',
      height: 'auto',
      minHeight: '400px',
    }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
          <Icon name="Activity" style={{ color: '#2CD9FF' }} />
          Динамика расходов по сервисам
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4" style={{ overflow: 'hidden' }}>
        <div className="relative flex items-center justify-center" style={{ height: '540px', overflow: 'auto' }}>
          <svg viewBox="0 0 2000 450" style={{ width: '100%', height: '540px', minHeight: '540px' }} preserveAspectRatio="xMidYMid meet">
            {(() => {
              const maxAmount = Math.max(...servicesData.map(s => s.amount));
              const barWidth = 80;
              const spacing = 130;
              const maxHeight = 350;
              const startY = 390;
              const barColors = ['#0075FF', '#2CD9FF', '#01B574', '#7B61FF', '#FF6B6B'];
              
              const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
                y: startY - ratio * maxHeight,
                value: (ratio * maxAmount / 1000).toFixed(0)
              }));
              
              const points = servicesData.map((service, index) => {
                const x = 80 + index * spacing;
                const barHeight = (service.amount / maxAmount) * maxHeight;
                const y = startY - barHeight;
                return { x: x + barWidth / 2, y };
              });
              
              const linePath = points.map((p, i) => 
                `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
              ).join(' ');
              
              return (
                <>
                  {gridLines.map((line, idx) => (
                    <g key={idx}>
                      <line
                        x1="70"
                        y1={line.y}
                        x2="1980"
                        y2={line.y}
                        stroke="#56577A"
                        strokeWidth="1"
                        strokeDasharray="5 5"
                      />
                      <text
                        x="50"
                        y={line.y + 4}
                        textAnchor="end"
                        fill="#c8cfca"
                        style={{ fontSize: '15px', fontWeight: '500' }}
                      >
                        {line.value}k
                      </text>
                    </g>
                  ))}
                  
                  {servicesData.map((service, index) => {
                    const x = 80 + index * spacing;
                    const barHeight = (service.amount / maxAmount) * maxHeight;
                    const color = barColors[index % barColors.length];
                    
                    return (
                      <g key={service.name}>
                        <defs>
                          <linearGradient id={`visionBar-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor={color} stopOpacity="0.0" />
                            <stop offset="100%" stopColor={color} stopOpacity="1" />
                          </linearGradient>
                        </defs>
                        <rect
                          x={x}
                          y={startY - barHeight}
                          width={barWidth}
                          height={barHeight}
                          fill={`url(#visionBar-${index})`}
                          rx="8"
                        />
                        <text
                          x={x + barWidth / 2}
                          y={startY - barHeight - 12}
                          textAnchor="middle"
                          fill="#fff"
                          style={{ fontSize: '16px', fontWeight: '600' }}
                        >
                          {(service.amount / 1000).toFixed(0)}k
                        </text>
                        <text
                          x={x + barWidth / 2}
                          y={410}
                          textAnchor="middle"
                          fill="#c8cfca"
                          style={{ fontSize: '14px' }}
                        >
                          {service.name.length > 12 ? service.name.slice(0, 12) + '...' : service.name}
                        </text>
                        {service.trend !== 0 && (
                          <g>
                            <rect
                              x={x + barWidth / 2 - 20}
                              y={startY - barHeight - 38}
                              width="40"
                              height="22"
                              rx="4"
                              fill={service.trend > 0 ? '#01B574' : '#E31A1A'}
                              opacity="0.9"
                            />
                            <text
                              x={x + barWidth / 2}
                              y={startY - barHeight - 22}
                              textAnchor="middle"
                              fill="#fff"
                              style={{ fontSize: '13px', fontWeight: 'bold' }}
                            >
                              {service.trend > 0 ? '+' : ''}{service.trend}%
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                  <defs>
                    <linearGradient id="visionLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2CD9FF" />
                      <stop offset="100%" stopColor="#0075FF" />
                    </linearGradient>
                  </defs>
                  <path
                    d={linePath}
                    stroke="url(#visionLineGradient)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {points.map((point, index) => (
                    <g key={index}>
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