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
  contractor_name?: string;
  [key: string]: unknown;
}

const BAR_COLORS = [
  'rgba(117, 81, 233, 0.85)',
  'rgba(57, 101, 255, 0.85)',
  'rgba(1, 181, 116, 0.85)',
  'rgba(255, 181, 71, 0.85)',
  'rgba(255, 107, 107, 0.85)',
  'rgba(78, 205, 196, 0.85)',
  'rgba(227, 26, 26, 0.85)',
  'rgba(255, 159, 243, 0.85)',
];

const BAR_COLORS_SOLID = [
  'rgb(117, 81, 233)',
  'rgb(57, 101, 255)',
  'rgb(1, 181, 116)',
  'rgb(255, 181, 71)',
  'rgb(255, 107, 107)',
  'rgb(78, 205, 196)',
  'rgb(227, 26, 26)',
  'rgb(255, 159, 243)',
];

const fmt = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₽`;
  if (v >= 1_000) return `${Math.round(v / 1_000)} тыс ₽`;
  return new Intl.NumberFormat('ru-RU').format(v) + ' ₽';
};

const ContractorComparisonChart = () => {
  const { period, getDateRange, dateFrom, dateTo } = usePeriod();
  const [contractorData, setContractorData] = useState<{ name: string, amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
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

    const fetchContractorData = async () => {
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
        if (!controller.signal.aborted) console.error('Failed to fetch contractor data:', error);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchContractorData();
    return () => controller.abort();
  }, [period, dateFrom, dateTo]);

  const displayData = showAll ? contractorData : contractorData.slice(0, 5);
  const total = contractorData.reduce((s, c) => s + c.amount, 0);

  const tickColor = isLight ? 'rgba(30, 30, 50, 0.7)' : 'rgba(180, 190, 220, 0.75)';
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.07)' : 'rgba(255, 255, 255, 0.06)';

  return (
    <Card style={{
      background: 'hsl(var(--card))',
      border: '1px solid rgba(117,81,233,0.25)',
      borderTop: '4px solid #7551e9',
      boxShadow: isLight ? '0 4px 20px rgba(117,81,233,0.07)' : '0 4px 24px rgba(117,81,233,0.12)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Декоративный фон */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '200px', height: '200px',
        background: 'radial-gradient(circle at top right, rgba(117,81,233,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <CardContent className="p-4 sm:p-6" style={{ position: 'relative', zIndex: 1 }}>
        {/* Шапка */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                background: 'rgba(117,81,233,0.12)',
                border: '1px solid rgba(117,81,233,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="Users" size={16} style={{ color: '#7551e9' }} />
              </div>
              <h3 className={dashboardTypography.cardTitle} style={{ fontSize: '15px' }}>
                Сравнение по Контрагентам
              </h3>
            </div>
            {!loading && total > 0 && (
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginLeft: '44px' }}>
                Итого: <span style={{ color: '#7551e9', fontWeight: 700 }}>{fmt(total)}</span>
                <span style={{ marginLeft: '6px', opacity: 0.7 }}>· {contractorData.length} контрагентов</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '3px', background: isLight ? 'rgba(0,0,0,0.05)' : 'hsl(var(--muted))', padding: '3px', borderRadius: '10px' }}>
            {[{ label: 'Топ-5', val: false }, { label: 'Все', val: true }].map(({ label, val }) => (
              <button
                key={label}
                onClick={() => setShowAll(val)}
                style={{
                  background: showAll === val ? '#7551e9' : 'transparent',
                  border: 'none',
                  color: showAll === val ? 'white' : 'hsl(var(--muted-foreground))',
                  padding: isMobile ? '5px 10px' : '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: isMobile ? '11px' : '12px',
                  fontWeight: '600',
                  transition: 'all 0.18s',
                  boxShadow: showAll === val ? '0 2px 10px rgba(117,81,233,0.4)' : 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', flexDirection: 'column', gap: '12px' }}>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#7551e9' }} />
            <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Загрузка данных...</span>
          </div>
        ) : displayData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', gap: '12px' }}>
            <Icon name="PackageSearch" size={44} style={{ color: 'hsl(var(--muted-foreground))', opacity: 0.35 }} />
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>Нет данных за выбранный период</p>
          </div>
        ) : (
          <>
            {/* Цветные пилюли-легенда */}
            {!isMobile && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                {displayData.map((item, i) => (
                  <div key={item.name} style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '3px 9px', borderRadius: '99px',
                    background: isLight ? `${BAR_COLORS_SOLID[i % BAR_COLORS_SOLID.length]}14` : `${BAR_COLORS_SOLID[i % BAR_COLORS_SOLID.length]}18`,
                    border: `1px solid ${BAR_COLORS_SOLID[i % BAR_COLORS_SOLID.length]}30`,
                  }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: BAR_COLORS_SOLID[i % BAR_COLORS_SOLID.length], flexShrink: 0 }} />
                    <span style={{
                      fontSize: '11px', fontWeight: 600,
                      color: isLight ? 'rgba(30,30,50,0.85)' : 'rgba(210,220,240,0.9)',
                      whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="h-[200px] sm:h-[320px]" style={{ position: 'relative' }}>
              <Bar
                data={{
                  labels: displayData.map(d => d.name),
                  datasets: [{
                    label: 'Расходы',
                    data: displayData.map(d => d.amount),
                    backgroundColor: displayData.map((_, i) => BAR_COLORS[i % BAR_COLORS.length]),
                    hoverBackgroundColor: displayData.map((_, i) => BAR_COLORS_SOLID[i % BAR_COLORS_SOLID.length]),
                    borderRadius: isMobile ? 5 : 8,
                    borderSkipped: false as const,
                    barPercentage: 0.85,
                    categoryPercentage: 0.8,
                    maxBarThickness: isMobile ? 32 : 48,
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
                      backgroundColor: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(20,25,50,0.95)',
                      titleColor: isLight ? 'rgba(30,30,50,0.9)' : 'rgba(200,210,235,0.9)',
                      bodyColor: isLight ? 'rgba(30,30,50,0.75)' : 'rgba(180,190,220,0.8)',
                      borderColor: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
                      borderWidth: 1,
                      padding: 10,
                      cornerRadius: 10,
                      callbacks: {
                        label: (context) =>
                          `  ${new Intl.NumberFormat('ru-RU').format(context.raw as number)} ₽`,
                        title: (items) => items[0]?.label ?? '',
                      }
                    }
                  },
                  scales: {
                    x: {
                      beginAtZero: true,
                      ticks: {
                        color: tickColor,
                        font: { size: isMobile ? 10 : 11, family: 'Plus Jakarta Sans, sans-serif' },
                        maxTicksLimit: isMobile ? 5 : 7,
                        padding: 6,
                        callback: (value) => {
                          const v = value as number;
                          if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + ' млн';
                          if (v >= 1_000) return Math.round(v / 1_000) + 'k';
                          return String(v);
                        }
                      },
                      grid: {
                        color: gridColor,
                        lineWidth: 1,
                      },
                      border: { dash: [4, 4], display: false },
                    },
                    y: {
                      ticks: {
                        color: tickColor,
                        font: { size: isMobile ? 9 : 11, family: 'Plus Jakarta Sans, sans-serif' },
                        padding: 6,
                      },
                      grid: { display: false },
                      border: { display: false },
                    }
                  }
                }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractorComparisonChart;
