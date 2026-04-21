import { Bar } from 'react-chartjs-2';
import { useState, useMemo, useRef, useCallback } from 'react';
import { Chart as ChartJS } from 'chart.js';
import Icon from '@/components/ui/icon';
import { CategoryItem, TimelineLabel, LINE_COLORS, fmt } from './types';

interface CategoryChartCanvasProps {
  loading: boolean;
  displayData: CategoryItem[];
  chartKey: string;
  isMobile: boolean;
  isLight: boolean;
  timelineData: { labels: TimelineLabel[]; activeDays: Set<string> };
  openDrillCategory: (name: string) => void;
}

const CategoryChartCanvas = ({
  loading,
  displayData,
  chartKey,
  isMobile,
  isLight,
  timelineData,
  openDrillCategory,
}: CategoryChartCanvasProps) => {
  const [labelTooltip, setLabelTooltip] = useState<{ x: number; y: number; name: string; amount: string } | null>(null);
  const chartRef = useRef<ChartJS | null>(null);

  const tickColor = isLight ? 'rgba(20,20,40,0.95)' : 'rgba(180,190,220,0.65)';
  const amountColor = isLight ? 'rgba(90,55,200,1)' : 'rgba(167,139,250,0.75)';
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
      maxBarThickness: isMobile ? 56 : 80,
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
      if (item?.name) openDrillCategory(item.name);
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
  }), [displayData, isLight, isMobile, tickColor, gridColor, openDrillCategory]);

  if (loading) {
    return (
      <div className="flex-1 min-h-[200px]" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#7551e9' }} />
        <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Загрузка данных...</span>
      </div>
    );
  }

  if (displayData.length === 0) {
    return (
      <div className="flex-1 min-h-[200px]" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <Icon name="PackageSearch" size={44} style={{ color: 'hsl(var(--muted-foreground))', opacity: 0.35 }} />
        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>Нет данных за выбранный период</p>
      </div>
    );
  }

  return (
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
        marginTop: '10px',
        padding: '8px 4px 2px',
        borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)'}`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: '17px',
          left: '8px',
          right: '8px',
          height: '1px',
          background: isLight ? 'rgba(117,81,233,0.15)' : 'rgba(167,139,250,0.15)',
        }} />
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          position: 'relative',
        }}>
          {timelineData.labels.map((item, i) => {
            const isActive = timelineData.activeDays.has(item.key);
            const showLabel = timelineData.labels.length <= 12
              || (isMobile ? i % Math.ceil(timelineData.labels.length / 8) === 0 : i % Math.ceil(timelineData.labels.length / 15) === 0)
              || i === timelineData.labels.length - 1;
            return (
              <div key={item.key + i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: '1 1 0',
                minWidth: 0,
              }}>
                <div style={{
                  width: isActive ? '6px' : '3px',
                  height: isActive ? '6px' : '3px',
                  borderRadius: '50%',
                  background: isActive
                    ? (isLight ? '#7551e9' : 'rgba(167,139,250,0.9)')
                    : (isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)'),
                  marginBottom: '4px',
                  flexShrink: 0,
                  boxShadow: isActive ? '0 0 4px rgba(117,81,233,0.4)' : 'none',
                  transition: 'all 0.2s',
                }} />
                {showLabel && (
                  <span style={{
                    fontSize: isMobile ? '8px' : '9px',
                    color: isActive
                      ? (isLight ? 'rgba(117,81,233,0.85)' : 'rgba(167,139,250,0.8)')
                      : (isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.25)'),
                    fontFamily: 'Plus Jakarta Sans, sans-serif',
                    fontWeight: isActive ? 600 : 400,
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                  }}>
                    {item.text}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default CategoryChartCanvas;
