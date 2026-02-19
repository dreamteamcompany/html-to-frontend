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
  legal_entity_name?: string;
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

const LegalEntityComparisonChart = () => {
  const { period, getDateRange } = usePeriod();
  const [legalEntityData, setLegalEntityData] = useState<{ name: string, amount: number }[]>([]);
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

    const fetchLegalEntityData = async () => {
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

        const entityMap: { [key: string]: number } = {};
        filtered.forEach((payment: PaymentRecord) => {
          const entity = payment.legal_entity_name || 'Без юр. лица';
          entityMap[entity] = (entityMap[entity] || 0) + payment.amount;
        });

        const sorted = Object.entries(entityMap)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount);

        setLegalEntityData(sorted);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error('Failed to fetch legal entity data:', error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchLegalEntityData();
    return () => controller.abort();
  }, [period, getDateRange]);

  return (
    <Card style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
      <CardContent className="p-4 sm:p-6" style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '16px', minHeight: '32px', display: 'flex', alignItems: 'center' }}>
          <h3 className="text-base sm:text-lg" style={{ fontWeight: '700', color: '#000000' }}>Сравнение по Юридическим Лицам</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center" style={{ flex: 1 }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : legalEntityData.length === 0 ? (
          <div className="flex items-center justify-center" style={{ flex: 1 }}>
            <p style={{ color: '#000000' }}>Нет данных за выбранный период</p>
          </div>
        ) : (
          <div className="h-[200px] sm:h-[350px]" style={{ position: 'relative' }}>
            <Bar
              data={{
                labels: legalEntityData.map(d => d.name),
                datasets: [{
                  label: 'Расходы',
                  data: legalEntityData.map(d => d.amount),
                  backgroundColor: legalEntityData.map((_, i) => colors[i % colors.length]),
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

export default LegalEntityComparisonChart;