import { Card, CardContent } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import { useState, useEffect, useMemo } from 'react';
import { usePeriod } from '@/contexts/PeriodContext';
import { usePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { useDrillDown } from '../useDrillDown';
import DrillDownModal from '../DrillDownModal';
import { parsePaymentDate } from '../dashboardUtils';

interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  category_name?: string;
  [key: string]: unknown;
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const WEEK_DAYS_RU = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const fmtWeekLabel = (d: Date) => `${WEEK_DAYS_RU[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}`;

const colors = [
  'rgb(117, 81, 233)',
  'rgb(57, 101, 255)',
  'rgb(255, 181, 71)',
  'rgb(1, 181, 116)',
  'rgb(227, 26, 26)',
  'rgb(255, 107, 107)',
  'rgb(78, 205, 196)',
  'rgb(255, 159, 243)'
];

const CategoryExpensesChart = () => {
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
    const checkTheme = () => setIsLight(document.documentElement.classList.contains('light'));
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const { categoryData, xLabels } = useMemo(() => {
    const { from, to } = getDateRange();

    const filtered = (Array.isArray(allPayments) ? allPayments : []).filter((p: PaymentRecord) => {
      if (p.status !== 'approved') return false;
      const d = parsePaymentDate(p.payment_date);
      return !isNaN(d.getTime()) && d >= from && d <= to;
    });

    const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    let labels: string[];
    let getKey: (p: PaymentRecord) => string;

    if (period === 'today' || (period === 'custom' && diffDays <= 1)) {
      labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
      getKey = (p) => `${String(parsePaymentDate(p.payment_date).getHours()).padStart(2, '0')}:00`;
    } else if (period === 'week' || (period === 'custom' && diffDays <= 7)) {
      labels = [];
      const cur = new Date(from);
      while (cur <= to) {
        labels.push(fmtWeekLabel(cur));
        cur.setDate(cur.getDate() + 1);
      }
      getKey = (p) => fmtWeekLabel(parsePaymentDate(p.payment_date));
    } else if (period === 'month' || (period === 'custom' && diffDays <= 31)) {
      labels = [];
      const cur = new Date(from);
      while (cur <= to) {
        labels.push(cur.getDate().toString());
        cur.setDate(cur.getDate() + 1);
      }
      getKey = (p) => parsePaymentDate(p.payment_date).getDate().toString();
    } else {
      labels = MONTHS;
      getKey = (p) => MONTHS[parsePaymentDate(p.payment_date).getMonth()];
    }

    const categoryMap: { [category: string]: { [key: string]: number } } = {};

    filtered.forEach((payment: PaymentRecord) => {
      const category = payment.category_name || 'Без категории';
      const key = getKey(payment);
      if (!categoryMap[category]) categoryMap[category] = {};
      categoryMap[category][key] = (categoryMap[category][key] || 0) + payment.amount;
    });

    const result: { [category: string]: number[] } = {};
    Object.keys(categoryMap).forEach((category) => {
      result[category] = labels.map((label) => categoryMap[category][label] || 0);
    });

    return { categoryData: result, xLabels: labels };
  }, [allPayments, period, dateFrom, dateTo]);

  const labelCount = xLabels.length;

  const datasets = Object.keys(categoryData).map((category, index) => ({
    label: category,
    data: categoryData[category],
    backgroundColor: colors[index % colors.length],
    borderRadius: 8,
    borderSkipped: false as const,
  }));

  const handleChartClick = (_event: unknown, elements: { datasetIndex: number }[]) => {
    if (!elements.length) return;
    const dsIdx = elements[0].datasetIndex;
    const catName = datasets[dsIdx]?.label;
    if (!catName) return;
    openDrill({ type: 'category', value: catName, label: catName });
  };

  return (
    <>
      <Card className="h-full flex flex-col" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
        <CardContent className="p-3 sm:p-4 flex flex-col flex-1">
          <div style={{ marginBottom: '12px' }}>
            <h3 className="text-base sm:text-lg" style={{ fontWeight: '700', color: 'hsl(var(--foreground))' }}>IT Расходы по Категориям</h3>
          </div>
          {loading ? (
            <div className="flex items-center justify-center flex-1 min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
            </div>
          ) : (
            <div
              className="flex-1 min-h-[260px] sm:min-h-[360px]"
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: isMobile ? '260px' : '360px',
                cursor: 'pointer',
              }}>
              <Bar
                data={{ labels: xLabels, datasets }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { mode: 'index' as const, intersect: false },
                  onClick: handleChartClick,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      display: !isMobile,
                      labels: {
                        padding: isMobile ? 10 : 20,
                        usePointStyle: true,
                        color: isLight ? 'rgba(30,30,50,0.85)' : 'rgba(200,210,230,0.85)',
                        font: { family: 'Plus Jakarta Sans, sans-serif', size: isMobile ? 10 : 13 }
                      }
                    },
                    tooltip: {
                      enabled: !isMobile,
                      callbacks: {
                        label: (context) =>
                          `${context.dataset.label}: ${new Intl.NumberFormat('ru-RU').format(context.raw as number)} ₽`,
                        footer: () => 'Нажмите для детализации',
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: isLight ? 'rgba(30,30,50,0.85)' : 'rgba(180, 190, 220, 0.7)',
                        font: { size: isMobile ? 10 : 11 },
                        maxTicksLimit: isMobile ? 4 : 6,
                        padding: 6,
                        callback: (value) => {
                          const v = value as number;
                          if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' млн';
                          if (v >= 1000) return Math.round(v / 1000) + ' тыс.';
                          return String(v);
                        }
                      },
                      grid: { color: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255, 255, 255, 0.08)', lineWidth: 1 },
                      border: { dash: [4, 4], display: false }
                    },
                    x: {
                      ticks: {
                        color: isLight ? 'rgba(30,30,50,0.85)' : 'rgba(180, 190, 220, 0.75)',
                        font: { size: isMobile ? 9 : 11 },
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: isMobile ? 8 : 15,
                        padding: 4,
                      },
                      grid: { display: false }
                    }
                  }
                }}
              />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <DrillDownModal filter={drillFilter} onClose={closeDrill} />
    </>
  );
};

export default CategoryExpensesChart;