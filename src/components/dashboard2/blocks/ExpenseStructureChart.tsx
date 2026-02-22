import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { usePeriod } from '@/contexts/PeriodContext';

interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  category_name?: string;
  [key: string]: unknown;
}

interface CategoryData {
  name: string;
  value: number;
  amount: number;
  color: string;
}

const ARC_PALETTE = [
  ['#ff9a3c', '#ffb547', '#ffd080'],
  ['#ff6b6b', '#ff8e53', '#ffa07a'],
  ['#7551e9', '#9b7ff5', '#c084fc'],
  ['#01b574', '#38d399', '#6ee7b7'],
  ['#38bdf8', '#60cef8', '#93e0fc'],
  ['#facc15', '#fde047', '#fef08a'],
  ['#fb7185', '#f472b6', '#e879a4'],
  ['#34d399', '#10b981', '#059669'],
];

const activeStyle = {
  background: '#7551e9',
  border: 'none',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600' as const,
  boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)',
};

const getInactiveStyle = () => ({
  background: 'transparent',
  border: 'none',
  color: 'hsl(var(--muted-foreground))',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600' as const,
});

interface RingChartProps {
  categories: CategoryData[];
  totalAmount: number;
  isMobile: boolean;
}

const RingChart = ({ categories, totalAmount, isMobile }: RingChartProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const maxRings   = Math.min(categories.length, 8);
  const ringThick  = isMobile ? 10 : 14;
  const ringGap    = isMobile ? 7 : 9;
  // innerR — радиус тёмного центрального круга
  const innerR     = isMobile ? 58 : 82;
  // Все дуги начинаются от левой точки центра (как на картинке — "веер вправо")
  // startDeg = 180 (левая точка), дуга идёт по часовой вправо
  const START_DEG  = 180;

  const outerR = innerR + maxRings * (ringThick + ringGap);

  // SVG: центр диаграммы посередине слева, подписи справа
  const pad       = isMobile ? 10 : 16;
  const labelW    = isMobile ? 150 : 210;
  const totalW    = outerR * 2 + pad * 2 + labelW;
  const rowH      = isMobile ? 34 : 44;
  const totalH    = Math.max(outerR * 2 + pad * 2, maxRings * rowH + pad * 2);
  const cx        = outerR + pad;
  const cy        = totalH / 2;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  // Дуга по часовой: startDeg → endDeg (в градусах, 0 = правый, 90 = низ)
  const arcPath = (r: number, startDeg: number, endDeg: number) => {
    const s = toRad(startDeg);
    const e = toRad(endDeg);
    const x1 = cx + r * Math.cos(s);
    const y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e);
    const y2 = cy + r * Math.sin(e);
    const large = (endDeg - startDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };

  const fmt = (v: number) => {
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' млн ₽';
    if (v >= 1_000) return Math.round(v / 1_000) + ' тыс ₽';
    return new Intl.NumberFormat('ru-RU').format(v) + ' ₽';
  };

  const rings = categories.slice(0, maxRings).map((cat, i) => {
    const r       = innerR + i * (ringThick + ringGap) + ringThick / 2;
    const ratio   = cat.amount / (categories[0]?.amount || 1);
    // Максимальная дуга = 180° (полукруг вправо), минимум 20°
    const arcDeg  = Math.max(20, ratio * 180);
    const endDeg  = START_DEG + arcDeg; // по часовой от 180°
    const palette = ARC_PALETTE[i % ARC_PALETTE.length];
    return { cat, i, r, startDeg: START_DEG, endDeg, arcDeg, palette };
  });

  // Равномерные Y-позиции подписей справа
  const labelsTop = cy - (maxRings * rowH) / 2 + rowH / 2;
  const markerR   = isMobile ? 11 : 14;
  const connX     = cx + outerR + pad;     // начало горизонтальной полки
  const markerCX  = connX + markerR + 2;   // центр маркера

  return (
    <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto' }}>
      <svg
        width={totalW}
        height={totalH}
        viewBox={`0 0 ${totalW} ${totalH}`}
        style={{ overflow: 'visible', maxWidth: '100%' }}
      >
        <defs>
          {rings.map(({ i, palette }) => (
            <radialGradient key={i} id={`arc-rg-${i}`}
              gradientUnits="userSpaceOnUse"
              cx={cx} cy={cy} r={rings[i]?.r ?? innerR}
            >
              <stop offset="0%"  stopColor={palette[0]} stopOpacity="0.6" />
              <stop offset="100%" stopColor={palette[1]} stopOpacity="1" />
            </radialGradient>
          ))}
          <filter id="arc-glow2" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Тёмный центральный круг — поверх всего в конце */}

        {/* Фоновые полукольца (серые) */}
        {rings.map(({ i, r }) => (
          <path
            key={`bg-${i}`}
            d={arcPath(r, START_DEG, START_DEG + 180)}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={ringThick}
            strokeLinecap="round"
          />
        ))}

        {/* Цветные дуги */}
        {rings.map(({ i, r, startDeg, endDeg, palette }) => {
          const isHov = hovered === i;
          return (
            <path
              key={`arc-${i}`}
              d={arcPath(r, startDeg, endDeg)}
              fill="none"
              stroke={`url(#arc-rg-${i})`}
              strokeWidth={isHov ? ringThick + 5 : ringThick}
              strokeLinecap="round"
              filter={isHov ? 'url(#arc-glow2)' : undefined}
              style={{ transition: 'stroke-width 0.2s', cursor: 'pointer', opacity: hovered !== null && !isHov ? 0.2 : 1 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        {/* Центральный тёмный круг */}
        <circle cx={cx} cy={cy} r={innerR - 2}
          fill="hsl(var(--card))"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1.5}
        />
        {/* Текст в центре */}
        <text x={cx} y={cy - (isMobile ? 12 : 16)}
          textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: `${isMobile ? 9 : 11}px`, fontWeight: 600, fill: 'rgba(255,255,255,0.45)', letterSpacing: '0.5px' }}>
          СТРУКТУРА
        </text>
        <text x={cx} y={cy + (isMobile ? 2 : 2)}
          textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: `${isMobile ? 13 : 17}px`, fontWeight: 900, fill: '#ffffff' }}>
          {fmt(totalAmount)}
        </text>
        <text x={cx} y={cy + (isMobile ? 17 : 22)}
          textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: `${isMobile ? 8 : 10}px`, fontWeight: 500, fill: 'rgba(255,255,255,0.35)' }}>
          {categories.length} {categories.length < 5 ? 'категории' : 'категорий'}
        </text>

        {/* Коннекторы и подписи справа — равномерно */}
        {rings.map(({ i, r, endDeg, cat, palette }) => {
          const isHov  = hovered === i;
          const labelY = labelsTop + i * rowH;
          const num    = String(i + 1).padStart(2, '0');

          // Точка конца дуги
          const eRad  = toRad(endDeg);
          const tipX  = cx + (r + ringThick / 2 + 3) * Math.cos(eRad);
          const tipY  = cy + (r + ringThick / 2 + 3) * Math.sin(eRad);

          return (
            <g key={`lbl-${i}`} style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              opacity={hovered !== null && !isHov ? 0.2 : 1}
            >
              {/* Диагональная линия от конца дуги */}
              <line
                x1={tipX} y1={tipY}
                x2={connX} y2={labelY}
                stroke={palette[1]}
                strokeWidth={isHov ? 1.5 : 1}
                strokeOpacity={0.55}
              />
              {/* Горизонтальный усик */}
              <line
                x1={connX} y1={labelY}
                x2={markerCX - markerR - 2} y2={labelY}
                stroke={palette[1]}
                strokeWidth={isHov ? 1.5 : 1}
                strokeOpacity={0.55}
              />
              {/* Маркер */}
              <circle cx={markerCX} cy={labelY} r={markerR}
                fill={isHov ? palette[1] : palette[0]}
                fillOpacity={isHov ? 1 : 0.85}
                stroke={palette[1]}
                strokeWidth={1.5}
              />
              <text x={markerCX} y={labelY}
                textAnchor="middle" dominantBaseline="middle"
                style={{ fontSize: `${isMobile ? 8 : 10}px`, fontWeight: 900, fill: '#fff', pointerEvents: 'none', userSelect: 'none' }}>
                {num}
              </text>
              {/* Подпись */}
              <text
                x={markerCX + markerR + (isMobile ? 5 : 7)}
                y={labelY - (isMobile ? 5 : 6)}
                textAnchor="start" dominantBaseline="middle"
                style={{ fontSize: `${isMobile ? 9 : 12}px`, fontWeight: 700, fill: '#ffffff', pointerEvents: 'none', userSelect: 'none' }}>
                {cat.name}
              </text>
              <text
                x={markerCX + markerR + (isMobile ? 5 : 7)}
                y={labelY + (isMobile ? 7 : 9)}
                textAnchor="start" dominantBaseline="middle"
                style={{ fontSize: `${isMobile ? 8 : 10}px`, fontWeight: 500, fill: palette[1], pointerEvents: 'none', userSelect: 'none' }}>
                {cat.value}% · {fmt(cat.amount)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

const ExpenseStructureChart = () => {
  const { period, getDateRange } = usePeriod();
  const [activeTab, setActiveTab] = useState<'general' | 'details'>('general');
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchExpenseStructure = async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`${API_ENDPOINTS.main}?endpoint=payments`);
        if (controller.signal.aborted) return;
        const data = await response.json();
        const { from, to } = getDateRange();

        const filtered = (Array.isArray(data) ? data : []).filter((p: PaymentRecord) => {
          if (p.status !== 'approved') return false;
          const d = new Date(p.payment_date);
          return d >= from && d <= to;
        });

        const categoryMap: Record<string, number> = {};
        let total = 0;
        filtered.forEach((payment: PaymentRecord) => {
          const name = payment.category_name || 'Прочее';
          categoryMap[name] = (categoryMap[name] || 0) + payment.amount;
          total += payment.amount;
        });

        const categoriesData = Object.entries(categoryMap)
          .map(([name, amount], index) => ({
            name,
            amount,
            value: total > 0 ? Math.round((amount / total) * 100) : 0,
            color: ARC_PALETTE[index % ARC_PALETTE.length][1],
          }))
          .sort((a, b) => b.amount - a.amount);

        setCategories(categoriesData);
        setTotalAmount(total);
      } catch (error) {
        if (!controller.signal.aborted) console.error('Failed to fetch expense structure:', error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchExpenseStructure();
    return () => controller.abort();
  }, [period, getDateRange]);

  return (
    <Card style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
      <CardContent className="p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Структура Расходов</h3>
          <div style={{ display: 'flex', gap: '8px', background: 'hsl(var(--muted))', padding: '4px', borderRadius: '10px' }}>
            <button style={activeTab === 'general' ? activeStyle : getInactiveStyle()} onClick={() => setActiveTab('general')}>
              Общие
            </button>
            <button style={activeTab === 'details' ? activeStyle : getInactiveStyle()} onClick={() => setActiveTab('details')}>
              Детали
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center h-[300px]">
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>Нет данных за выбранный период</p>
          </div>
        ) : activeTab === 'general' ? (
          <RingChart categories={categories} totalAmount={totalAmount} isMobile={isMobile} />
        ) : (
          <div className="h-[300px] sm:h-[450px]" style={{ overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: 'hsl(var(--muted-foreground))', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Категория</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', color: 'hsl(var(--muted-foreground))', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Доля</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', color: 'hsl(var(--muted-foreground))', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                        <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '500' }}>{cat.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '14px 12px' }}>
                      <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: '600' }}>{cat.value}%</span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '14px 12px' }}>
                      <span style={{ color: '#ffffff', fontSize: '14px' }}>{new Intl.NumberFormat('ru-RU').format(cat.amount)} ₽</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: '16px', padding: '14px 12px', background: 'rgba(117, 81, 233, 0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', fontWeight: '500' }}>Итого</span>
              <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: '700' }}>
                {new Intl.NumberFormat('ru-RU').format(totalAmount)} ₽
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseStructureChart;