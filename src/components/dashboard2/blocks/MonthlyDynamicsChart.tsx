import { Card, CardContent } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import { useState, useEffect, useMemo } from 'react';
import { dashboardTypography } from '../dashboardStyles';
import { usePeriod } from '@/contexts/PeriodContext';
import { usePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { useDrillDown } from '../useDrillDown';
import DrillDownModal from '../DrillDownModal';
import { parsePaymentDate } from '../dashboardUtils';

interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  [key: string]: unknown;
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const MONTHS_SHORT = ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'];

const WEEK_DAYS_RU = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

const fmtWeekLabel = (d: Date) => `${WEEK_DAYS_RU[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}`;

// Формирует уникальный ключ YYYY-MM-DD для однозначной идентификации дня
const fmtDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

interface ChartConfig {
  labels: string[];
  keys: string[];
  unit: 'hour' | 'week_day' | 'month_day' | 'custom_day' | 'month';
}

const getChartConfig = (period: string, from: Date, to: Date): ChartConfig => {
  if (period === 'today') {
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    return { labels: hours, keys: hours, unit: 'hour' };
  }
  if (period === 'week') {
    const labels: string[] = [];
    const keys: string[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      labels.push(fmtWeekLabel(cur));
      keys.push(fmtDateKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return { labels, keys, unit: 'week_day' };
  }
  if (period === 'month') {
    const labels: string[] = [];
    const keys: string[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      labels.push(cur.getDate().toString());
      keys.push(fmtDateKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return { labels, keys, unit: 'month_day' };
  }
  if (period === 'year') {
    const keys = Array.from({ length: 12 }, (_, i) =>
      `${from.getFullYear()}-${String(i + 1).padStart(2, '0')}`
    );
    return { labels: MONTHS, keys, unit: 'month' };
  }
  const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) {
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    return { labels: hours, keys: hours, unit: 'hour' };
  }
  if (diffDays <= 7) {
    const labels: string[] = [];
    const keys: string[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      labels.push(fmtWeekLabel(cur));
      keys.push(fmtDateKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return { labels, keys, unit: 'week_day' };
  }
  if (diffDays <= 31) {
    const labels: string[] = [];
    const keys: string[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      labels.push(cur.getDate().toString());
      keys.push(fmtDateKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return { labels, keys, unit: 'custom_day' };
  }
  // Для длинных custom-периодов — по месяцам
  const keys = Array.from({ length: 12 }, (_, i) =>
    `${from.getFullYear()}-${String(i + 1).padStart(2, '0')}`
  );
  return { labels: MONTHS, keys, unit: 'month' };
};

type UnitType = 'hour' | 'week_day' | 'month_day' | 'custom_day' | 'month';

const buildData = (payments: PaymentRecord[], keys: string[], unit: UnitType) => {
  const map: { [key: string]: number } = {};

  payments.forEach((p) => {
    const d = parsePaymentDate(p.payment_date);
    let key: string;

    if (unit === 'hour') {
      key = `${String(d.getHours()).padStart(2, '0')}:00`;
    } else if (unit === 'month') {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } else if (unit === 'week_day' || unit === 'month_day' || unit === 'custom_day') {
      key = fmtDateKey(d);
    } else {
      key = fmtDateKey(d);
    }

    map[key] = (map[key] || 0) + p.amount;
  });

  return keys.map((key) => map[key] || 0);
};

const MonthlyDynamicsChart = () => {
  const { period, getDateRange, dateFrom, dateTo } = usePeriod();
  const { payments: allPayments, loading } = usePaymentsCache();
  const { drillFilter, openDrill, closeDrill } = useDrillDown();
  const [isMobile, setIsMobile] = useState(false);
  const [isLight, setIsLight] = useState(false);

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

  const { chartData, labels, chartUnit } = useMemo(() => {
    const { from, to } = getDateRange();
    const { labels: newLabels, keys: newKeys, unit } = getChartConfig(period, from, to);

    const filtered = (Array.isArray(allPayments) ? allPayments : []).filter((p: PaymentRecord) => {
      if (p.status !== 'approved') return false;
      const d = parsePaymentDate(p.payment_date);
      return !isNaN(d.getTime()) && d >= from && d <= to;
    });

    const values = buildData(filtered, newKeys, unit);
    return { chartData: values, labels: newLabels, chartUnit: unit };
  }, [allPayments, period, dateFrom, dateTo]);

  const chartLabels = isMobile && labels.length === MONTHS.length && labels[0] === MONTHS[0] ? MONTHS_SHORT : labels;

  const handleChartClick = (_event: unknown, elements: { index: number }[]) => {
    if (!elements.length) return;
    const idx = elements[0].index;
    const label = chartLabels[idx];
    if (!label) return;
    let filterValue = label;
    if (chartUnit === 'month') {
      const monthIdx = MONTHS.indexOf(label);
      filterValue = monthIdx >= 0 ? String(monthIdx + 1).padStart(2, '0') : label;
    }
    openDrill({ type: 'date', value: filterValue, label: `Период: ${label}` });
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
          color: isLight ? 'rgba(30,30,50,0.55)' : 'rgba(180, 190, 220, 0.8)',
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
          color: isLight ? 'rgba(30,30,50,0.55)' : 'rgba(180, 190, 220, 0.8)',
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

  return (
    <>
      <Card className="h-full flex flex-col" style={{ background: 'hsl(var(--card))', border: '1px solid rgba(117, 81, 233, 0.4)' }}>
        <CardContent className="p-3 sm:p-6 flex flex-col flex-1">
          <div style={{ marginBottom: '12px' }} className="sm:mb-4">
            <h3 className={dashboardTypography.cardTitle}>Динамика расходов</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center flex-1 min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="flex-1 min-h-[200px] sm:min-h-[300px]" style={{ position: 'relative', cursor: 'pointer' }}>
              <Line
                data={{ labels: chartLabels, datasets: [{ ...commonDataset }] }}
                options={commonOptions}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <DrillDownModal filter={drillFilter} onClose={closeDrill} />
    </>
  );
};

export default MonthlyDynamicsChart;