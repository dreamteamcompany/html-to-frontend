import { Line } from 'react-chartjs-2';
import { MONTHS, MONTHS_SHORT } from './types';

interface DynamicsLineChartProps {
  loading: boolean;
  chartData: number[];
  labels: string[];
  chartKeys: string[];
  isMobile: boolean;
  isLight: boolean;
  openDrill: (filter: { type: 'date'; value: string; label: string }) => void;
}

const DynamicsLineChart = ({
  loading,
  chartData,
  labels,
  chartKeys,
  isMobile,
  isLight,
  openDrill,
}: DynamicsLineChartProps) => {
  const chartLabels = isMobile && labels.length === MONTHS.length && labels[0] === MONTHS[0] ? MONTHS_SHORT : labels;

  const handleChartClick = (_event: unknown, elements: { index: number }[]) => {
    if (!elements.length) return;
    const idx = elements[0].index;
    const label = chartLabels[idx];
    const key = chartKeys[idx];
    if (!label || !key) return;
    openDrill({ type: 'date', value: key, label: `Период: ${label}` });
  };

  const commonDataset = {
    label: 'Расходы',
    data: chartData,
    borderColor: 'rgb(117, 81, 233)',
    backgroundColor: 'rgba(117, 81, 233, 0.1)',
    borderWidth: isMobile ? 1.5 : 3,
    fill: true,
    tension: 0.4,
    pointBackgroundColor: 'rgb(117, 81, 233)',
    pointBorderColor: isLight ? '#f8f9fa' : '#fff',
    pointBorderWidth: isMobile ? 1 : 2,
    pointRadius: isMobile ? 2 : 4,
    pointHoverRadius: isMobile ? 4 : 7,
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    onClick: handleChartClick,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: !isMobile,
        callbacks: {
          label: (context: { raw: unknown }) =>
            `Расходы: ${new Intl.NumberFormat('ru-RU').format(context.raw as number)} ₽`,
          footer: () => 'Нажмите для детализации',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: isLight ? 'rgba(30,30,50,0.85)' : 'rgba(180, 190, 220, 0.8)',
          font: { size: isMobile ? 9 : 12 },
          maxTicksLimit: isMobile ? 4 : 8,
          callback: (value: unknown) => {
            const v = value as number;
            if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' млн';
            if (v >= 1_000) return Math.round(v / 1_000) + ' тыс.';
            return String(v);
          },
        },
        grid: { color: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255, 255, 255, 0.06)', lineWidth: isMobile ? 0.5 : 1 },
      },
      x: {
        ticks: {
          color: isLight ? 'rgba(30,30,50,0.85)' : 'rgba(180, 190, 220, 0.8)',
          font: { size: isMobile ? 7 : 11 },
          maxRotation: isMobile ? 45 : 0,
          minRotation: isMobile ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 6 : 15,
        },
        grid: { display: false },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center flex-1 min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-[200px] sm:min-h-[300px]" style={{ position: 'relative', cursor: 'pointer' }}>
      <Line
        data={{ labels: chartLabels, datasets: [{ ...commonDataset }] }}
        options={commonOptions}
      />
    </div>
  );
};

export default DynamicsLineChart;
