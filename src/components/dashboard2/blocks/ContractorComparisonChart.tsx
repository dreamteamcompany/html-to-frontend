import { Card, CardContent } from '@/components/ui/card';
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

const PALETTE = [
  { bar: '#7551e9', glow: 'rgba(117,81,233,0.25)', badge: 'rgba(117,81,233,0.15)', text: '#7551e9' },
  { bar: '#3965ff', glow: 'rgba(57,101,255,0.2)',  badge: 'rgba(57,101,255,0.12)',  text: '#3965ff' },
  { bar: '#01b574', glow: 'rgba(1,181,116,0.2)',   badge: 'rgba(1,181,116,0.12)',   text: '#01b574' },
  { bar: '#ffb547', glow: 'rgba(255,181,71,0.2)',  badge: 'rgba(255,181,71,0.12)',  text: '#e09000' },
  { bar: '#ff6b6b', glow: 'rgba(255,107,107,0.2)', badge: 'rgba(255,107,107,0.12)', text: '#e04040' },
];

const MEDAL = ['🥇', '🥈', '🥉'];

const fmt = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} млн ₽`;
  if (v >= 1_000) return `${Math.round(v / 1_000)} тыс ₽`;
  return `${v} ₽`;
};

const ContractorComparisonChart = () => {
  const { period, getDateRange } = usePeriod();
  const [contractorData, setContractorData] = useState<{ name: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchContractorData = async () => {
      setLoading(true);
      setMounted(false);
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
        if (!controller.signal.aborted) console.error('Failed to fetch contractor data:', error);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
          setTimeout(() => setMounted(true), 80);
        }
      }
    };
    fetchContractorData();
    return () => controller.abort();
  }, [period, getDateRange]);

  const displayData = showAll ? contractorData : contractorData.slice(0, 5);
  const maxAmount = displayData[0]?.amount || 1;
  const total = contractorData.reduce((s, c) => s + c.amount, 0);

  return (
    <Card style={{
      background: 'hsl(var(--card))',
      border: '1px solid rgba(117,81,233,0.3)',
      borderTop: '4px solid #7551e9',
      boxShadow: '0 4px 24px rgba(117,81,233,0.1)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Декоративный фоновый градиент */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '200px', height: '200px',
        background: 'radial-gradient(circle at top right, rgba(117,81,233,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <CardContent className="p-4 sm:p-6" style={{ position: 'relative', zIndex: 1 }}>
        {/* Шапка */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(117,81,233,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon name="Trophy" size={16} style={{ color: '#7551e9' }} />
              </div>
              <h3 className={dashboardTypography.cardTitle} style={{ fontSize: '15px' }}>
                Сравнение по Контрагентам
              </h3>
            </div>
            {!loading && total > 0 && (
              <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginLeft: '40px' }}>
                Итого: <span style={{ color: '#7551e9', fontWeight: 700 }}>{fmt(total)}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '4px', background: 'hsl(var(--muted))', padding: '3px', borderRadius: '10px' }}>
            {[{ label: 'Топ-5', val: false }, { label: 'Все', val: true }].map(({ label, val }) => (
              <button
                key={label}
                onClick={() => setShowAll(val)}
                style={{
                  background: showAll === val ? '#7551e9' : 'transparent',
                  border: 'none',
                  color: showAll === val ? 'white' : 'hsl(var(--muted-foreground))',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  boxShadow: showAll === val ? '0 2px 8px rgba(117,81,233,0.35)' : 'none',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Контент */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px', flexDirection: 'column', gap: '12px' }}>
            <div className="animate-spin rounded-full h-10 w-10 border-b-2" style={{ borderColor: '#7551e9' }} />
            <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Загрузка данных...</span>
          </div>
        ) : displayData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '220px', gap: '12px' }}>
            <Icon name="PackageSearch" size={40} style={{ color: 'hsl(var(--muted-foreground))', opacity: 0.4 }} />
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>Нет данных за выбранный период</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayData.map((item, i) => {
              const palette = PALETTE[i % PALETTE.length];
              const pct = (item.amount / maxAmount) * 100;
              const share = total > 0 ? Math.round((item.amount / total) * 100) : 0;
              const isHov = hovered === i;

              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: `1px solid ${isHov ? palette.bar + '50' : 'hsl(var(--border))'}`,
                    background: isHov ? palette.badge : 'hsl(var(--muted) / 0.3)',
                    transition: 'all 0.2s ease',
                    cursor: 'default',
                    boxShadow: isHov ? `0 4px 16px ${palette.glow}` : 'none',
                  }}
                >
                  {/* Строка: ранг + имя + сумма */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    {/* Ранг */}
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                      background: i < 3 ? palette.badge : 'hsl(var(--muted))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: i < 3 ? '16px' : '12px',
                      fontWeight: 800,
                      color: i < 3 ? palette.text : 'hsl(var(--muted-foreground))',
                      border: `1px solid ${i < 3 ? palette.bar + '30' : 'transparent'}`,
                    }}>
                      {i < 3 ? MEDAL[i] : i + 1}
                    </div>

                    {/* Имя */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px', fontWeight: 600,
                        color: 'hsl(var(--foreground))',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.name}
                      </div>
                    </div>

                    {/* Сумма + доля */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: palette.text }}>
                        {fmt(item.amount)}
                      </div>
                      <div style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', marginTop: '1px' }}>
                        {share}% от итога
                      </div>
                    </div>
                  </div>

                  {/* Прогресс-бар */}
                  <div style={{
                    height: '5px', borderRadius: '99px',
                    background: 'hsl(var(--muted))',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: '99px',
                      background: `linear-gradient(90deg, ${palette.bar}, ${palette.bar}aa)`,
                      boxShadow: isHov ? `0 0 8px ${palette.glow}` : 'none',
                      width: mounted ? `${pct}%` : '0%',
                      transition: 'width 0.7s cubic-bezier(.4,0,.2,1)',
                      transitionDelay: `${i * 60}ms`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContractorComparisonChart;
