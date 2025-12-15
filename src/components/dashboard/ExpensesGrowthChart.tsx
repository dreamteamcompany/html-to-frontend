import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface MonthData {
  month: string;
  amount: number;
}

interface ExpensesGrowthChartProps {
  monthlyData: MonthData[];
}

const ExpensesGrowthChart = ({ monthlyData }: ExpensesGrowthChartProps) => {
  return (
    <Card className="mb-6 relative overflow-hidden" style={{
      background: '#111c44',
      backdropFilter: 'blur(60px)',
      border: '2px solid rgba(86, 87, 122, 0.6)',
      boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
    }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
          <Icon name="BarChart3" style={{ color: '#2CD9FF' }} />
          Динамика роста затрат
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-96">
          <svg viewBox="0 0 700 350" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {(() => {
              const maxMonthAmount = Math.max(...monthlyData.map(m => m.amount));
              const spacing = 116;
              const maxHeight = 220;
              const startY = 280;
              const startX = 60;
              
              const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
                y: startY - ratio * maxHeight,
                value: (ratio * maxMonthAmount / 1000000).toFixed(1)
              }));
              
              const points = monthlyData.map((data, index) => {
                const x = startX + index * spacing;
                const barHeight = (data.amount / maxMonthAmount) * maxHeight;
                const y = startY - barHeight;
                return { x, y };
              });
              
              const linePath = points.map((p, i) => 
                `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
              ).join(' ');
              
              return (
                <>
                  {gridLines.map((line, idx) => (
                    <g key={idx}>
                      <line
                        x1="50"
                        y1={line.y}
                        x2="690"
                        y2={line.y}
                        stroke="#56577A"
                        strokeWidth="1"
                        strokeDasharray="5 5"
                      />
                      <text
                        x="35"
                        y={line.y + 4}
                        textAnchor="end"
                        fill="#c8cfca"
                        style={{ fontSize: '12px', fontWeight: '500' }}
                      >
                        {line.value}М
                      </text>
                    </g>
                  ))}
                  
                  {monthlyData.map((data, index) => {
                    const x = startX + index * spacing;
                    
                    return (
                      <g key={data.month}>
                        <text
                          x={x}
                          y={305}
                          textAnchor="middle"
                          fill="#c8cfca"
                          style={{ fontSize: '12px' }}
                        >
                          {data.month}
                        </text>
                      </g>
                    );
                  })}
                  
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#01B574" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#01B574" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={`M ${points[0].x} ${startY} ${points.map((p) => `L ${p.x} ${p.y}`).join(' ')} L ${points[points.length - 1].x} ${startY} Z`}
                    fill="url(#areaGradient)"
                  />
                  
                  <defs>
                    <linearGradient id="lineGradientGrowth" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#01B574" />
                      <stop offset="100%" stopColor="#2CD9FF" />
                    </linearGradient>
                  </defs>
                  <path
                    d={linePath}
                    stroke="url(#lineGradientGrowth)"
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
                        r="6"
                        fill="#01B574"
                        opacity="0.3"
                      />
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="4"
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

export default ExpensesGrowthChart;