import { Card, CardContent } from '@/components/ui/card';
import { Bar, Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { dashboardTypography } from '../dashboardStyles';
import { usePeriod } from '@/contexts/PeriodContext';

interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  [key: string]: unknown;
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const MONTHS_SHORT = ['Я', 'Ф', 'М', 'А', 'М', 'И', 'И', 'А', 'С', 'О', 'Н', 'Д'];

const getChartConfig = (period: string, from: Date, to: Date) => {
  if (period === 'today') {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    return { labels: hours, unit: 'hour' as const };
  }
  if (period === 'week') {
    const days: string[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      days.push(cur.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }));
      cur.setDate(cur.getDate() + 1);
    }
    return { labels: days, unit: 'week_day' as const };
  }
  if (period === 'month') {
    const days: string[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      days.push(cur.getDate().toString());
      cur.setDate(cur.getDate() + 1);
    }
    return { labels: days, unit: 'month_day' as const };
  }
  if (period === 'year') {
    return { labels: MONTHS, unit: 'month' as const };
  }
  const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 1) {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    return { labels: hours, unit: 'hour' as const };
  }
  if (diffDays <= 31) {
    const days: string[] = [];
    const cur = new Date(from);
    while (cur <= to) {
      days.push(`${cur.getDate()}.${cur.getMonth() + 1}`);
      cur.setDate(cur.getDate() + 1);
    }
    return { labels: days, unit: 'custom_day' as const };
  }
  return { labels: MONTHS, unit: 'month' as const };
};

type UnitType = 'hour' | 'week_day' | 'month_day' | 'custom_day' | 'month';

const buildData = (payments: PaymentRecord[], labels: string[], unit: UnitType, from: Date) => {
  const map: { [key: string]: number } = {};

  payments.forEach((p) => {
    const d = new Date(p.payment_date);
    let key: string;

    if (unit === 'hour') {
      key = `${d.getHours()}:00`;
    } else if (unit === 'month') {
      key = MONTHS[d.getMonth()];
    } else if (unit === 'month_day') {
      key = d.getDate().toString();
    } else if (unit === 'custom_day') {
      key = `${d.getDate()}.${d.getMonth() + 1}`;
    } else if (unit === 'week_day') {
      key = d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
    } else {
      key = d.getDate().toString();
    }

    map[key] = (map[key] || 0) + p.amount;
  });

  return labels.map((label) => map[label] || 0);
};

const MonthlyDynamicsChart = () => {
  const { period, getDateRange, dateFrom, dateTo } = usePeriod();
  const [chartData, setChartData] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`${API_ENDPOINTS.main}?endpoint=payments`);
        const data = await response.json();

        const { from, to } = getDateRange();
        const { labels: newLabels, unit } = getChartConfig(period, from, to);

        const filtered = (Array.isArray(data) ? data : []).filter((p: PaymentRecord) => {
          if (p.status !== 'approved' && p.status !== 'paid') return false;
          const d = new Date(p.payment_date);
          return d >= from && d <= to;
        });

        const values = buildData(filtered, newLabels, unit, from);
        setLabels(newLabels);
        setChartData(values);
      } catch (error) {
        console.error('Failed to fetch dynamics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, dateFrom, dateTo]);

  const chartLabels = isMobile && labels.length === MONTHS.length && labels[0] === MONTHS[0] ? MONTHS_SHORT : labels;
  const isBarChart = period === 'today' || period === 'week';

  const commonDataset = {
    label: 'Расходы',
    data: chartData,
    borderColor: 'rgb(117, 81, 233)',
    backgroundColor: isBarChart ? 'rgba(117, 81, 233, 0.7)' : 'rgba(117, 81, 233, 0.1)',
    borderRadius: isMobile ? 4 : 8,
    borderWidth: isMobile ? 1.5 : 3,
    fill: true,
    tension: 0.4,
    pointBackgroundColor: 'rgb(117, 81, 233)',
    pointBorderColor: '#fff',
    pointBorderWidth: isMobile ? 1 : 2,
    pointRadius: isMobile ? 2 : 4,
    pointHoverRadius: isMobile ? 4 : 7,
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: !isMobile,
        callbacks: {
          label: (context: { raw: unknown }) =>
            `Расходы: ${new Intl.NumberFormat('ru-RU').format(context.raw as number)} ₽`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#a3aed0',
          font: { size: isMobile ? 9 : 12 },
          maxTicksLimit: isMobile ? 4 : 8,
          callback: (value: unknown) => {
            const v = value as number;
            if (isMobile && v >= 1000) return (v / 1000).toFixed(0) + 'k';
            return new Intl.NumberFormat('ru-RU', { notation: 'compact' }).format(v);
          },
        },
        grid: { color: 'rgba(255, 255, 255, 0.05)', lineWidth: isMobile ? 0.5 : 1 },
      },
      x: {
        ticks: {
          color: '#a3aed0',
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

  const titleMap: Record<string, string> = {
    today: 'Динамика Расходов за Сегодня',
    week: 'Динамика Расходов за Неделю',
    month: 'Динамика Расходов по Дням',
    year: 'Динамика Расходов по Месяцам',
    custom: 'Динамика Расходов за Период',
  };

  return (
    <Card style={{ background: '#111c44', border: '1px solid rgba(117, 81, 233, 0.4)', boxShadow: '0 0 30px rgba(117, 81, 233, 0.2), inset 0 0 15px rgba(117, 81, 233, 0.05)' }}>
      <CardContent className="p-3 sm:p-6">
        <div style={{ marginBottom: '12px' }} className="sm:mb-4">
          <h3 className={`${dashboardTypography.cardTitle} text-white`}>{titleMap[period] || 'Динамика Расходов'}</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center sm:h-[250px]" style={{ height: '200px' }}>
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="h-[200px] sm:h-[350px]" style={{ position: 'relative' }}>
            {isBarChart ? (
              <Bar
                data={{ labels: chartLabels, datasets: [{ ...commonDataset }] }}
                options={commonOptions}
              />
            ) : (
              <Line
                data={{ labels: chartLabels, datasets: [{ ...commonDataset }] }}
                options={commonOptions}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyDynamicsChart;