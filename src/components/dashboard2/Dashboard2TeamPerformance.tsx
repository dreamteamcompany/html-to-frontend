import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { usePeriod } from '@/contexts/PeriodContext';

interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  department_name?: string;
  [key: string]: unknown;
}

const PALETTE = [
  { fill: 'rgba(1, 181, 116, 0.55)',   stroke: 'rgba(1, 181, 116, 0.9)',   glow: 'rgba(1, 181, 116, 0.25)' },
  { fill: 'rgba(117, 81, 233, 0.5)',   stroke: 'rgba(117, 81, 233, 0.9)',  glow: 'rgba(117, 81, 233, 0.25)' },
  { fill: 'rgba(255, 181, 71, 0.5)',   stroke: 'rgba(255, 181, 71, 0.9)',  glow: 'rgba(255, 181, 71, 0.25)' },
  { fill: 'rgba(56, 189, 248, 0.5)',   stroke: 'rgba(56, 189, 248, 0.9)',  glow: 'rgba(56, 189, 248, 0.25)' },
  { fill: 'rgba(251, 113, 133, 0.5)',  stroke: 'rgba(251, 113, 133, 0.9)', glow: 'rgba(251, 113, 133, 0.25)' },
  { fill: 'rgba(250, 204, 21, 0.5)',   stroke: 'rgba(250, 204, 21, 0.9)',  glow: 'rgba(250, 204, 21, 0.25)' },
  { fill: 'rgba(192, 132, 252, 0.5)',  stroke: 'rgba(192, 132, 252, 0.9)', glow: 'rgba(192, 132, 252, 0.25)' },
  { fill: 'rgba(52, 211, 153, 0.5)',   stroke: 'rgba(52, 211, 153, 0.9)',  glow: 'rgba(52, 211, 153, 0.25)' },
];

interface PetalChartProps {
  data: { name: string; amount: number }[];
  isMobile: boolean;
}

const PetalChart = ({ data, isMobile }: PetalChartProps) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });
  const svgRef = useRef<SVGSVGElement>(null);

  const size = isMobile ? 260 : 360;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = isMobile ? 100 : 140;
  const minR = 18;
  const n = data.length;
  const maxVal = Math.max(...data.map(d => d.amount), 1);

  const formatAmount = (v: number) => {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' млн ₽';
    if (v >= 1_000) return (v / 1_000).toFixed(0) + ' тыс ₽';
    return new Intl.NumberFormat('ru-RU').format(v) + ' ₽';
  };

  const petalPath = (index: number, r: number) => {
    const angleStep = (2 * Math.PI) / n;
    const angle = angleStep * index - Math.PI / 2;
    const spread = angleStep * 0.72;

    const tipX = cx + r * Math.cos(angle);
    const tipY = cy + r * Math.sin(angle);

    const leftAngle = angle - spread / 2;
    const rightAngle = angle + spread / 2;

    const cp1X = cx + (r * 0.55) * Math.cos(leftAngle);
    const cp1Y = cy + (r * 0.55) * Math.sin(leftAngle);
    const cp2X = cx + (r * 0.55) * Math.cos(rightAngle);
    const cp2Y = cy + (r * 0.55) * Math.sin(rightAngle);

    const baseLeft = {
      x: cx + minR * Math.cos(leftAngle),
      y: cy + minR * Math.sin(leftAngle),
    };
    const baseRight = {
      x: cx + minR * Math.cos(rightAngle),
      y: cy + minR * Math.sin(rightAngle),
    };

    return [
      `M ${baseLeft.x} ${baseLeft.y}`,
      `C ${cp1X} ${cp1Y}, ${tipX - (tipX - cp1X) * 0.1} ${tipY - (tipY - cp1Y) * 0.1}, ${tipX} ${tipY}`,
      `C ${tipX - (tipX - cp2X) * 0.1} ${tipY - (tipY - cp2Y) * 0.1}, ${cp2X} ${cp2Y}, ${baseRight.x} ${baseRight.y}`,
      `A ${minR} ${minR} 0 0 0 ${baseLeft.x} ${baseLeft.y}`,
      'Z',
    ].join(' ');
  };

  const labelPos = (index: number, r: number) => {
    const angleStep = (2 * Math.PI) / n;
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setTooltip(prev => ({ ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top }));
  };

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { setHovered(null); setTooltip(t => ({ ...t, visible: false })); }}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {data.map((_, i) => {
            const color = PALETTE[i % PALETTE.length];
            return (
              <radialGradient key={i} id={`grad-${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={color.stroke} stopOpacity="0.15" />
                <stop offset="100%" stopColor={color.fill} stopOpacity="1" />
              </radialGradient>
            );
          })}
          <filter id="glow-petal" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Центральный круг */}
        <circle cx={cx} cy={cy} r={minR + 2} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth={1} />
        <circle cx={cx} cy={cy} r={4} fill="rgba(255,255,255,0.3)" />

        {/* Лепестки */}
        {data.map((item, i) => {
          const ratio = item.amount / maxVal;
          const r = minR + (maxR - minR) * Math.pow(ratio, 0.55);
          const color = PALETTE[i % PALETTE.length];
          const isHov = hovered === i;

          return (
            <g key={i}
              onMouseEnter={() => { setHovered(i); setTooltip(t => ({ ...t, visible: true })); }}
              style={{ cursor: 'pointer' }}
            >
              {/* Glow под лепестком */}
              {isHov && (
                <path
                  d={petalPath(i, r + 8)}
                  fill={color.glow}
                  filter="url(#glow-petal)"
                  opacity={0.8}
                />
              )}
              <path
                d={petalPath(i, isHov ? r + 5 : r)}
                fill={`url(#grad-${i})`}
                stroke={color.stroke}
                strokeWidth={isHov ? 2 : 1.2}
                style={{ transition: 'all 0.25s ease' }}
                opacity={hovered !== null && !isHov ? 0.35 : 1}
              />
            </g>
          );
        })}

        {/* Подписи */}
        {data.map((item, i) => {
          const ratio = item.amount / maxVal;
          const r = minR + (maxR - minR) * Math.pow(ratio, 0.55);
          const labelR = r + (isMobile ? 22 : 26);
          const pos = labelPos(i, labelR);
          const color = PALETTE[i % PALETTE.length];
          const isHov = hovered === i;

          const short = item.name.length > 12 ? item.name.slice(0, 11) + '…' : item.name;

          return (
            <text
              key={i}
              x={pos.x}
              y={pos.y}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: isMobile ? '10px' : '12px',
                fontWeight: isHov ? '800' : '600',
                fill: isHov ? color.stroke : 'rgba(255,255,255,0.7)',
                transition: 'all 0.2s',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {short}
            </text>
          );
        })}
      </svg>

      {/* Tooltip */}
      {tooltip.visible && hovered !== null && (
        <div style={{
          position: 'absolute',
          left: tooltip.x + 14,
          top: tooltip.y - 36,
          background: 'rgba(10, 14, 40, 0.97)',
          border: `1px solid ${PALETTE[hovered % PALETTE.length].stroke}`,
          borderRadius: '10px',
          padding: '8px 14px',
          pointerEvents: 'none',
          zIndex: 10,
          whiteSpace: 'nowrap',
          boxShadow: `0 4px 20px ${PALETTE[hovered % PALETTE.length].glow}`,
        }}>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', marginBottom: '2px' }}>
            {data[hovered].name}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: PALETTE[hovered % PALETTE.length].stroke }}>
            {formatAmount(data[hovered].amount)}
          </div>
        </div>
      )}
    </div>
  );
};

