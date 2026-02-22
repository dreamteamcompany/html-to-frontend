import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
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
  { solid: '#01b574', light: 'rgba(1,181,116,0.18)',   mid: 'rgba(1,181,116,0.55)'   },
  { solid: '#7551e9', light: 'rgba(117,81,233,0.18)',  mid: 'rgba(117,81,233,0.55)'  },
  { solid: '#ffb547', light: 'rgba(255,181,71,0.18)',  mid: 'rgba(255,181,71,0.55)'  },
  { solid: '#38bdf8', light: 'rgba(56,189,248,0.18)',  mid: 'rgba(56,189,248,0.55)'  },
  { solid: '#fb7185', light: 'rgba(251,113,133,0.18)', mid: 'rgba(251,113,133,0.55)' },
  { solid: '#facc15', light: 'rgba(250,204,21,0.18)',  mid: 'rgba(250,204,21,0.55)'  },
  { solid: '#c084fc', light: 'rgba(192,132,252,0.18)', mid: 'rgba(192,132,252,0.55)' },
  { solid: '#34d399', light: 'rgba(52,211,153,0.18)',  mid: 'rgba(52,211,153,0.55)'  },
];

const SLOTS = 8;

interface PetalChartProps {
  data: { name: string; amount: number }[];
  isMobile: boolean;
}

const PetalChart = ({ data, isMobile }: PetalChartProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const size = isMobile ? 300 : 420;
  const cx = size / 2;
  const cy = size / 2;
  const innerR = isMobile ? 32 : 44;
  const outerR = isMobile ? 118 : 162;
  const angleStep = (2 * Math.PI) / SLOTS;
  const halfSpread = angleStep * 0.38;
  const cornerR = isMobile ? 14 : 20;

  const maxVal = Math.max(...data.map(d => d.amount), 1);

  const fmt = (v: number) => {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + '\nмлн ₽';
    if (v >= 1_000) return Math.round(v / 1_000) + '\nтыс ₽';
    return String(Math.round(v)) + '\n₽';
  };

  const shortName = (s: string) => s.length > 10 ? s.slice(0, 9) + '…' : s;

  const petalD = (idx: number, r: number) => {
    const midAngle = angleStep * idx - Math.PI / 2;
    const leftAngle = midAngle - halfSpread;
    const rightAngle = midAngle + halfSpread;

    const tip = { x: cx + r * Math.cos(midAngle), y: cy + r * Math.sin(midAngle) };
    const bl  = { x: cx + innerR * Math.cos(leftAngle),  y: cy + innerR * Math.sin(leftAngle) };
    const br  = { x: cx + innerR * Math.cos(rightAngle), y: cy + innerR * Math.sin(rightAngle) };

    const leftEdge  = { x: cx + r * Math.cos(leftAngle),  y: cy + r * Math.sin(leftAngle) };
    const rightEdge = { x: cx + r * Math.cos(rightAngle), y: cy + r * Math.sin(rightAngle) };

    return [
      `M ${bl.x} ${bl.y}`,
      `L ${leftEdge.x} ${leftEdge.y}`,
      `Q ${tip.x} ${tip.y} ${rightEdge.x} ${rightEdge.y}`,
      `L ${br.x} ${br.y}`,
      `A ${innerR} ${innerR} 0 0 0 ${bl.x} ${bl.y}`,
      'Z',
    ].join(' ');
  };

  const labelCenter = (idx: number, r: number) => {
    const midAngle = angleStep * idx - Math.PI / 2;
    const dist = innerR + (r - innerR) * 0.58;
    return {
      x: cx + dist * Math.cos(midAngle),
      y: cy + dist * Math.sin(midAngle),
    };
  };

  const slots = Array.from({ length: SLOTS }, (_, i) => ({
    idx: i,
    item: data[i] ?? null,
    color: PALETTE[i % PALETTE.length],
  }));

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {slots.map(({ idx, color }) => (
            <radialGradient key={idx} id={`pg-${idx}`} cx="50%" cy="50%" r="50%"
              gradientUnits="userSpaceOnUse"
              fx={cx} fy={cy} cx2={cx} cy2={cy} r2={outerR}
            >
              <stop offset="0%"   stopColor={color.solid} stopOpacity="0.08" />
              <stop offset="100%" stopColor={color.solid} stopOpacity="0.72" />
            </radialGradient>
          ))}
          <filter id="pshadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.25" />
          </filter>
          <filter id="pglow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Фоновые пустые слоты */}
        {slots.map(({ idx, color }) => (
          <path
            key={`bg-${idx}`}
            d={petalD(idx, outerR)}
            fill={color.light}
            stroke={`${color.solid}22`}
            strokeWidth={1}
          />
        ))}

        {/* Заполненные лепестки */}
        {slots.map(({ idx, item, color }) => {
          if (!item) return null;
          const ratio = item.amount / maxVal;
          const r = innerR + (outerR - innerR) * Math.pow(ratio, 0.5);
          const isHov = hovered === idx;

          return (
            <g key={`petal-${idx}`}>
              {isHov && (
                <path
                  d={petalD(idx, r + 6)}
                  fill={color.mid}
                  filter="url(#pglow)"
                  opacity={0.6}
                />
              )}
              <path
                d={petalD(idx, isHov ? r + 4 : r)}
                fill={`url(#pg-${idx})`}
                stroke={color.solid}
                strokeWidth={isHov ? 2 : 1.2}
                filter="url(#pshadow)"
                style={{ transition: 'all 0.22s ease', cursor: 'pointer' }}
                opacity={hovered !== null && !isHov ? 0.28 : 1}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          );
        })}

        {/* Текст внутри лепестков */}
        {slots.map(({ idx, item, color }) => {
          if (!item) return null;
          const ratio = item.amount / maxVal;
          const r = innerR + (outerR - innerR) * Math.pow(ratio, 0.5);
          const pos = labelCenter(idx, r);
          const isHov = hovered === idx;
          const lines = fmt(item.amount).split('\n');
          const nameStr = shortName(item.name);

          return (
            <g
              key={`lbl-${idx}`}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
              opacity={hovered !== null && !isHov ? 0.25 : 1}
            >
              <text
                x={pos.x}
                y={pos.y - (isMobile ? 11 : 14)}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: isMobile ? '9px' : '11px',
                  fontWeight: 700,
                  fill: isHov ? '#fff' : 'rgba(255,255,255,0.75)',
                  transition: 'fill 0.2s',
                }}
              >
                {nameStr}
              </text>
              <text
                x={pos.x}
                y={pos.y + (isMobile ? 1 : 2)}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: isMobile ? '10px' : '13px',
                  fontWeight: 800,
                  fill: isHov ? '#fff' : color.solid,
                  transition: 'fill 0.2s',
                }}
              >
                {lines[0]}
              </text>
              <text
                x={pos.x}
                y={pos.y + (isMobile ? 12 : 16)}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontSize: isMobile ? '9px' : '11px',
                  fontWeight: 600,
                  fill: isHov ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)',
                  transition: 'fill 0.2s',
                }}
              >
                {lines[1]}
              </text>
            </g>
          );
        })}

        {/* Центральный круг */}
        <circle cx={cx} cy={cy} r={innerR - 1} fill="hsl(var(--card))" stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={5} fill="rgba(255,255,255,0.2)" />
      </svg>
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
          .sort((a, b) => b.amount - a.amount)
          .slice(0, SLOTS);

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
        <div style={{ marginBottom: '20px' }}>
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
            <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(1,181,116,0.07)', borderRadius: '12px', border: '1px solid rgba(1,181,116,0.18)' }}>
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
                      border: `1px solid ${color.light}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: color.solid, minWidth: '24px' }}>
                          {index + 1}
                        </span>
                        <span style={{ fontSize: isMobile ? '12px' : '13px', color: 'hsl(var(--foreground))', fontWeight: '600' }}>
                          {dept.name}
                        </span>
                      </div>
                      <span style={{ fontSize: isMobile ? '14px' : '16px', color: color.solid, fontWeight: '800' }}>
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
