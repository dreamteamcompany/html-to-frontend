import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { dashboardColors } from './dashboardStyles';
import { PaymentRecord } from '@/contexts/PaymentsCacheContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { usePeriod } from '@/contexts/PeriodContext';
import PlannedPaymentDetailModal from './PlannedPaymentDetailModal';

import { toDateStr, formatAmount, groupByDay, PERIOD_LABEL } from './UpcomingPaymentsTypes';
import UpcomingPaymentDaySection, { UpcomingEmptyState } from './UpcomingPaymentDaySection';

// ─── Main ─────────────────────────────────────────────────────────────────────

const Dashboard2UpcomingPayments = () => {
  const { token } = useAuth();
  const { period, getDateRange } = usePeriod();
  const [payments, setPayments]   = useState<PaymentRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<PaymentRecord | null>(null);


  const { dateFromStr, dateToStr } = useMemo(() => {
    const { from, to } = getDateRange();
    return { dateFromStr: toDateStr(from), dateToStr: toDateStr(to) };
  }, [getDateRange]);

  const abortRef = useRef<AbortController | null>(null);

  const fetchPayments = useCallback(() => {
    if (!token) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    fetch(
      `${API_ENDPOINTS.main}?endpoint=planned-payments&date_from=${dateFromStr}&date_to=${dateToStr}`,
      { headers: { 'X-Auth-Token': token }, signal: ctrl.signal }
    )
      .then(r => r.ok ? r.json() : [])
      .then((data: unknown) => {
        if (ctrl.signal.aborted) return;
        const list = Array.isArray(data) ? data : [];
        const mapped: PaymentRecord[] = (list as Record<string, unknown>[]).map(pp => ({
          id:                  pp.id as number,
          status:              'scheduled',
          payment_date:        String(pp.planned_date as string).slice(0, 10),
          amount:              pp.amount as number,
          description:         pp.description as string,
          category_id:         pp.category_id as number,
          category_name:       pp.category_name as string,
          category_icon:       pp.category_icon as string,
          service_id:          pp.service_id as number,
          service_name:        pp.service_name as string,
          department_id:       pp.department_id as number,
          department_name:     pp.department_name as string,
          contractor_name:     pp.contractor_name as string,
          legal_entity_name:   pp.legal_entity_name as string,
          payment_type:        'planned',
          _isPlanned:          true,
          recurrence_type:     pp.recurrence_type as string | undefined,
          recurrence_end_date: pp.recurrence_end_date as string | undefined,
        }));
        setPayments(mapped);
      })
      .catch((e: unknown) => {
        if ((e as {name?: string}).name !== 'AbortError') setPayments([]);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
  }, [token, dateFromStr, dateToStr]);

  useEffect(() => {
    fetchPayments();
    return () => { abortRef.current?.abort(); };
  }, [fetchPayments]);

  const sorted = useMemo(() => {
    return [...payments]
      .filter(p => {
        const dk = String(p.payment_date).slice(0, 10);
        return dk >= dateFromStr && dk <= dateToStr;
      })
      .sort((a, b) => {
        const ka = String(a.payment_date).slice(0, 10);
        const kb = String(b.payment_date).slice(0, 10);
        return ka.localeCompare(kb);
      });
  }, [payments, dateFromStr, dateToStr]);

  const total  = useMemo(() => sorted.reduce((s, p) => s + (parseFloat(String(p.amount)) || 0), 0), [sorted]);
  const groups = useMemo(() => groupByDay(sorted, dateFromStr, dateToStr), [sorted, dateFromStr, dateToStr]);
  const count  = sorted.length;
  const cLabel = count === 1 ? 'платёж' : count < 5 ? 'платежа' : 'платежей';

  return (
    <Card style={{
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      marginBottom: '30px',
      borderRadius: '14px',
      overflow: 'hidden',
    }}>
      <CardContent style={{ padding: 'clamp(14px, 4vw, 20px) clamp(12px, 4vw, 22px)' }}>

        {/* ── Шапка ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 'clamp(14px, 3vw, 20px)', paddingBottom: 'clamp(10px, 3vw, 16px)',
          borderBottom: '1px solid hsl(var(--border) / 0.5)',
          gap: '8px', minWidth: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(8px, 2.5vw, 12px)', minWidth: 0, flex: '1 1 0', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffb547 0%, #ff9500 100%)',
              width: 'clamp(32px, 9vw, 40px)', height: 'clamp(32px, 9vw, 40px)', borderRadius: '10px',
              boxShadow: '0 3px 10px rgba(255,149,0,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon name="CalendarClock" size={18} style={{ color: '#fff' }} />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: 'clamp(13px, 3.5vw, 15px)', fontWeight: 700, color: 'hsl(var(--foreground))', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Предстоящие платежи
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 'clamp(10px, 2.8vw, 12px)', color: 'hsl(var(--muted-foreground))' }}>
                  {PERIOD_LABEL[period] ?? 'Выбранный период'}
                </span>
                {!loading && count > 0 && (
                  <span style={{
                    fontSize: 'clamp(9px, 2.5vw, 11px)', fontWeight: 700, color: dashboardColors.orange,
                    background: `${dashboardColors.orange}12`,
                    padding: '2px 8px', borderRadius: '6px',
                    whiteSpace: 'nowrap',
                  }}>
                    {count} {cLabel} · {formatAmount(total)}
                  </span>
                )}
              </div>
            </div>
          </div>


        </div>

        {/* ── Тело ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '44px 0' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '50%',
              border: '2.5px solid hsl(var(--border))',
              borderTopColor: dashboardColors.orange,
              animation: 'spin 0.7s linear infinite',
            }} />
          </div>
        ) : count === 0 ? (
          <UpcomingEmptyState period={period} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {groups.map(group => (
              <UpcomingPaymentDaySection key={group.dateKey} group={group} onPaymentClick={setSelected} />
            ))}
          </div>
        )}

      </CardContent>

      <PlannedPaymentDetailModal
        payment={selected}
        onClose={() => setSelected(null)}
        onActionDone={fetchPayments}
      />



      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Card>
  );
};

export default Dashboard2UpcomingPayments;