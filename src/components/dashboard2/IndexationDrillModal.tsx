import { useMemo, useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { usePeriod } from '@/contexts/PeriodContext';
import { usePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { parsePaymentDate, getPreviousPeriodRange } from './dashboardUtils';
import { exportIndexationToExcel } from '@/utils/exportExcel';

interface Props {
  open: boolean;
  onClose: () => void;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(v)
    .replace(/,/g, '.') + ' ₽';

const fmtPeriod = (from: Date, to: Date) => {
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
  const f = from.toLocaleDateString('ru-RU', opts);
  const t = to.toLocaleDateString('ru-RU', opts);
  return `${f} — ${t}`;
};

const IndexationDrillModal = ({ open, onClose }: Props) => {
  const { getDateRange, period, dateFrom, dateTo } = usePeriod();
  const { payments: allPayments } = usePaymentsCache();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const data = useMemo(() => {
    const { from, to } = getDateRange();
    const { prevFrom, prevTo } = getPreviousPeriodRange(period, from, to);

    const approved = (Array.isArray(allPayments) ? allPayments : []).filter(
      (p) => p.status === 'approved'
    );

    const currentPayments = approved.filter((p) => {
      const d = parsePaymentDate(p.payment_date);
      return !isNaN(d.getTime()) && d >= from && d <= to;
    });

    const previousPayments = approved.filter((p) => {
      const d = parsePaymentDate(p.payment_date);
      return !isNaN(d.getTime()) && d >= prevFrom && d <= prevTo;
    });

    const currentTotal = currentPayments.reduce((s, p) => s + p.amount, 0);
    const previousTotal = previousPayments.reduce((s, p) => s + p.amount, 0);

    const hasPrevious = previousPayments.length > 0 && previousTotal > 0;
    const diff = currentTotal - previousTotal;
    const percent: number | null = hasPrevious
      ? parseFloat(((diff / previousTotal) * 100).toFixed(1))
      : null;

    // Детализация по сервисам
    type SvcMap = Record<string, { name: string; current: number; previous: number }>;
    const buildMap = (payments: typeof approved) => {
      const map: SvcMap = {};
      payments.forEach((p) => {
        const key = p.service_id ? `svc_${p.service_id}` : 'no_service';
        const name = p.service_name || (p.service_id ? `Сервис ${p.service_id}` : 'Без сервиса');
        if (!map[key]) map[key] = { name, current: 0, previous: 0 };
        map[key].current += p.amount;
      });
      return map;
    };

    const curMap = buildMap(currentPayments);
    const prevMap = buildMap(previousPayments);

    // Объединяем все ключи из обоих периодов
    const allKeys = Array.from(new Set([...Object.keys(curMap), ...Object.keys(prevMap)]));
    const rows = allKeys.map((key) => {
      const name = (curMap[key] || prevMap[key]).name;
      const curAmt = curMap[key]?.current ?? 0;
      const prevAmt = prevMap[key]?.current ?? 0;
      const rowDiff = curAmt - prevAmt;
      const rowPct: number | null = prevAmt > 0
        ? parseFloat(((rowDiff / prevAmt) * 100).toFixed(1))
        : null;
      return { key, name, curAmt, prevAmt, rowDiff, rowPct };
    }).filter(r => r.curAmt > 0 || r.prevAmt > 0)
      .sort((a, b) => {
        if (a.rowPct === null && b.rowPct === null) return b.curAmt - a.curAmt;
        if (a.rowPct === null) return 1;
        if (b.rowPct === null) return -1;
        return Math.abs(b.rowPct) - Math.abs(a.rowPct);
      });

    return {
      from, to, prevFrom, prevTo,
      currentTotal, previousTotal, diff, percent,
      hasPrevious,
      currentCount: currentPayments.length,
      previousCount: previousPayments.length,
      rows,
    };
  }, [allPayments, period, dateFrom, dateTo]);

  if (!open) return null;

  const { from, to, prevFrom, prevTo, currentTotal, previousTotal, diff, percent, hasPrevious, currentCount, previousCount, rows } = data;

  const pctColor = percent === null
    ? 'hsl(var(--muted-foreground))'
    : percent > 0 ? '#ff6b6b' : percent < 0 ? '#01b574' : 'hsl(var(--foreground))';

  const diffColor = diff > 0 ? '#ff6b6b' : diff < 0 ? '#01b574' : 'hsl(var(--foreground))';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
        padding: isMobile ? '0' : '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: isMobile ? '20px 20px 0 0' : '20px',
        width: '100%',
        maxWidth: isMobile ? '100%' : '780px',
        maxHeight: isMobile ? '92vh' : '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        overflow: 'hidden',
      }}>

        {/* HEADER */}
        <div style={{
          padding: isMobile ? '16px' : '20px 24px',
          borderBottom: '1px solid hsl(var(--border))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, background: 'rgba(255,181,71,0.06)', gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(255,181,71,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name="TrendingUp" size={16} style={{ color: '#ffb547' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                Детализация: <span style={{ color: '#ffb547' }}>Индексация расходов</span>
              </div>
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
                Изменение расходов относительно предыдущего периода
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={() => exportIndexationToExcel(
                rows,
                fmtPeriod(from, to),
                fmtPeriod(prevFrom, prevTo),
                currentTotal,
                previousTotal,
              )}
              style={{
                height: '34px', borderRadius: '8px', padding: '0 12px',
                border: '1px solid hsl(var(--border))', background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                color: 'hsl(var(--muted-foreground))', flexShrink: 0, fontSize: '12px', fontWeight: 500,
              }}
            >
              <Icon name="Download" size={14} />
              {!isMobile && 'Excel'}
            </button>
            <button
              onClick={onClose}
              style={{
                width: '34px', height: '34px', borderRadius: '8px',
                border: '1px solid hsl(var(--border))', background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'hsl(var(--muted-foreground))', flexShrink: 0,
              }}
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px' : '20px 24px' }}>

          {/* Сводная таблица периодов */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Сравнение периодов
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              {/* Текущий период */}
              <div style={{
                background: 'hsl(var(--muted))', borderRadius: '12px', padding: '14px 16px',
                border: '1px solid hsl(var(--border))',
              }}>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>
                  Текущий период
                </div>
                <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}>
                  {fmtPeriod(from, to)}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                  {fmt(currentTotal)}
                </div>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
                  {currentCount} согласованных платежей
                </div>
              </div>

              {/* Прошлый период */}
              <div style={{
                background: 'hsl(var(--muted))', borderRadius: '12px', padding: '14px 16px',
                border: '1px solid hsl(var(--border))',
                opacity: hasPrevious ? 1 : 0.6,
              }}>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>
                  Предыдущий период
                </div>
                <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}>
                  {fmtPeriod(prevFrom, prevTo)}
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                  {hasPrevious ? fmt(previousTotal) : '—'}
                </div>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
                  {hasPrevious ? `${previousCount} согласованных платежей` : 'Нет данных'}
                </div>
              </div>
            </div>

            {/* Итог индексации */}
            <div style={{
              background: percent === null
                ? 'hsl(var(--muted))'
                : percent > 0
                ? 'rgba(255,107,107,0.08)'
                : percent < 0
                ? 'rgba(1,181,116,0.08)'
                : 'hsl(var(--muted))',
              borderRadius: '12px', padding: '14px 16px',
              border: `1px solid ${percent === null ? 'hsl(var(--border))' : percent > 0 ? 'rgba(255,107,107,0.3)' : percent < 0 ? 'rgba(1,181,116,0.3)' : 'hsl(var(--border))'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>
                  Индексация расходов
                </div>
                <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                  ((текущий − прошлый) / прошлый) × 100%
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {hasPrevious ? (
                  <>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: pctColor }}>
                      {percent !== null ? `${percent > 0 ? '+' : ''}${percent}%` : '—'}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: diffColor, marginTop: '2px' }}>
                      {diff > 0 ? '+' : ''}{fmt(diff)}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>
                    Нет базы для сравнения
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Детализация по сервисам */}
          {rows.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Разбивка по сервисам
              </div>

              {/* Заголовок таблицы */}
              {!isMobile && (
                <div style={{
                  display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 90px',
                  padding: '8px 12px', gap: '8px',
                  background: 'hsl(var(--muted))', borderRadius: '8px 8px 0 0',
                  border: '1px solid hsl(var(--border))', borderBottom: 'none',
                }}>
                  {['Сервис', 'Текущий период', 'Прошлый период', 'Разница', 'Индекс'].map(h => (
                    <div key={h} style={{ fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {h}
                    </div>
                  ))}
                </div>
              )}

              <div style={{ border: '1px solid hsl(var(--border))', borderRadius: isMobile ? '8px' : '0 0 8px 8px', overflow: 'hidden' }}>
                {rows.map((row, idx) => (
                  isMobile ? (
                    <div key={row.key} style={{
                      padding: '12px',
                      borderBottom: idx < rows.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255,181,71,0.02)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))', overflowWrap: 'anywhere', flex: 1, minWidth: 0, lineHeight: 1.3 }}>{row.name}</span>
                        <span style={{ fontSize: '14px', fontWeight: 700, flexShrink: 0, whiteSpace: 'nowrap', color: row.rowPct === null ? 'hsl(var(--muted-foreground))' : row.rowPct > 0 ? '#ff6b6b' : row.rowPct < 0 ? '#01b574' : 'hsl(var(--foreground))' }}>
                          {row.rowPct === null ? 'Новый' : `${row.rowPct > 0 ? '+' : ''}${row.rowPct}%`}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                        <span>Текущий: <b style={{ color: 'hsl(var(--foreground))' }}>{fmt(row.curAmt)}</b></span>
                        <span>Прошлый: <b style={{ color: 'hsl(var(--foreground))' }}>{row.prevAmt > 0 ? fmt(row.prevAmt) : '—'}</b></span>
                      </div>
                      {row.prevAmt > 0 && (
                        <div style={{ fontSize: '12px', marginTop: '4px', color: row.rowDiff > 0 ? '#ff6b6b' : row.rowDiff < 0 ? '#01b574' : 'hsl(var(--muted-foreground))' }}>
                          Разница: {row.rowDiff > 0 ? '+' : ''}{fmt(row.rowDiff)}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div key={row.key} style={{
                      display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr 90px',
                      padding: '10px 12px', gap: '8px', alignItems: 'flex-start',
                      borderBottom: idx < rows.length - 1 ? '1px solid hsl(var(--border))' : 'none',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(255,181,71,0.02)',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,181,71,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,181,71,0.02)')}
                    >
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))', overflowWrap: 'anywhere', minWidth: 0, lineHeight: 1.3 }}>
                        {row.name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'hsl(var(--foreground))', whiteSpace: 'nowrap' }}>
                        {fmt(row.curAmt)}
                      </div>
                      <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap' }}>
                        {row.prevAmt > 0 ? fmt(row.prevAmt) : <span style={{ opacity: 0.5 }}>—</span>}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: row.rowDiff > 0 ? '#ff6b6b' : row.rowDiff < 0 ? '#01b574' : 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap' }}>
                        {row.prevAmt > 0 ? `${row.rowDiff > 0 ? '+' : ''}${fmt(row.rowDiff)}` : <span style={{ opacity: 0.5 }}>—</span>}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, whiteSpace: 'nowrap', color: row.rowPct === null ? 'hsl(var(--muted-foreground))' : row.rowPct > 0 ? '#ff6b6b' : row.rowPct < 0 ? '#01b574' : 'hsl(var(--foreground))' }}>
                        {row.rowPct === null ? <span style={{ fontSize: '11px' }}>Новый</span> : `${row.rowPct > 0 ? '+' : ''}${row.rowPct}%`}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Нет данных вообще */}
          {rows.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', gap: '8px' }}>
              <Icon name="TrendingUp" size={40} style={{ color: 'hsl(var(--muted-foreground))', opacity: 0.4 }} />
              <div style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>
                Нет согласованных платежей за выбранный период
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexationDrillModal;