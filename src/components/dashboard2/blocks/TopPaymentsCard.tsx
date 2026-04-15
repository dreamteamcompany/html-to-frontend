import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { usePeriod } from '@/contexts/PeriodContext';
import { usePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { parsePaymentDate } from '../dashboardUtils';
import DrillDownModal from '../DrillDownModal';
import type { DrillDownFilter } from '../drillDownTypes';

interface PaymentRecord {
  id: number;
  status: string;
  payment_date: string;
  amount: number;
  description?: string;
  category_name?: string;
  service_name?: string;
  department_name?: string;
  [key: string]: unknown;
}

type GroupBy = 'services' | 'departments' | 'categories';

const TABS: { key: GroupBy; label: string }[] = [
  { key: 'services', label: 'Сервисы' },
  { key: 'departments', label: 'Отделы' },
  { key: 'categories', label: 'Категории' },
];

const getGroupKey = (p: PaymentRecord, groupBy: GroupBy): string => {
  if (groupBy === 'services') return (p.service_name as string) || 'Без сервиса';
  if (groupBy === 'departments') return (p.department_name as string) || 'Без отдела';
  return (p.category_name as string) || 'Без категории';
};

const getColor = (index: number) => {
  const colors = ['#7551e9', '#3965ff', '#01b574', '#ffb547', '#ff6b6b', '#e945a0', '#45b7e9', '#8bc34a', '#ff9800', '#9c27b0', '#00bcd4', '#cddc39'];
  return colors[index % colors.length];
};

const FILTER_TYPE_MAP: Record<GroupBy, DrillDownFilter['type']> = {
  services: 'service',
  departments: 'department',
  categories: 'category',
};

const LABEL_PREFIX_MAP: Record<GroupBy, string> = {
  services: 'Сервис',
  departments: 'Отдел',
  categories: 'Категория',
};

const TopPaymentsCard = () => {
  const { period, getDateRange, dateFrom, dateTo } = usePeriod();
  const { payments: allPayments, loading } = usePaymentsCache();
  const [groupBy, setGroupBy] = useState<GroupBy>('services');
  const [drillFilter, setDrillFilter] = useState<DrillDownFilter | null>(null);
  const [showAll, setShowAll] = useState(false);

  const allGrouped = useMemo(() => {
    const { from, to } = getDateRange();
    const filtered = (Array.isArray(allPayments) ? allPayments : []).filter((p: PaymentRecord) => {
      if (p.status !== 'approved') return false;
      const d = parsePaymentDate(p.payment_date);
      return !isNaN(d.getTime()) && d >= from && d <= to;
    });

    const map = new Map<string, number>();
    for (const p of filtered) {
      const key = getGroupKey(p, groupBy);
      map.set(key, (map.get(key) || 0) + p.amount);
    }

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, total]) => ({ name, total }));
  }, [allPayments, period, dateFrom, dateTo, groupBy]);

  const grouped = showAll ? allGrouped : allGrouped.slice(0, 5);
  const hasMore = allGrouped.length > 5;

  const maxAmount = grouped.length > 0 ? grouped[0].total : 1;

  const handleItemClick = (name: string) => {
    setDrillFilter({
      type: FILTER_TYPE_MAP[groupBy],
      value: name,
      label: `${LABEL_PREFIX_MAP[groupBy]}: ${name}`,
    });
  };

  if (loading) {
    return (
      <Card className="h-full flex flex-col" style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderTop: '4px solid #7551e9',
        boxShadow: '0 4px 28px rgba(117,81,233,0.13)'
      }}>
        <CardContent className="p-4 sm:p-6 flex flex-col flex-1 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full flex flex-col" style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderTop: '4px solid #7551e9',
        boxShadow: '0 4px 28px rgba(117,81,233,0.13)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <CardContent className="p-4 sm:p-6 flex flex-col flex-1" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }} className="sm:gap-3">
            <div style={{
              background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
              padding: '8px',
              borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)',
              flexShrink: 0
            }} className="sm:p-3">
              <Icon name="TrendingUp" size={18} style={{ color: '#fff' }} className="sm:w-6 sm:h-6" />
            </div>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'hsl(var(--foreground))', flex: 1 }} className="sm:text-base">Сравнение по сервисам</h3>
            <button
              onClick={() => setShowAll(!showAll)}
              disabled={!hasMore}
              style={{
                padding: '4px 12px',
                fontSize: '11px',
                fontWeight: '600',
                color: !hasMore ? 'hsl(var(--muted-foreground))' : showAll ? '#fff' : '#a78bfa',
                background: !hasMore ? 'transparent' : showAll ? 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)' : 'rgba(117, 81, 233, 0.15)',
                border: !hasMore ? '1px solid hsl(var(--border))' : showAll ? '1px solid transparent' : '1px solid #a78bfa',
                borderRadius: '6px',
                cursor: hasMore ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                opacity: hasMore ? 1 : 0.5,
              }}
            >
              {showAll ? 'Топ-5' : 'Все'}
            </button>
          </div>

          <div style={{
            display: 'flex',
            gap: '4px',
            background: 'hsl(var(--muted))',
            borderRadius: '8px',
            padding: '3px',
            marginBottom: '14px'
          }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setGroupBy(tab.key); setShowAll(false); }}
                style={{
                  flex: 1,
                  padding: '5px 0',
                  fontSize: '11px',
                  fontWeight: groupBy === tab.key ? '700' : '500',
                  color: groupBy === tab.key ? '#fff' : 'hsl(var(--muted-foreground))',
                  background: groupBy === tab.key ? 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: groupBy === tab.key ? '0 1px 4px rgba(117,81,233,0.4)' : 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: showAll ? '400px' : 'none', overflowY: showAll ? 'auto' : 'visible' }} className="sm:gap-3">
            {grouped.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Нет данных за выбранный период
              </div>
            ) : (
              grouped.map(({ name, total }, idx) => {
                const color = getColor(idx);
                const percent = (total / maxAmount) * 100;

                return (
                  <div
                    key={name}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleItemClick(name)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleItemClick(name); }}
                    style={{
                      background: 'hsl(var(--muted))',
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid hsl(var(--border))',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = color;
                      e.currentTarget.style.boxShadow = `0 2px 8px ${color}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'hsl(var(--border))';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{
                        color: 'hsl(var(--foreground))',
                        fontSize: '13px',
                        fontWeight: '600',
                        overflowWrap: 'anywhere',
                        flex: 1,
                        minWidth: 0,
                        lineHeight: 1.3,
                      }}>
                        {name}
                      </div>
                      <span style={{ color: color, fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)} ₽
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '5px',
                      background: 'hsl(var(--background))',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percent}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${color} 0%, ${color}aa 100%)`,
                        borderRadius: '10px',
                        boxShadow: `0 2px 8px ${color}40`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <DrillDownModal filter={drillFilter} onClose={() => setDrillFilter(null)} />
    </>
  );
};

export default TopPaymentsCard;