const Dashboard2TeamPerformance = () => {
  const { period, getDateRange } = usePeriod();
  const [currentData, setCurrentData] = useState<{ name: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`${API_ENDPOINTS.main}?endpoint=payments`);
        const data = await response.json();
        const { from, to } = getDateRange();

        const filtered = (Array.isArray(data) ? data : []).filter((p: PaymentRecord) => {
          if (p.status !== 'approved') return false;
          const d = new Date(p.payment_date);
          return d >= from && d <= to;
        });

        const deptMap: { [key: string]: number } = {};
        filtered.forEach((payment: PaymentRecord) => {
          const dept = payment.department_name || 'Без отдела';
          deptMap[dept] = (deptMap[dept] || 0) + payment.amount;
        });

        const sorted = Object.entries(deptMap)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount);

        setCurrentData(sorted);
      } catch (error) {
        console.error('Failed to fetch department data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentData();
  }, [period, getDateRange]);

  const formatAmount = (v: number) => new Intl.NumberFormat('ru-RU').format(v) + ' ₽';

  return (
    <Card style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <CardContent className="p-4 sm:p-6">
        <div style={{ marginBottom: '16px' }}>
          <h3 className="text-base sm:text-lg" style={{ fontWeight: '700', color: 'hsl(var(--foreground))' }}>
            Сравнение по Отделам-Заказчикам
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[200px] sm:h-[350px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
          </div>
        ) : currentData.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] sm:h-[350px]">
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>Нет данных за выбранный период</p>
          </div>
        ) : (
          <>
            <PetalChart data={currentData} isMobile={isMobile} />

            {/* Топ-3 */}
            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(1, 181, 116, 0.07)', borderRadius: '12px', border: '1px solid rgba(1, 181, 116, 0.18)' }}>
              <h4 style={{ fontSize: isMobile ? '13px' : '14px', fontWeight: '800', color: 'hsl(var(--foreground))', marginBottom: '12px' }}>
                Топ-3 Отделов по Затратам
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentData.slice(0, 3).map((dept, index) => {
                  const color = PALETTE[index % PALETTE.length];
                  return (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      border: `1px solid ${color.glow}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          fontSize: isMobile ? '16px' : '18px',
                          fontWeight: '700',
                          color: color.stroke,
                          minWidth: '24px',
                        }}>{index + 1}</span>
                        <span style={{ fontSize: isMobile ? '12px' : '13px', color: 'hsl(var(--foreground))', fontWeight: '600' }}>
                          {dept.name}
                        </span>
                      </div>
                      <span style={{ fontSize: isMobile ? '14px' : '16px', color: color.stroke, fontWeight: '800' }}>
                        {formatAmount(dept.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard2TeamPerformance;
