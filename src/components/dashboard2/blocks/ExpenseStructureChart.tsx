import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Doughnut } from 'react-chartjs-2';
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

interface CategoryData {
  name: string;
  value: number;
  amount: number;
  color: string;
}

const categoryColors: Record<string, string> = {
  'IT': 'rgb(117, 81, 233)',
  'Маркетинг': 'rgb(57, 101, 255)',
  'HR': 'rgb(255, 181, 71)',
  'Офис': 'rgb(1, 181, 116)',
  'Прочее': 'rgb(255, 107, 107)',
  'Разработка': 'rgb(78, 205, 196)',
  'Инфраструктура': 'rgb(227, 26, 26)',
  'Лицензии': 'rgb(255, 159, 243)',
};

const defaultColors = [
  'rgb(117, 81, 233)',
  'rgb(57, 101, 255)',
  'rgb(255, 181, 71)',
  'rgb(1, 181, 116)',
  'rgb(255, 107, 107)',
  'rgb(78, 205, 196)',
  'rgb(227, 26, 26)',
  'rgb(255, 159, 243)',
];

const activeStyle = {
  background: '#7551e9',
  border: 'none',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600' as const,
  boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)',
};

const inactiveStyle = {
  background: 'transparent',
  border: 'none',
  color: '#a3aed0',
  padding: '8px 16px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: '600' as const,
};

const ExpenseStructureChart = () => {
  const { period, getDateRange } = usePeriod();
  const [activeTab, setActiveTab] = useState<'general' | 'details'>('general');
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    const fetchExpenseStructure = async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`${API_ENDPOINTS.main}?endpoint=payments`);
        const data = await response.json();

        const { from, to } = getDateRange();

        const filtered = (Array.isArray(data) ? data : []).filter((p: PaymentRecord) => {
          if (p.status !== 'approved' && p.status !== 'paid') return false;
          const d = new Date(p.payment_date);
          return d >= from && d <= to;
        });

        const categoryMap: Record<string, number> = {};
        let total = 0;

        filtered.forEach((payment: PaymentRecord) => {
          const categoryName = payment.category_name || 'Прочее';
          categoryMap[categoryName] = (categoryMap[categoryName] || 0) + payment.amount;
          total += payment.amount;
        });

        const categoriesData = Object.entries(categoryMap)
          .map(([name, amount], index) => ({
            name,
            amount,
            value: total > 0 ? Math.round((amount / total) * 100) : 0,
            color: categoryColors[name] || defaultColors[index % defaultColors.length],
          }))
          .sort((a, b) => b.amount - a.amount);

        setCategories(categoriesData);
        setTotalAmount(total);
      } catch (error) {
        console.error('Failed to fetch expense structure:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseStructure();
  }, [period, getDateRange]);

  return (
    <Card style={{ background: '#111c44', border: '1px solid rgba(255, 181, 71, 0.4)', boxShadow: '0 0 30px rgba(255, 181, 71, 0.2), inset 0 0 15px rgba(255, 181, 71, 0.05)' }}>
      <CardContent className="p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Структура Расходов</h3>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
            <button style={activeTab === 'general' ? activeStyle : inactiveStyle} onClick={() => setActiveTab('general')}>
              Общие
            </button>
            <button style={activeTab === 'details' ? activeStyle : inactiveStyle} onClick={() => setActiveTab('details')}>
              Детали
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center" style={{ height: '350px' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height: '350px' }}>
            <p style={{ color: '#a3aed0' }}>Нет данных за выбранный период</p>
          </div>
        ) : activeTab === 'general' ? (
          <div className="h-[200px] sm:h-[350px]" style={{ position: 'relative' }}>
            <Doughnut
              data={{
                labels: categories.map(c => c.name),
                datasets: [{
                  data: categories.map(c => c.value),
                  backgroundColor: categories.map(c => c.color),
                  borderWidth: 0,
                  hoverOffset: 10
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      color: '#a3aed0',
                      font: { family: 'Plus Jakarta Sans, sans-serif', size: 13 }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const category = categories[context.dataIndex];
                        return `${context.label}: ${context.parsed}% (${new Intl.NumberFormat('ru-RU').format(category.amount)} ₽)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        ) : (
          <div className="h-[200px] sm:h-[350px]" style={{ overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: '#a3aed0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Категория</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', color: '#a3aed0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Доля</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', color: '#a3aed0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                        <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{cat.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '14px 12px' }}>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{cat.value}%</span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '14px 12px' }}>
                      <span style={{ color: '#a3aed0', fontSize: '14px' }}>{new Intl.NumberFormat('ru-RU').format(cat.amount)} ₽</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '16px', padding: '14px 12px', background: 'rgba(117, 81, 233, 0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>Итого</span>
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>
                {new Intl.NumberFormat('ru-RU').format(totalAmount)} ₽
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseStructureChart;