import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { usePeriod } from '@/contexts/PeriodContext';
import SavingsDrillModal from '../SavingsDrillModal';

interface SavingsData {
  total_amount: number;
  count: number;
}

const AnnualSavingsKPICard = () => {
  const { token } = useAuth();
  const { period, getDateRange, dateFrom, dateTo } = usePeriod();
  const [data, setData] = useState<SavingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingsOpen, setSavingsOpen] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { from, to } = getDateRange();
      const params = new URLSearchParams({
        startDate: from.toISOString(),
        endDate: to.toISOString(),
      });
      const res = await fetch(`${API_ENDPOINTS.main}?endpoint=savings-dashboard&${params}`, {
        headers: { 'X-Auth-Token': token },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [token, period, dateFrom, dateTo]);

  useEffect(() => {
    load();
  }, [load]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v).replace(/,/g, '.') + ' ₽';

  const total = data?.total_amount ?? 0;
  const count = data?.count ?? 0;
  const goal = 1_000_000;
  const progress = Math.min(Math.round((total / goal) * 100), 100);

  return (
    <>
    <Card
      style={{ background: 'hsl(var(--card))', border: '1px solid rgba(1, 181, 116, 0.3)', position: 'relative', overflow: 'hidden', cursor: loading ? 'default' : 'pointer' }}
      onClick={() => !loading && setSavingsOpen(true)}
    >
      <CardContent className="p-4 sm:p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          background: 'linear-gradient(135deg, #01b574 0%, #018c5a 100%)',
          padding: '8px', borderRadius: '10px',
          display: 'inline-flex', marginBottom: '14px'
        }} className="sm:p-3 sm:mb-5">
          <Icon name="PiggyBank" size={18} style={{ color: '#fff' }} className="sm:w-6 sm:h-6" />
        </div>

        <h3 className="text-[15px] font-bold text-foreground mb-3 sm:text-lg sm:mb-4">
          Экономия за период
        </h3>

        <div style={{
          color: '#01b574', fontSize: '32px', fontWeight: '900', marginBottom: '8px'
        }} className="sm:text-[42px] sm:mb-3">
          {loading ? '—' : fmt(total)}
        </div>

        <div className="text-muted-foreground text-xs mb-[14px] sm:text-sm sm:mb-5">
          {loading ? 'Загрузка...' : `${count} ${count === 1 ? 'запись' : count < 5 ? 'записи' : 'записей'} в реестре экономии`}
        </div>

        <div style={{
          background: 'rgba(1, 181, 116, 0.1)', padding: '10px',
          borderRadius: '8px', border: '1px solid rgba(1, 181, 116, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }} className="sm:mb-2">
            <span className="text-muted-foreground text-[11px] sm:text-xs">
              Прогресс к цели {fmt(goal)}
            </span>
            <span style={{ color: '#01b574' }} className="text-[11px] font-bold sm:text-xs">
              {loading ? '—' : `${progress}%`}
            </span>
          </div>
          <div style={{
            width: '100%', height: '6px', background: 'hsl(var(--muted))',
            borderRadius: '10px', overflow: 'hidden'
          }}>
            <div style={{
              width: loading ? '0%' : `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #01b574 0%, #01b574aa 100%)',
              borderRadius: '10px',
              transition: 'width 0.8s ease'
            }} />
          </div>
        </div>
      </CardContent>
    </Card>
    <SavingsDrillModal open={savingsOpen} onClose={() => setSavingsOpen(false)} />
    </>
  );
};

export default AnnualSavingsKPICard;