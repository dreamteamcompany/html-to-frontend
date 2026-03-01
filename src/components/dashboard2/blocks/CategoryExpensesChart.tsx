import { Card, CardContent } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { usePeriod } from '@/contexts/PeriodContext';
import Icon from '@/components/ui/icon';
import { dashboardTypography } from '../dashboardStyles';

interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  category_name?: string;
  [key: string]: unknown;
}

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

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

const colorsAlpha = [
  'rgba(117, 81, 233, 0.15)',
  'rgba(57, 101, 255, 0.15)',
  'rgba(255, 181, 71, 0.15)',
  'rgba(1, 181, 116, 0.15)',
  'rgba(227, 26, 26, 0.15)',
  'rgba(255, 107, 107, 0.15)',
  'rgba(78, 205, 196, 0.15)',
  'rgba(255, 159, 243, 0.15)',
];

const CategoryExpensesChart = () => {
  const { period, getDateRange, dateFrom, dateTo } = usePeriod();
  const [categoryData, setCategoryData] = useState<{ [category: string]: number[] }>({});
  const [xLabels, setXLabels] = useState<string[]>(MONTHS);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const controller = new AbortController();

    const { from, to } = getDateRange();
    const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

    const fetchCategoryData = async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`${API_ENDPOINTS.main}?endpoint=payments`);
        if (controller.signal.aborted) return;
        const data = await response.json();

        const filtered = (Array.isArray(data) ? data : []).filter((p: PaymentRecord) => {
          if (p.status !== 'approved') return false;
          const d = new Date(p.payment_date);
          return d >= from && d <= to;
        });
        let labels: string[];
        let getKey: (p: PaymentRecord) => string;

        if (period === 'today') {
          labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
          getKey = (p) => `${new Date(p.payment_date).getHours()}:00`;
        } else if (period === 'week' || (period === 'custom' && diffDays <= 7)) {
          labels = [];
          const cur = new Date(from);
          while (cur <= to) {
            labels.push(cur.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }));
            cur.setDate(cur.getDate() + 1);
          }
          getKey = (p) => {
            const d = new Date(p.payment_date);
            return d.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' });
          };
        } else if (period === 'month' || (period === 'custom' && diffDays <= 31)) {
          labels = [];
          const cur = new Date(from);
          while (cur <= to) {
            labels.push(cur.getDate().toString());
            cur.setDate(cur.getDate() + 1);
          }
          getKey = (p) => new Date(p.payment_date).getDate().toString();
        } else {
          labels = MONTHS;
          getKey = (p) => MONTHS[new Date(p.payment_date).getMonth()];
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

        setXLabels(labels);
        setCategoryData(result);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch category data:', error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchCategoryData();
    return () => controller.abort();
  }, [period, dateFrom, dateTo]);

  const categoryNames = Object.keys(categoryData);
  const total = categoryNames.reduce((sum, cat) => sum + categoryData[cat].reduce((s, v) => s + v, 0), 0);

  const datasets = categoryNames.map((category, index) => ({
    label: category,
    data: categoryData[category],
    backgroundColor: colors[index % colors.length],
    hoverBackgroundColor: colors[index % colors.length],
    borderRadius: isMobile ? 6 : 10,
    borderSkipped: false as const,
    maxBarThickness: isMobile ? 40 : 64,
    barPercentage: 0.9,
    categoryPercentage: 0.85,
  }));

  const tickColor = isLight ? 'rgba(30, 30, 50, 0.7)' : 'rgba(180, 190, 220, 0.75)';
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.07)' : 'rgba(255, 255, 255, 0.07)';

  return (
    <Card style={{
      background: 'hsl(var(--card))',
      border: '1px solid rgba(1,181,116,0.3)',
      borderTop: '4px solid #01b574',
      boxShadow: '0 4px 24px rgba(1,181,116,0.08)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Декоративный фон */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '200px', height: '200px',
        background: 'radial-gradient(circle at top right, rgba(1,181,116,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <CardContent className="p-4 sm:p-6" style={{ position: 'relative', zIndex: 1 }}>
        {/* Шапка */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(1,181,116,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name="LayoutGrid" size={16} style={{ color: '#01b574' }} />
              </div>
              <h3 className={dashboardTypography.cardTitle} style={{ fontSize: '15px' }}>
                IT Расходы по Категориям
              </h3>
            </div>
            {!loading && total > 0 && (
              <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginLeft: '40px' }}>
                Итого:{' '}
                <span style={{ color: '#01b574', fontWeight: 700 }}>
                  {total >= 1_000_000
                    ? `${(total / 1_000_000).toFixed(1)} млн ₽`
                    : total >= 1_000
                    ? `${Math.round(total / 1_000)} тыс ₽`
                    : `${total} ₽`}
                </span>
                {' · '}
                <span>{categoryNames.length} {categoryNames.length === 1 ? 'категория' : categoryNames.length < 5 ? 'категории' : 'категорий'}</span>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '260px', flexDirection: 'column', gap: '12px' }}>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#01b574' }} />
            <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Загрузка данных...</span>
          </div>
        ) : categoryNames.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px', gap: '12px' }}>
            <Icon name="PackageSearch" size={40} style={{ color: 'hsl(var(--muted-foreground))', opacity: 0.4 }} />
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>Нет данных за выбранный период</p>
          </div>
        ) : (
          <>
            {/* Цветные пилюли категорий */}
            {!isMobile && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {categoryNames.map((cat, i) => (
                  <div key={cat} style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '4px 10px', borderRadius: '99px',
                    background: colorsAlpha[i % colorsAlpha.length],
                    border: `1px solid ${colors[i % colors.length]}30`,
                  }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors[i % colors.length], flexShrink: 0 }} />
                    <span style={{ fontSize: '11px', fontWeight: 600, color: isLight ? 'rgba(30,30,50,0.85)' : 'rgba(210,220,240,0.9)', whiteSpace: 'nowrap' }}>
                      {cat}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="h-[220px] sm:h-[300px]" style={{ position: 'relative' }}>
              <Bar
                data={{ labels: xLabels, datasets }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { mode: 'index' as const, intersect: false },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      enabled: !isMobile,
                      backgroundColor: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(20,25,50,0.95)',
                      titleColor: isLight ? 'rgba(30,30,50,0.9)' : 'rgba(200,210,235,0.9)',
                      bodyColor: isLight ? 'rgba(30,30,50,0.75)' : 'rgba(180,190,220,0.8)',
                      borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                      borderWidth: 1,
                      padding: 10,
                      cornerRadius: 10,
                      callbacks: {
                        label: (context) =>
                          `  ${context.dataset.label}: ${new Intl.NumberFormat('ru-RU').format(context.raw as number)} ₽`,
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        color: tickColor,
                        font: { size: isMobile ? 10 : 11, family: 'Plus Jakarta Sans, sans-serif' },
                        maxTicksLimit: isMobile ? 4 : 6,
                        padding: 8,
                        callback: (value) => {
                          const v = value as number;
                          if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' млн';
                          if (v >= 1000) return (v / 1000).toFixed(0) + 'k';
                          return String(v);
                        },
                      },
                      grid: {
                        color: gridColor,
                        lineWidth: 1,
                      },
                      border: { dash: [4, 4], display: false },
                    },
                    x: {
                      ticks: {
                        color: tickColor,
                        font: { size: isMobile ? 9 : 11, family: 'Plus Jakarta Sans, sans-serif' },
                        maxRotation: isMobile ? 45 : 0,
                        minRotation: isMobile ? 45 : 0,
                        autoSkip: true,
                        maxTicksLimit: isMobile ? 6 : 14,
                        padding: 6,
                      },
                      grid: { display: false },
                      border: { display: false },
                    },
                  },
                }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryExpensesChart;