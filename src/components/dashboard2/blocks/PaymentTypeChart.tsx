import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { usePeriod } from '@/contexts/PeriodContext';
import { dashboardTypography } from '../dashboardStyles';

interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  payment_type?: string;
  legal_entity_id?: number;
  legal_entity_name?: string;
  [key: string]: unknown;
}

const fmt = (v: number) => {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' млн ₽';
  if (v >= 1_000) return Math.round(v / 1_000) + ' тыс ₽';
  return new Intl.NumberFormat('ru-RU').format(v) + ' ₽';
};

const PaymentTypeChart = () => {
  const { period, getDateRange } = usePeriod();
  const [cashAmount, setCashAmount] = useState(0);
  const [cashCount, setCashCount] = useState(0);
  const [legalAmount, setLegalAmount] = useState(0);
  const [legalCount, setLegalCount] = useState(0);
  const [topLegal, setTopLegal] = useState<{ name: string; amount: number }[]>([]);
  const [topCash, setTopCash] = useState<{ name: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState<'cash' | 'legal' | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
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

        let cash = 0, cashCnt = 0, legal = 0, legalCnt = 0;
        const legalByEntity: Record<string, number> = {};
        const cashByEntity: Record<string, number> = {};

        filtered.forEach((p: PaymentRecord) => {
          const entityName = p.legal_entity_name || 'Не указано';
          if (p.payment_type === 'cash') {
            cash += p.amount;
            cashCnt++;
            cashByEntity[entityName] = (cashByEntity[entityName] || 0) + p.amount;
          } else {
            legal += p.amount;
            legalCnt++;
            legalByEntity[entityName] = (legalByEntity[entityName] || 0) + p.amount;
          }
        });

        setCashAmount(cash);
        setCashCount(cashCnt);
        setLegalAmount(legal);
        setLegalCount(legalCnt);

        const sortEntries = (obj: Record<string, number>) =>
          Object.entries(obj)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 3);

        setTopLegal(sortEntries(legalByEntity));
        setTopCash(sortEntries(cashByEntity));
      } catch (err) {
        if (!controller.signal.aborted) console.error('PaymentTypeChart error:', err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [period, getDateRange]);

  const total = cashAmount + legalAmount;
  const legalPct = total > 0 ? (legalAmount / total) * 100 : 0;
  const cashPct = total > 0 ? (cashAmount / total) * 100 : 0;

  // SVG donut parameters
  const cx = 80, cy = 80, r = 62, stroke = 18;
  const circ = 2 * Math.PI * r;

  const legalDash = total > 0 ? (legalAmount / total) * circ : 0;
  const cashDash = total > 0 ? (cashAmount / total) * circ : 0;
  const legalOffset = 0;
  const cashOffset = -(legalDash);
  const gap = 4;

  return (
    <Card
      className="h-full"
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderTop: '4px solid #3965ff',
      }}
    >
      <CardContent className="p-4 sm:p-6 h-full flex flex-col">
        <div className="mb-4">
          <h3 className={`${dashboardTypography.cardTitle} mb-1`}>Тип расчётов</h3>
          <p className={dashboardTypography.cardSubtitle}>Наличные vs Безналичные</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center flex-1 min-h-[160px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
          </div>
        ) : total === 0 ? (
          <div className="flex items-center justify-center flex-1 min-h-[160px]">
            <p className={dashboardTypography.cardSubtitle}>Нет данных за выбранный период</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1">
            {/* Donut chart */}
            <div className="relative flex-shrink-0 hidden sm:flex justify-center">
              <svg width={160} height={160} viewBox="0 0 160 160">
                <defs>
                  <linearGradient id="pt-legal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3965ff" />
                    <stop offset="100%" stopColor="#7551e9" />
                  </linearGradient>
                  <linearGradient id="pt-cash-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#01b574" />
                    <stop offset="100%" stopColor="#38d399" />
                  </linearGradient>
                  <filter id="pt-glow">
                    <feGaussianBlur stdDeviation="3" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>

                {/* Background track */}
                <circle
                  cx={cx} cy={cy} r={r}
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={stroke}
                />

                {/* Legal arc */}
                {legalAmount > 0 && (
                  <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke="url(#pt-legal-grad)"
                    strokeWidth={hovered === 'legal' ? stroke + 4 : stroke}
                    strokeDasharray={`${Math.max(0, legalDash - gap)} ${circ}`}
                    strokeDashoffset={-(legalOffset * circ / (2 * Math.PI)) + circ * 0.25}
                    strokeLinecap="round"
                    filter={hovered === 'legal' ? 'url(#pt-glow)' : undefined}
                    style={{ transition: 'stroke-width 0.2s, opacity 0.2s', cursor: 'pointer', opacity: hovered === 'cash' ? 0.25 : 1 }}
                    transform={`rotate(-90 ${cx} ${cy})`}
                    onMouseEnter={() => setHovered('legal')}
                    onMouseLeave={() => setHovered(null)}
                  />
                )}

                {/* Cash arc */}
                {cashAmount > 0 && (
                  <circle
                    cx={cx} cy={cy} r={r}
                    fill="none"
                    stroke="url(#pt-cash-grad)"
                    strokeWidth={hovered === 'cash' ? stroke + 4 : stroke}
                    strokeDasharray={`${Math.max(0, cashDash - gap)} ${circ}`}
                    strokeDashoffset={-((legalDash) / (circ) * circ) + circ * 0.25}
                    strokeLinecap="round"
                    filter={hovered === 'cash' ? 'url(#pt-glow)' : undefined}
                    style={{ transition: 'stroke-width 0.2s, opacity 0.2s', cursor: 'pointer', opacity: hovered === 'legal' ? 0.25 : 1 }}
                    transform={`rotate(-90 ${cx} ${cy})`}
                    onMouseEnter={() => setHovered('cash')}
                    onMouseLeave={() => setHovered(null)}
                  />
                )}

                {/* Center */}
                <circle cx={cx} cy={cy} r={r - stroke / 2 - 2} fill="hsl(var(--card))" />
                <text x={cx} y={cy - 10} textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: '9px', fontWeight: 600, fill: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
                  ИТОГО
                </text>
                <text x={cx} y={cy + 7} textAnchor="middle" dominantBaseline="middle"
                  style={{ fontSize: '14px', fontWeight: 900, fill: '#ffffff' }}>
                  {fmt(total)}
                </text>
              </svg>
            </div>

            {/* Mobile total */}
            <div className="sm:hidden text-center">
              <div className="text-xs font-semibold text-muted-foreground mb-0.5">ИТОГО</div>
              <div className="text-xl font-black">{fmt(total)}</div>
            </div>

            {/* Legend & stats */}
            <div className="flex flex-col gap-3 w-full">
              {/* Legal */}
              <div
                className="rounded-xl p-3 cursor-pointer transition-all"
                style={{
                  background: hovered === 'legal' ? 'rgba(57, 101, 255, 0.12)' : 'rgba(57, 101, 255, 0.06)',
                  border: `1px solid ${hovered === 'legal' ? 'rgba(57, 101, 255, 0.4)' : 'rgba(57, 101, 255, 0.15)'}`,
                  opacity: hovered === 'cash' ? 0.4 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={() => setHovered('legal')}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, #3965ff, #7551e9)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Безналичные</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#3965ff' }}>{legalPct.toFixed(1)}%</span>
                </div>
                <div className="text-base font-extrabold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
                  {fmt(legalAmount)}
                </div>
                <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{legalCount} платежей</div>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: 'rgba(57,101,255,0.15)' }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${legalPct}%`, background: 'linear-gradient(90deg, #3965ff, #7551e9)', transition: 'width 0.5s' }}
                  />
                </div>
              </div>

              {/* Cash */}
              <div
                className="rounded-xl p-3 cursor-pointer transition-all"
                style={{
                  background: hovered === 'cash' ? 'rgba(1, 181, 116, 0.12)' : 'rgba(1, 181, 116, 0.06)',
                  border: `1px solid ${hovered === 'cash' ? 'rgba(1, 181, 116, 0.4)' : 'rgba(1, 181, 116, 0.15)'}`,
                  opacity: hovered === 'legal' ? 0.4 : 1,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={() => setHovered('cash')}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: 'linear-gradient(135deg, #01b574, #38d399)' }} />
                    <span className="text-xs font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Наличные</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#01b574' }}>{cashPct.toFixed(1)}%</span>
                </div>
                <div className="text-base font-extrabold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
                  {fmt(cashAmount)}
                </div>
                <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{cashCount} платежей</div>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: 'rgba(1,181,116,0.15)' }}>
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${cashPct}%`, background: 'linear-gradient(90deg, #01b574, #38d399)', transition: 'width 0.5s' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Детализация по юрлицам */}
        {!loading && total > 0 && (topLegal.length > 0 || topCash.length > 0) && (
          <div className="border-t border-border pt-3 mt-4">
            <div className={`${dashboardTypography.cardBadge} mb-2 text-muted-foreground`}>
              Топ юрлиц-плательщиков:
            </div>
            <div className="flex flex-col gap-1.5">
              {[
                ...topLegal.map(e => ({ ...e, type: 'legal' as const })),
                ...topCash.map(e => ({ ...e, type: 'cash' as const })),
              ]
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 3)
                .map((item, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center ${dashboardTypography.cardSmall}`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <span
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center ${dashboardTypography.cardTiny} font-bold flex-shrink-0`}
                        style={{
                          background: index === 0
                            ? (item.type === 'legal' ? 'rgba(57, 101, 255, 0.2)' : 'rgba(1, 181, 116, 0.2)')
                            : 'hsl(var(--muted))',
                          color: index === 0
                            ? (item.type === 'legal' ? '#3965ff' : '#01b574')
                            : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        {index + 1}
                      </span>
                      <span className="font-medium truncate text-foreground">{item.name}</span>
                      <span
                        className="text-xs px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{
                          background: item.type === 'legal' ? 'rgba(57,101,255,0.1)' : 'rgba(1,181,116,0.1)',
                          color: item.type === 'legal' ? '#3965ff' : '#01b574',
                          fontSize: '10px',
                        }}
                      >
                        {item.type === 'legal' ? 'безнал' : 'нал'}
                      </span>
                    </div>
                    <span
                      className="font-semibold ml-2 flex-shrink-0"
                      style={{ color: item.type === 'legal' ? '#3965ff' : '#01b574' }}
                    >
                      {fmt(item.amount)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentTypeChart;