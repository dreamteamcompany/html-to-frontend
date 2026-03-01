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
  { bar: '#7551e9', glow: 'rgba(117,81,233,0.2)', bg: 'rgba(117,81,233,0.1)', text: '#7551e9', lightText: '#5b35d4' },
  { bar: '#3965ff', glow: 'rgba(57,101,255,0.2)',  bg: 'rgba(57,101,255,0.1)',  text: '#3965ff', lightText: '#2450e0' },
  { bar: '#01b574', glow: 'rgba(1,181,116,0.2)',   bg: 'rgba(1,181,116,0.1)',   text: '#01b574', lightText: '#008f5a' },
  { bar: '#ffb547', glow: 'rgba(255,181,71,0.2)',  bg: 'rgba(255,181,71,0.1)',  text: '#d48000', lightText: '#c07000' },
  { bar: '#ff6b6b', glow: 'rgba(255,107,107,0.2)', bg: 'rgba(255,107,107,0.1)', text: '#e04040', lightText: '#c82020' },
];

const RANK_ICONS = ['Crown', 'Medal', 'Award', 'Star', 'TrendingUp'];

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
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
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
      border: '1px solid rgba(117,81,233,0.25)',
      borderTop: '4px solid #7551e9',
      boxShadow: isLight
        ? '0 4px 20px rgba(117,81,233,0.08)'
        : '0 4px 24px rgba(117,81,233,0.12)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '180px', height: '180px',
        background: 'radial-gradient(circle at top right, rgba(117,81,233,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <CardContent className="p-4 sm:p-6" style={{ position: 'relative', zIndex: 1 }}>
        {/* Шапка */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '10px',
                background: 'rgba(117,81,233,0.12)',
                border: '1px solid rgba(117,81,233,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon name="Trophy" size={16} style={{ color: '#7551e9' }} />
              </div>
              <div>
                <h3 className={dashboardTypography.cardTitle} style={{ fontSize: '15px', lineHeight: 1.2 }}>
                  Сравнение по Контрагентам
                </h3>
                {!loading && total > 0 && (
                  <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
                    Итого:{' '}
                    <span style={{ color: '#7551e9', fontWeight: 700 }}>{fmt(total)}</span>
                    {contractorData.length > 0 && (
                      <span style={{ marginLeft: '6px', opacity: 0.7 }}>· {contractorData.length} контрагентов</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex', gap: '3px',
            background: isLight ? 'rgba(0,0,0,0.05)' : 'hsl(var(--muted))',
            padding: '3px', borderRadius: '10px',
          }}>
            {[{ label: 'Топ-5', val: false }, { label: 'Все', val: true }].map(({ label, val }) => (
              <button
                key={label}
                onClick={() => setShowAll(val)}
                style={{
                  background: showAll === val ? '#7551e9' : 'transparent',
                  border: 'none',
                  color: showAll === val ? 'white' : 'hsl(var(--muted-foreground))',
                  padding: '5px 13px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '12px',
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

        {/* Контент */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {displayData.map((item, i) => {
              const palette = PALETTE[i % PALETTE.length];
              const pct = (item.amount / maxAmount) * 100;
              const share = total > 0 ? Math.round((item.amount / total) * 100) : 0;
              const isHov = hovered === i;
              const accentColor = isLight ? palette.lightText : palette.text;

              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: `1px solid ${isHov
                      ? palette.bar + '45'
                      : isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)'}`,
                    background: isHov
                      ? (isLight ? palette.bg.replace('0.1)', '0.07)') : palette.bg)
                      : (isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'),
                    transition: 'all 0.18s ease',
                    cursor: 'default',
                    boxShadow: isHov ? `0 4px 20px ${palette.glow}` : 'none',
                  }}
                >
                  {/* Верхняя строка */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}>
                    {/* Иконка ранга */}
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                      background: isHov
                        ? (isLight ? palette.bg.replace('0.1)', '0.14)') : palette.bg.replace('0.1)', '0.18)'))
                        : (isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'),
                      border: `1px solid ${isHov ? palette.bar + '35' : 'transparent'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.18s',
                    }}>
                      <Icon
                        name={RANK_ICONS[i] as Parameters<typeof Icon>[0]['name']}
                        size={14}
                        style={{ color: isHov ? accentColor : 'hsl(var(--muted-foreground))' }}
                      />
                    </div>

                    {/* Номер позиции */}
                    <div style={{
                      fontSize: '11px', fontWeight: 800,
                      color: isHov ? accentColor : 'hsl(var(--muted-foreground))',
                      minWidth: '18px', flexShrink: 0,
                      transition: 'color 0.18s',
                    }}>
                      #{i + 1}
                    </div>

                    {/* Имя */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px', fontWeight: 600,
                        color: isHov ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        opacity: isHov ? 1 : 0.85,
                        transition: 'opacity 0.18s',
                      }}>
                        {item.name}
                      </div>
                    </div>

                    {/* Сумма */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: '14px', fontWeight: 800,
                        color: accentColor,
                        letterSpacing: '-0.3px',
                      }}>
                        {fmt(item.amount)}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: 'hsl(var(--muted-foreground))',
                        marginTop: '1px',
                        opacity: 0.8,
                      }}>
                        {share}% от итога
                      </div>
                    </div>
                  </div>

                  {/* Прогресс-бар с фоновым треком */}
                  <div style={{ position: 'relative', height: '4px', borderRadius: '99px', overflow: 'hidden',
                    background: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.07)',
                  }}>
                    <div style={{
                      position: 'absolute', left: 0, top: 0, height: '100%',
                      borderRadius: '99px',
                      background: `linear-gradient(90deg, ${palette.bar}, ${palette.bar}cc)`,
                      boxShadow: isHov ? `0 0 8px ${palette.glow}` : 'none',
                      width: mounted ? `${pct}%` : '0%',
                      transition: 'width 0.65s cubic-bezier(.4,0,.2,1)',
                      transitionDelay: `${i * 55}ms`,
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
