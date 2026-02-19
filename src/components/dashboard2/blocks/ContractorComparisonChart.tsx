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
  contractor_name?: string;
  [key: string]: unknown;
}

const colors = [
  'rgb(117, 81, 233)',
  'rgb(57, 101, 255)',
  'rgb(255, 181, 71)',
  'rgb(1, 181, 116)',
  'rgb(255, 107, 107)',
  'rgb(78, 205, 196)',
  'rgb(227, 26, 26)',
  'rgb(255, 159, 243)'
];

const ContractorComparisonChart = () => {
  const { period, getDateRange } = usePeriod();
  const [contractorData, setContractorData] = useState<{ name: string, amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchContractorData = async () => {
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

        const contractorMap: { [key: string]: number } = {};
        filtered.forEach((payment: PaymentRecord) => {
          const contractor = payment.contractor_name || 'Без контрагента';
          contractorMap[contractor] = (contractorMap[contractor] || 0) + payment.amount;
        });

        const sorted = Object.entries(contractorMap)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount);

        setContractorData(sorted);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch contractor data:', error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchContractorData();
    return () => controller.abort();
  }, [period, getDateRange]);

  const displayData = showAll ? contractorData : contractorData.slice(0, 5);

  return (
    <Card style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
      <CardContent className="p-4 sm:p-6" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', minHeight: '32px' }}>
          <h3 className="text-base sm:text-lg" style={{ fontWeight: '700', color: 'hsl(var(--foreground))' }}>Сравнение по Контрагентам</h3>
          <div style={{ display: 'flex', gap: '8px', background: 'hsl(var(--muted))', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setShowAll(false)}
              style={{ background: !showAll ? '#7551e9' : 'transparent', border: 'none', color: !showAll ? 'white' : '#000000', padding: isMobile ? '6px 12px' : '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px', fontWeight: '600', boxShadow: !showAll ? '0 2px 8px rgba(117, 81, 233, 0.3)' : 'none' }}
            >
              Топ-5
            </button>
            <button
              onClick={() => setShowAll(true)}
              style={{ background: showAll ? '#7551e9' : 'transparent', border: 'none', color: showAll ? 'white' : '#000000', padding: isMobile ? '6px 12px' : '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: isMobile ? '11px' : '13px', fontWeight: '600', boxShadow: showAll ? '0 2px 8px rgba(117, 81, 233, 0.3)' : 'none' }}
            >
              Все
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center" style={{ flex: 1 }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : displayData.length === 0 ? (
          <div className="flex items-center justify-center" style={{ flex: 1 }}>
            <p style={{ color: '#000000' }}>Нет данных за выбранный период</p>
          </div>
        ) : (
          <div className="h-[200px] sm:h-[350px]" style={{ position: 'relative' }}>
            <Bar
              data={{
                labels: displayData.map(d => d.name),
                datasets: [{
                  label: 'Расходы',
                  data: displayData.map(d => d.amount),
                  backgroundColor: displayData.map((_, i) => colors[i % colors.length]),
                  borderRadius: isMobile ? 4 : 8,
                  barThickness: isMobile ? 20 : 30
                }]
              }}
              options={{
                indexAxis: 'y' as const,
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index' as const, intersect: false },
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: !isMobile,
                    callbacks: {
                      label: (context) =>
                        `Расходы: ${new Intl.NumberFormat('ru-RU').format(context.raw as number)} ₽`
                    }
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      color: '#000000',
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
                  y: {
                    ticks: { color: '#000000', font: { size: isMobile ? 9 : 12 } },
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

export default ContractorComparisonChart;