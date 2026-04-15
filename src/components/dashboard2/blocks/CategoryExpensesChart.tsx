import { Card, CardContent } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { usePeriod } from '@/contexts/PeriodContext';
import Icon from '@/components/ui/icon';
import { dashboardTypography } from '../dashboardStyles';
import { usePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { useDrillDown } from '../useDrillDown';
import DrillDownModal from '../DrillDownModal';
import { parsePaymentDate } from '../dashboardUtils';
import { Chart as ChartJS } from 'chart.js';

interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  category_name?: string;
  [key: string]: unknown;
}

const LINE_COLORS = [
  { line: 'rgba(117, 81, 233, 1)', fill: 'rgba(117, 81, 233, 0.12)' },
  { line: 'rgba(57, 101, 255, 1)', fill: 'rgba(57, 101, 255, 0.10)' },
  { line: 'rgba(1, 181, 116, 1)', fill: 'rgba(1, 181, 116, 0.10)' },
  { line: 'rgba(255, 181, 71, 1)', fill: 'rgba(255, 181, 71, 0.10)' },
  { line: 'rgba(255, 107, 107, 1)', fill: 'rgba(255, 107, 107, 0.10)' },
];

const fmt = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₽`;
  if (v >= 1_000) return `${Math.round(v / 1_000)} тыс ₽`;
  return new Intl.NumberFormat('ru-RU').format(v) + ' ₽';
};

const CategoryExpensesChart = () => {
  const { period, getDateRange, dateFrom, dateTo } = usePeriod();
  const { payments: allPayments, loading } = usePaymentsCache();
  const { drillFilter, openDrill, closeDrill } = useDrillDown();
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [labelTooltip, setLabelTooltip] = useState<{ x: number; y: number; name: string; amount: string } | null>(null);
  const chartRef = useRef<ChartJS | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains('light'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setShowAll(false);
  }, [period, dateFrom, dateTo]);

  const categoryData = useMemo(() => {
    const { from, to } = getDateRange();
    const categoryMap: { [key: string]: number } = {};

    (Array.isArray(allPayments) ? allPayments : []).forEach((p: PaymentRecord) => {
      if (p.status !== 'approved') return;
      const d = parsePaymentDate(p.payment_date);
      if (isNaN(d.getTime()) || !(d >= from && d <= to)) return;
      const name = p.category_name || 'Без категории';
      categoryMap[name] = (categoryMap[name] || 0) + p.amount;
    });

    return Object.entries(categoryMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [allPayments, period, dateFrom, dateTo]);

  const total = useMemo(
    () => categoryData.reduce((s, c) => s + c.amount, 0),
    [categoryData]
  );

  const displayData = useMemo(
    () => (showAll ? categoryData : categoryData.slice(0, 5)),
    [categoryData, showAll]
  );

  const chartKey = useMemo(
    () => `cat-${period}-${dateFrom}-${dateTo}-${showAll}-${displayData.length}`,
    [period, dateFrom, dateTo, showAll, displayData.length]
  );

  const periodLabel = useMemo(() => {
    const { from, to } = getDateRange();
    const MONTHS_FULL = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmtD = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
    if (period === 'today') return `Сегодня, ${fmtD(from)}`;
    if (period === 'week') return `Неделя: ${fmtD(from)} — ${fmtD(to)}`;
    if (period === 'month') return `${MONTHS_FULL[from.getMonth()]} ${from.getFullYear()}`;
    if (period === 'year') return `${from.getFullYear()} год`;
    return `${fmtD(from)} — ${fmtD(to)}`;
  }, [period, dateFrom, dateTo]);

  const tickColor = isLight ? 'rgba(30,30,50,0.85)' : 'rgba(180,190,220,0.65)';
  const amountColor = isLight ? 'rgba(117,81,233,0.9)' : 'rgba(167,139,250,0.75)';
  const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';

  const handleChartMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const chart = chartRef.current;
    if (!chart) { setLabelTooltip(null); return; }
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xScale = (chart as ChartJS).scales?.['x'];
    if (!xScale) { setLabelTooltip(null); return; }
    const bottom = (chart as ChartJS).chartArea?.bottom ?? 0;
    if (mouseY < bottom) { setLabelTooltip(null); return; }
    const halfBand = xScale.width / Math.max(displayData.length, 1) / 2;
    for (let i = 0; i < displayData.length; i++) {
      const px = xScale.getPixelForValue(i);
      if (mouseX >= px - halfBand && mouseX <= px + halfBand) {
        const item = displayData[i];
        if (item.name) {
          setLabelTooltip({ x: mouseX, y: mouseY, name: item.name, amount: fmt(item.amount) });
          return;
        }
      }
    }
    setLabelTooltip(null);
  }, [displayData]);

  const xAxisLabelsPlugin = useMemo(() => ({
    id: 'xAxisLabelsCat',
    afterDraw(chart: ChartJS) {
      const ctx = chart.ctx;
      const xScale = chart.scales['x'];
      const chartArea = chart.chartArea;
      if (!xScale || !chartArea) return;
      const bottom = chartArea.bottom;
      const top = chartArea.top;
      const font = `"Plus Jakarta Sans", sans-serif`;
      const meta = chart.getDatasetMeta(0);
      const count = displayData.length;
      if (count === 0) return;

      const slotWidth = xScale.width / count;
      const maxTextWidth = Math.max(slotWidth - 6, 8);

      const fitText = (text: string, maxW: number, fsz: number, weight: string): string => {
        ctx.font = `${weight} ${fsz}px ${font}`;
        if (ctx.measureText(text).width <= maxW) return text;
        let lo = 0, hi = text.length;
        while (lo < hi - 1) {
          const mid = Math.floor((lo + hi) / 2);
          if (ctx.measureText(text.slice(0, mid) + '…').width <= maxW) lo = mid;
          else hi = mid;
        }
        return lo > 0 ? text.slice(0, lo) + '…' : '';
      };

      const baseFontSize = isMobile ? 10 : 11;
      const fontSize = Math.max(8, Math.min(baseFontSize, Math.floor(slotWidth / 6)));
      const amtFontSize = Math.max(7, fontSize - 1);

      for (let i = 0; i < count; i++) {
        const item = displayData[i];
        const px = xScale.getPixelForValue(i);

        ctx.save();
        ctx.textAlign = 'center';

        const nameStr = fitText(item.name ?? '', maxTextWidth, fontSize, '600');
        if (nameStr) {
          ctx.textBaseline = 'top';
          ctx.font = `600 ${fontSize}px ${font}`;
          ctx.fillStyle = tickColor;
          ctx.fillText(nameStr, px, bottom + (isMobile ? 8 : 10));
        }

        if (meta?.data?.[i]) {
          const bar = meta.data[i] as { y: number };
          const barTop = bar.y;
          const spaceAbove = barTop - top;
          if (spaceAbove >= amtFontSize + 4) {
            const amtStr = fitText(fmt(item.amount), maxTextWidth, amtFontSize, '600');
            if (amtStr) {
              ctx.textBaseline = 'bottom';
              ctx.font = `600 ${amtFontSize}px ${font}`;
              ctx.fillStyle = amountColor;
              ctx.fillText(amtStr, px, barTop - (isMobile ? 3 : 4));
            }
          }
        }

        ctx.restore();
      }
    },
  }), [displayData, isMobile, tickColor, amountColor]);

  const areaData = useMemo(() => ({
    labels: displayData.map(d => d.name),
    datasets: [{
      label: 'Расходы',
      data: displayData.map(d => d.amount),
      backgroundColor: (ctx: { dataIndex: number; chart: { ctx: CanvasRenderingContext2D; chartArea?: { top: number; bottom: number } } }) => {
        const { ctx: c, chartArea } = ctx.chart;
        const col = LINE_COLORS[ctx.dataIndex % LINE_COLORS.length];
        if (!chartArea) return col.line.replace('1)', '0.75)');
        const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, col.line.replace('1)', '0.85)'));
        gradient.addColorStop(1, col.line.replace('1)', '0.45)'));
        return gradient;
      },
      borderColor: displayData.map((_, i) => LINE_COLORS[i % LINE_COLORS.length].line),
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: displayData.map((_, i) => LINE_COLORS[i % LINE_COLORS.length].line),
    }],
  }), [displayData, isLight, isMobile]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 250 },
    interaction: { mode: 'nearest' as const, intersect: true },
    onClick: (_event: unknown, elements: { index: number }[]) => {
      if (!elements.length) return;
      const item = displayData[elements[0].index];
      if (item?.name) openDrill({ type: 'category', value: item.name, label: item.name });
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: !isMobile,
        backgroundColor: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(18,20,45,0.96)',
        titleColor: isLight ? 'rgba(30,30,50,0.9)' : 'rgba(200,210,235,0.95)',
        bodyColor: isLight ? 'rgba(30,30,50,0.72)' : 'rgba(170,185,215,0.85)',
        borderColor: isLight ? 'rgba(117,81,233,0.2)' : 'rgba(117,81,233,0.3)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        caretSize: 6,
        callbacks: {
          title: (items: { dataIndex: number }[]) => {
            const idx = items[0]?.dataIndex ?? 0;
            return displayData[idx]?.name ?? '';
          },
          label: (context: { raw: unknown }) => {
            const v = context.raw as number;
            return '  ' + new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v).replace(/,/g, '.') + ' ₽';
          },
          footer: () => 'Нажмите для детализации',
        },
      },
    },
    scales: {
      x: {
        ticks: { display: false },
        grid: { display: false },
        border: { display: false },
        afterFit(scale: { paddingBottom: number }) {
          scale.paddingBottom = isMobile ? 36 : 42;
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: tickColor,
          font: { size: isMobile ? 10 : 11, family: 'Plus Jakarta Sans, sans-serif' as const },
          maxTicksLimit: isMobile ? 4 : 6,
          padding: 8,
          callback: (value: unknown) => {
            const v = value as number;
            if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' млн';
            if (v >= 1_000) return Math.round(v / 1_000) + ' тыс.';
            return String(v);
          },
        },
        grid: { color: gridColor, lineWidth: 1 },
        border: { dash: [4, 4], display: false },
      },
    },
  }), [displayData, isLight, isMobile, tickColor, gridColor]);

  return (
    <>
    <Card className="h-full flex flex-col" style={{
      background: 'hsl(var(--card))',
      border: '1px solid rgba(117,81,233,0.22)',
      borderTop: '4px solid #7551e9',
      boxShadow: isLight ? '0 4px 24px rgba(117,81,233,0.07)' : '0 4px 28px rgba(117,81,233,0.13)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '220px', height: '220px',
        background: 'radial-gradient(circle at top right, rgba(117,81,233,0.07) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />

      <CardContent className="p-4 sm:p-6 flex flex-col flex-1" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(117,81,233,0.12)',
                border: '1px solid rgba(117,81,233,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="LayoutGrid" size={16} style={{ color: '#7551e9' }} />
              </div>
              <h3 className={dashboardTypography.cardTitle} style={{ fontSize: '15px' }}>
                IT Расходы по Категориям
              </h3>
            </div>
            {!loading && total > 0 && (
              <div
                onClick={() => openDrill({ type: 'all', value: 'all', label: 'Все расходы' })}
                style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginLeft: '44px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '4px', padding: '2px 4px', transition: 'background 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(117,81,233,0.10)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                Итого: <span style={{ color: '#7551e9', fontWeight: 700 }}>{new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)} ₽</span>
                <span style={{ marginLeft: '2px', opacity: 0.7 }}>· {categoryData.length} категорий</span>
              </div>
            )}
          </div>

          {categoryData.length > 5 && (
            <div style={{ display: 'flex', gap: '3px', background: isLight ? 'rgba(0,0,0,0.05)' : 'hsl(var(--muted))', padding: '3px', borderRadius: '10px' }}>
              {[{ label: 'Топ-5', val: false }, { label: 'Все', val: true }].map(({ label, val }) => (
                <button
                  key={label}
                  onClick={() => setShowAll(val)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    background: showAll === val ? '#7551e9' : 'transparent',
                    color: showAll === val ? '#fff' : 'hsl(var(--muted-foreground))',
                    fontWeight: '600',
                    transition: 'all 0.18s',
                    boxShadow: showAll === val ? '0 2px 10px rgba(117,81,233,0.4)' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex-1 min-h-[200px]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#7551e9' }} />
            <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Загрузка данных...</span>
          </div>
        ) : displayData.length === 0 ? (
          <div className="flex-1 min-h-[200px]" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <Icon name="PackageSearch" size={44} style={{ color: 'hsl(var(--muted-foreground))', opacity: 0.35 }} />
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>Нет данных за выбранный период</p>
          </div>
        ) : (
          <>
            <div
              className="flex-1 min-h-[200px] sm:min-h-[280px]"
              style={{ position: 'relative', cursor: 'pointer' }}
              onMouseMove={handleChartMouseMove}
              onMouseLeave={() => setLabelTooltip(null)}
            >
              <Bar key={chartKey} data={areaData} options={chartOptions} plugins={[xAxisLabelsPlugin]} ref={chartRef} />
              {labelTooltip && (
                <div style={{
                  position: 'absolute',
                  left: labelTooltip.x,
                  top: labelTooltip.y - 8,
                  transform: 'translate(-50%, -100%)',
                  background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(18,20,45,0.96)',
                  border: '1px solid rgba(117,81,233,0.3)',
                  borderRadius: '8px',
                  padding: '7px 10px',
                  pointerEvents: 'none',
                  zIndex: 10,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isLight ? 'rgba(30,30,50,0.9)' : 'rgba(200,210,235,0.95)' }}>{labelTooltip.name}</div>
                  <div style={{ fontSize: '11px', color: isLight ? 'rgba(117,81,233,0.85)' : 'rgba(167,139,250,0.9)', marginTop: '2px' }}>{labelTooltip.amount}</div>
                </div>
              )}
            </div>
            <div style={{
              textAlign: 'center',
              marginTop: '12px',
              padding: '6px 12px',
              borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
            }}>
              <span style={{
                fontSize: isMobile ? '10px' : '11px',
                fontWeight: 600,
                color: isLight ? 'rgba(117,81,233,0.75)' : 'rgba(167,139,250,0.7)',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                letterSpacing: '0.3px',
              }}>
                {periodLabel}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
    <DrillDownModal filter={drillFilter} onClose={closeDrill} />
    </>
  );
};

export default CategoryExpensesChart;