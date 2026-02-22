import { Card, CardContent } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
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

const CategoryExpensesChart = () => {
  const { period, getDateRange } = usePeriod();
  const [categoryData, setCategoryData] = useState<{ [category: string]: number[] }>({});
  const [xLabels, setXLabels] = useState<string[]>(MONTHS);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchCategoryData = async () => {
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

        const diffDays = Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
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
  }, [period, getDateRange]);

  const datasets = Object.keys(categoryData).map((category, index) => ({
    label: category,
    data: categoryData[category],
    backgroundColor: colors[index % colors.length],
    borderRadius: isMobile ? 4 : 8
  }));

  return (
    <Card style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
      <CardContent className="p-6">
        <div style={{ marginBottom: '16px' }}>
          <h3 className="text-base sm:text-lg" style={{ fontWeight: '700', color: 'hsl(var(--foreground))' }}>IT Расходы по Категориям</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: '250px' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : (
          <div className="h-[250px] sm:h-[350px]" style={{ position: 'relative' }}>
            <Bar
              data={{ labels: xLabels, datasets }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index' as const, intersect: false },
                plugins: {
                  legend: {
                    position: 'bottom',
                    display: !isMobile,
                    labels: {
                      padding: isMobile ? 10 : 20,
                      usePointStyle: true,
                      color: '#ffffff',
                      font: { family: 'Plus Jakarta Sans, sans-serif', size: isMobile ? 10 : 13 }
                    }
                  },
                  tooltip: {
                    enabled: !isMobile,
                    callbacks: {
                      label: (context) =>
                        `${context.dataset.label}: ${new Intl.NumberFormat('ru-RU').format(context.raw as number)} ₽`
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: 'rgba(117, 81, 233, 0.45)',
                      font: { size: isMobile ? 10 : 12 },
                      maxTicksLimit: isMobile ? 5 : 8,
                      callback: (value) => {
                        const v = value as number;
                        if (isMobile && v >= 1000) return (v / 1000).toFixed(0) + 'k ₽';
                        return new Intl.NumberFormat('ru-RU').format(v) + ' ₽';
                      }
                    },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' }
                  },
                  x: {
                    ticks: {
                      color: 'rgba(117, 81, 233, 0.45)',
                      font: { size: isMobile ? 9 : 12 },
                      maxRotation: isMobile ? 45 : 0,
                      minRotation: isMobile ? 45 : 0,
                      autoSkip: true,
                      maxTicksLimit: isMobile ? 6 : 15,
                    },
                    grid: { display: false }
                  }
                }
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CategoryExpensesChart;