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
const GAP_DEG = 4;

interface PetalChartProps {
  data: { name: string; amount: number }[];
  isMobile: boolean;
}

const PetalChart = ({ data, isMobile }: PetalChartProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const size   = isMobile ? 300 : 420;
  const cx     = size / 2;
  const cy     = size / 2;
  const innerR = isMobile ? 36 : 50;
  const outerR = isMobile ? 122 : 168;

  const maxVal = Math.max(...data.map(d => d.amount), 1);

  const fmt = (v: number) => {
    if (v >= 1_000_000) return [(v / 1_000_000).toFixed(1), 'млн ₽'];
    if (v >= 1_000)     return [String(Math.round(v / 1_000)), 'тыс ₽'];
    return [String(Math.round(v)), '₽'];
  };

  const shortName = (s: string) => s.length > 11 ? s.slice(0, 10) + '…' : s;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  /* Один сегмент: дуга от innerR до r, с скруглёнными внешними углами */
  const segmentD = (idx: number, r: number, gap = GAP_DEG) => {
    const total    = 360 / SLOTS;
    const startDeg = total * idx - 90 + gap / 2;
    const endDeg   = total * (idx + 1) - 90 - gap / 2;
    const sR = toRad(startDeg);
    const eR = toRad(endDeg);

    const cr = Math.min(isMobile ? 10 : 14, (r - innerR) * 0.35);

    // Точки на внешней дуге с небольшим отступом для скругления
    const anglePad = Math.asin(cr / r);
    const oSx = cx + r * Math.cos(sR + anglePad);
    const oSy = cy + r * Math.sin(sR + anglePad);
    const oEx = cx + r * Math.cos(eR - anglePad);
    const oEy = cy + r * Math.sin(eR - anglePad);

    // Точки на внутренней дуге с отступом
    const innerAnglePad = Math.asin(Math.min(cr / innerR, 1));
    const iSx = cx + innerR * Math.cos(sR + innerAnglePad);
    const iSy = cy + innerR * Math.sin(sR + innerAnglePad);
    const iEx = cx + innerR * Math.cos(eR - innerAnglePad);
    const iEy = cy + innerR * Math.sin(eR - innerAnglePad);

    // Углы — касательные точки на боковых прямых
    const lS = { x: cx + innerR * Math.cos(sR), y: cy + innerR * Math.sin(sR) };
    const lE = { x: cx + innerR * Math.cos(eR), y: cy + innerR * Math.sin(eR) };
    const rS = { x: cx + r * Math.cos(sR),      y: cy + r * Math.sin(sR) };
    const rE = { x: cx + r * Math.cos(eR),       y: cy + r * Math.sin(eR) };

    const largeArc = (endDeg - startDeg) > 180 ? 1 : 0;

    return [
      `M ${iSx} ${iSy}`,
      `L ${oSx} ${oSy}`,
      `Q ${rS.x} ${rS.y} ${oSx} ${oSy}`,   // скругление левый внешний
      `A ${r} ${r} 0 ${largeArc} 1 ${oEx} ${oEy}`,
      `Q ${rE.x} ${rE.y} ${iEx} ${iEy}`,   // скругление правый внешний
      `L ${iEx} ${iEy}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${iSx} ${iSy}`,
      'Z',
    ].join(' ');
  };

  const labelPos = (idx: number, r: number) => {
    const total    = 360 / SLOTS;
    const midDeg   = total * idx - 90 + total / 2;
    const midRad   = toRad(midDeg);
    const dist     = innerR + (r - innerR) * 0.55;
    return { x: cx + dist * Math.cos(midRad), y: cy + dist * Math.sin(midRad) };
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
            <radialGradient
              key={idx}
              id={`rg-${idx}`}
              gradientUnits="userSpaceOnUse"
              cx={cx} cy={cy} r={outerR}
            >
              <stop offset="0%"   stopColor={color.solid} stopOpacity="0.1" />
              <stop offset="100%" stopColor={color.solid} stopOpacity="0.75" />
            </radialGradient>
          ))}
          <filter id="seg-shadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0,0,0,0.4)" />
          </filter>
          <filter id="seg-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="7" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Фоновые слоты */}
        {slots.map(({ idx, color }) => (
          <path
            key={`bg-${idx}`}
            d={segmentD(idx, outerR)}
            fill={color.light}
            stroke={`${color.solid}18`}
            strokeWidth={1}
          />
        ))}

        {/* Заполненные сегменты */}
        {slots.map(({ idx, item, color }) => {
          if (!item) return null;
          const ratio = item.amount / maxVal;
          const r     = innerR + (outerR - innerR) * Math.pow(ratio, 0.55);
          const isHov = hovered === idx;

          return (
            <g key={`seg-${idx}`}>
              {isHov && (
                <path
                  d={segmentD(idx, r + 8)}
                  fill={color.mid}
                  filter="url(#seg-glow)"
                  opacity={0.55}
                  style={{ pointerEvents: 'none' }}
                />
              )}
              <path
                d={segmentD(idx, isHov ? r + 5 : r)}
                fill={`url(#rg-${idx})`}
                stroke={color.solid}
                strokeWidth={isHov ? 2 : 1}
                strokeLinejoin="round"
                filter="url(#seg-shadow)"
                style={{ transition: 'all 0.22s ease', cursor: 'pointer' }}
                opacity={hovered !== null && !isHov ? 0.22 : 1}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              />
            </g>
          );
        })}

        {/* Текст внутри сегментов */}
        {slots.map(({ idx, item, color }) => {
          if (!item) return null;
          const ratio  = item.amount / maxVal;
          const r      = innerR + (outerR - innerR) * Math.pow(ratio, 0.55);
          const pos    = labelPos(idx, r);
          const isHov  = hovered === idx;
          const [val, unit] = fmt(item.amount);
          const name   = shortName(item.name);
          const fs     = isMobile ? 9 : 11;

          return (
            <g
              key={`lbl-${idx}`}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
              opacity={hovered !== null && !isHov ? 0.18 : 1}
            >
              <text x={pos.x} y={pos.y - (isMobile ? 10 : 13)}
                textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: `${fs}px`, fontWeight: 600, fill: isHov ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                {name}
              </text>
              <text x={pos.x} y={pos.y + (isMobile ? 1 : 2)}
                textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: `${fs + 2}px`, fontWeight: 800, fill: isHov ? '#fff' : color.solid }}>
                {val}
              </text>
              <text x={pos.x} y={pos.y + (isMobile ? 11 : 15)}
                textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: `${fs - 1}px`, fontWeight: 500, fill: isHov ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)' }}>
                {unit}
              </text>
            </g>
          );
        })}

        {/* Центральный круг */}
        <circle cx={cx} cy={cy} r={innerR - 2}
          fill="hsl(var(--card))"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={2}
        />
        <circle cx={cx} cy={cy} r={6} fill="rgba(255,255,255,0.15)" />
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