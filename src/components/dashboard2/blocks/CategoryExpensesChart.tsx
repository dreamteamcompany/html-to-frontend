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

const TOP_COLORS = [
  'rgb(117, 81, 233)',
  'rgb(57, 101, 255)',
  'rgb(1, 181, 116)',
  'rgb(255, 181, 71)',
  'rgb(227, 26, 26)',
];
const OTHER_COLOR = 'rgb(120, 130, 155)';

const MAX_CATEGORIES = 5;

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

  const { displayData, xLabels } = useMemo(() => {
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

    const totals = Object.entries(categoryMap).map(([name, byKey]) => ({
      name,
      total: Object.values(byKey).reduce((s, v) => s + v, 0),
      byKey,
    }));
    totals.sort((a, b) => b.total - a.total);

    const topCats = totals.slice(0, MAX_CATEGORIES);
    const restCats = totals.slice(MAX_CATEGORIES);

    const result: { [category: string]: number[] } = {};
    topCats.forEach(({ name, byKey }) => {
      result[name] = labels.map((label) => byKey[label] || 0);
    });

    if (restCats.length > 0) {
      result['Прочее'] = labels.map((label) =>
        restCats.reduce((sum, c) => sum + (c.byKey[label] || 0), 0)
      );
    }

    return { displayData: result, xLabels: labels };
  }, [allPayments, period, dateFrom, dateTo]);

  const labelCount = xLabels.length;
  const catKeys = Object.keys(displayData);
  const catCount = catKeys.length || 1;

  const datasets = catKeys.map((category, index) => {
    const isOther = category === 'Прочее';
    return {
      label: category,
      data: displayData[category],
      backgroundColor: isOther ? OTHER_COLOR : TOP_COLORS[index % TOP_COLORS.length],
      borderRadius: labelCount <= 12 ? 6 : 3,
      borderSkipped: false as const,
      barPercentage: 0.82,
      categoryPercentage: catCount <= 2 ? 0.5 : catCount <= 4 ? 0.7 : 0.82,
      maxBarThickness: isMobile ? 24 : 40,
      minBarLength: 2,
    };
  });

  const handleChartClick = (_event: unknown, elements: { datasetIndex: number }[]) => {
    if (!elements.length) return;
    const dsIdx = elements[0].datasetIndex;
    const catName = datasets[dsIdx]?.label;
    if (!catName || catName === 'Прочее') return;
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
              className="flex-1 min-h-[200px] sm:min-h-[280px]"
              style={{ position: 'relative', cursor: 'pointer' }}
            >
              <Bar
                data={{ labels: xLabels, datasets }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  animation: { duration: 250 },
                  interaction: { mode: 'index' as const, intersect: false },
                  onClick: handleChartClick,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      display: true,
                      labels: {
                        padding: isMobile ? 8 : 16,
                        usePointStyle: true,
                        pointStyleWidth: isMobile ? 8 : 10,
                        color: isLight ? 'rgba(30,30,50,0.85)' : 'rgba(200,210,230,0.85)',
                        font: { family: 'Plus Jakarta Sans, sans-serif', size: isMobile ? 10 : 12 },
                        boxWidth: isMobile ? 8 : 12,
                        boxHeight: isMobile ? 8 : 12,
                      }
                    },
                    tooltip: {
                      enabled: true,
                      backgroundColor: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(18,20,45,0.96)',
                      titleColor: isLight ? 'rgba(30,30,50,0.9)' : 'rgba(200,210,235,0.95)',
                      bodyColor: isLight ? 'rgba(30,30,50,0.72)' : 'rgba(170,185,215,0.85)',
                      borderColor: isLight ? 'rgba(117,81,233,0.2)' : 'rgba(117,81,233,0.3)',
                      borderWidth: 1,
                      padding: 10,
                      cornerRadius: 10,
                      filter: (item) => (item.raw as number) > 0,
                      callbacks: {
                        label: (context) =>
                          `  ${context.dataset.label}: ${new Intl.NumberFormat('ru-RU').format(context.raw as number)} ₽`,
                        footer: () => 'Нажмите для детализации',
                      }
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: isLight ? 'rgba(30,30,50,0.85)' : 'rgba(180, 190, 220, 0.7)',
                        font: { size: isMobile ? 10 : 11, family: 'Plus Jakarta Sans, sans-serif' as const },
                        maxTicksLimit: isMobile ? 4 : 6,
                        padding: 8,
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
                        font: { size: isMobile ? 9 : 11, family: 'Plus Jakarta Sans, sans-serif' as const },
                        maxRotation: 0,
                        minRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: isMobile ? 8 : 15,
                        padding: 4,
                      },
                      grid: { display: false },
                      border: { display: false },
                    }
                  }
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>
      <DrillDownModal filter={drillFilter} onClose={closeDrill} />
    </>
  );
};

export default CategoryExpensesChart;
