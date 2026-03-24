import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { dashboardColors } from './dashboardStyles';
import { PaymentRecord } from '@/contexts/PaymentsCacheContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { usePeriod } from '@/contexts/PeriodContext';
import PlannedPaymentDetailModal from './PlannedPaymentDetailModal';
import PlannedPaymentForm from '@/components/payments/PlannedPaymentForm';
import { usePlannedPaymentForm } from '@/hooks/usePlannedPaymentForm';
import { toDateStr, formatAmount, groupByDay, PERIOD_LABEL } from './UpcomingPaymentsTypes';
import UpcomingPaymentDaySection, { UpcomingEmptyState } from './UpcomingPaymentDaySection';

// ─── Main ─────────────────────────────────────────────────────────────────────

const Dashboard2UpcomingPayments = () => {
  const { token, hasPermission } = useAuth();
  const { period, getDateRange } = usePeriod();
  const [payments, setPayments]   = useState<PaymentRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<PaymentRecord | null>(null);
  const [dicts, setDicts] = useState<{
    categories: {id:number;name:string;icon:string}[];
    legalEntities: {id:number;name:string}[];
    contractors: {id:number;name:string}[];
    customerDepartments: {id:number;name:string}[];
    services: {id:number;name:string;description:string}[];
    dictsLoaded: boolean;
  }>({ categories:[], legalEntities:[], contractors:[], customerDepartments:[], services:[], dictsLoaded:false });

  const loadDicts = useCallback(async () => {
    if (!token || dicts.dictsLoaded) return;
    const [catR, leR, contrR, deptR, svcR] = await Promise.all([
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=categories`,           { headers:{'X-Auth-Token':token} }),
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=legal-entities`,       { headers:{'X-Auth-Token':token} }),
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=contractors`,          { headers:{'X-Auth-Token':token} }),
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=customer-departments`, { headers:{'X-Auth-Token':token} }),
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=services`,             { headers:{'X-Auth-Token':token} }),
    ]);
    setDicts({
      categories:          catR.ok  ? await catR.json()   : [],
      legalEntities:       leR.ok   ? await leR.json()    : [],
      contractors:         contrR.ok ? await contrR.json() : [],
      customerDepartments: deptR.ok  ? await deptR.json()  : [],
      services:            svcR.ok   ? await svcR.json()   : [],
      dictsLoaded: true,
    });
  }, [token, dicts.dictsLoaded]);

  const { dialogOpen, setDialogOpen, formData, setFormData, handleSubmit } = usePlannedPaymentForm(
    [],
    () => { fetchPayments(); }
  );

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
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      marginBottom: '30px',
    }}>
      <CardContent style={{ padding: '16px 20px' }}>

        {/* ── Шапка ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '14px', paddingBottom: '12px',
          borderBottom: '1px solid hsl(var(--border))',
          gap: '8px', minWidth: 0,
        }}>
          {/* Левая часть: иконка + заголовок */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: '1 1 0', overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffb547 0%, #ff9500 100%)',
              width: '36px', height: '36px', borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(255,149,0,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon name="CalendarClock" size={17} style={{ color: '#fff' }} />
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--foreground))', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Предстоящие платежи
              </div>
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {PERIOD_LABEL[period] ?? 'Выбранный период'}
                {!loading && count > 0 && (
                  <span style={{ marginLeft: '6px', fontWeight: 700, color: dashboardColors.orange }}>
                    {count} {cLabel} · {formatAmount(total)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Правая часть: кнопка "+" */}
          {hasPermission('payments', 'create') && (
            <button
              onClick={() => { loadDicts(); setDialogOpen(true); }}
              title="Создать запланированный платёж"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--background))',
                cursor: 'pointer', color: 'hsl(var(--foreground))',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = `${dashboardColors.orange}15`;
                (e.currentTarget as HTMLButtonElement).style.borderColor = dashboardColors.orange;
                (e.currentTarget as HTMLButtonElement).style.color = dashboardColors.orange;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'hsl(var(--background))';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'hsl(var(--border))';
                (e.currentTarget as HTMLButtonElement).style.color = 'hsl(var(--foreground))';
              }}
            >
              <Icon name="Plus" size={16} />
            </button>
          )}
        </div>

        {/* ── Тело ── */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '2px solid hsl(var(--border))',
              borderTopColor: dashboardColors.orange,
              animation: 'spin 0.7s linear infinite',
            }} />
          </div>
        ) : count === 0 ? (
          <UpcomingEmptyState period={period} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
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

      <PlannedPaymentForm
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        formData={formData}
        setFormData={setFormData}
        categories={dicts.categories}
        legalEntities={dicts.legalEntities}
        contractors={dicts.contractors}
        customerDepartments={dicts.customerDepartments}
        customFields={[]}
        services={dicts.services}
        handleSubmit={handleSubmit}
        onDialogOpen={loadDicts}
      />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Card>
  );
};

export default Dashboard2UpcomingPayments;
