import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { dashboardColors } from './dashboardStyles';
import { PaymentRecord } from '@/contexts/PaymentsCacheContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { usePeriod } from '@/contexts/PeriodContext';
import PlannedPaymentDetailModal from './PlannedPaymentDetailModal';

// ─── Константы ────────────────────────────────────────────────────────────────

const PERIOD_LABEL: Record<string, string> = {
  today: 'Сегодня',
  week:  'Текущая неделя',
  month: 'Текущий месяц',
  year:  'Текущий год',
  custom:'Выбранный период',
};

const MONTHS     = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
const MONTHS_FULL= ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const WEEKDAYS   = ['вс','пн','вт','ср','чт','пт','сб'];

// ─── Утилиты ──────────────────────────────────────────────────────────────────

const toDateStr = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parseDateKey = (dateKey: string): Date =>
  new Date(dateKey + 'T00:00:00');

const formatAmount = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '— ₽';
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(num) + ' ₽';
};

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface DayGroup {
  dateKey:   string;
  label:     string;
  sublabel:  string;
  fullLabel: string;
  payments:  PaymentRecord[];
  total:     number;
  isToday:   boolean;
  isTomorrow:boolean;
}

// ─── Группировка ──────────────────────────────────────────────────────────────

const groupByDay = (payments: PaymentRecord[], dateFromStr: string, dateToStr: string): DayGroup[] => {
  const map = new Map<string, PaymentRecord[]>();

  for (const p of payments) {
    const dateKey = String(p.payment_date).slice(0, 10);
    // Защитный фильтр: только платежи строго в диапазоне
    if (dateKey < dateFromStr || dateKey > dateToStr) continue;
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push(p);
  }

  const today    = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today.getTime() + 86400000);

  const groups: DayGroup[] = [];

  for (const [dateKey, items] of map.entries()) {
    const date      = parseDateKey(dateKey);
    const isToday   = date.getTime() === today.getTime();
    const isTomorrow= date.getTime() === tomorrow.getTime();

    const d = date.getDate();
    const mo= date.getMonth();
    const wd= date.getDay();

    let label    = '';
    let sublabel = '';
    let fullLabel= '';

    if (isToday) {
      label     = 'Сегодня';
      sublabel  = `${d} ${MONTHS[mo]}`;
      fullLabel = `Сегодня, ${d} ${MONTHS_FULL[mo]}`;
    } else if (isTomorrow) {
      label     = 'Завтра';
      sublabel  = `${d} ${MONTHS[mo]}`;
      fullLabel = `Завтра, ${d} ${MONTHS_FULL[mo]}`;
    } else {
      label     = `${d} ${MONTHS[mo]}`;
      sublabel  = WEEKDAYS[wd];
      fullLabel = `${d} ${MONTHS_FULL[mo]}, ${WEEKDAYS[wd]}`;
    }

    const total = items.reduce((s, p) => s + (parseFloat(String(p.amount)) || 0), 0);
    groups.push({ dateKey, label, sublabel, fullLabel, payments: items, total, isToday, isTomorrow });
  }

  return groups.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
};

// ─── Бейджи рекуррентности ────────────────────────────────────────────────────

const REC: Record<string, { label: string; color: string; bg: string }> = {
  monthly: { label: 'ежемес.',   color: '#0ea5e9', bg: 'rgba(14,165,233,0.09)'  },
  yearly:  { label: 'ежегодно',  color: '#f59e0b', bg: 'rgba(245,158,11,0.09)'  },
  weekly:  { label: 'еженед.',   color: '#10b981', bg: 'rgba(16,185,129,0.09)'  },
};

// ─── PaymentRow ───────────────────────────────────────────────────────────────

const PaymentRow = ({
  payment,
  accent,
  onClick,
  isLast,
}: {
  payment: PaymentRecord;
  accent:  string;
  onClick: (p: PaymentRecord) => void;
  isLast:  boolean;
}) => {
  const [hov, setHov] = useState(false);
  const rec = REC[(payment as Record<string, unknown>).recurrence_type as string];

  const meta = [
    payment.contractor_name || payment.legal_entity_name,
    payment.department_name,
    payment.service_name,
  ].filter(Boolean).join(' · ') || payment.category_name || '';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(payment)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(payment); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 8px 8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        background: hov ? `${accent}12` : 'transparent',
        borderBottom: isLast ? 'none' : '1px solid hsl(var(--border) / 0.45)',
        transition: 'background 0.13s',
        outline: 'none',
      }}
    >
      {/* Левая колонка */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <span style={{
            fontSize: '13px', fontWeight: 600,
            color: 'hsl(var(--foreground))',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: '1 1 0', minWidth: 0,
          }}>
            {payment.description || payment.service_name || 'Платёж'}
          </span>
          {rec && (
            <span style={{
              fontSize: '10px', fontWeight: 600,
              color: rec.color, background: rec.bg,
              borderRadius: '4px', padding: '1px 6px',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              {rec.label}
            </span>
          )}
        </div>
        {meta && (
          <div style={{
            fontSize: '11px', color: 'hsl(var(--muted-foreground))',
            marginTop: '2px', overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {meta}
          </div>
        )}
      </div>

      {/* Правая колонка */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
        <span style={{
          fontSize: '13px', fontWeight: 700,
          color: 'hsl(var(--foreground))', whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatAmount(payment.amount)}
        </span>
        <Icon name="ChevronRight" size={13} style={{
          color: hov ? accent : 'hsl(var(--muted-foreground) / 0.35)',
          transition: 'color 0.13s', flexShrink: 0,
        }} />
      </div>
    </div>
  );
};

// ─── DaySection ───────────────────────────────────────────────────────────────

const DaySection = ({
  group,
  onPaymentClick,
}: {
  group: DayGroup;
  onPaymentClick: (p: PaymentRecord) => void;
}) => {
  const accent = group.isToday
    ? dashboardColors.red
    : group.isTomorrow
    ? dashboardColors.orange
    : dashboardColors.green;

  const n = group.payments.length;
  const nLabel = n === 1 ? 'платёж' : n < 5 ? 'платежа' : 'платежей';

  return (
    <div>
      {/* Заголовок дня */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '5px 8px 5px 12px',
        background: `${accent}08`,
        borderLeft: `3px solid ${accent}`,
        borderRadius: '0 6px 6px 0',
        marginBottom: '3px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: accent, letterSpacing: '-0.02em' }}>
            {group.label}
          </span>
          {group.sublabel && (
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'hsl(var(--muted-foreground))' }}>
              {group.sublabel}
            </span>
          )}
          <span style={{
            fontSize: '10px', fontWeight: 700,
            color: accent, background: `${accent}18`,
            borderRadius: '10px', padding: '1px 7px',
          }}>
            {n} {nLabel}
          </span>
        </div>
        <span style={{
          fontSize: '12px', fontWeight: 700,
          color: 'hsl(var(--foreground))',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatAmount(group.total)}
        </span>
      </div>

      {/* Строки платежей */}
      <div>
        {group.payments.map((p, idx) => (
          <PaymentRow
            key={`${p.id}-${p.payment_date}`}
            payment={p}
            accent={accent}
            onClick={onPaymentClick}
            isLast={idx === group.payments.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Пустое состояние ─────────────────────────────────────────────────────────

const EmptyState = ({ period }: { period: string }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '36px 16px', gap: '10px',
  }}>
    <div style={{
      width: '44px', height: '44px', borderRadius: '12px',
      background: `${dashboardColors.green}15`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name="CheckCircle" size={22} style={{ color: dashboardColors.green }} />
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '4px' }}>
        Платежей нет
      </div>
      <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
        За период «{(PERIOD_LABEL[period] ?? period).toLowerCase()}» нет запланированных платежей
      </div>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const Dashboard2UpcomingPayments = () => {
  const { token } = useAuth();
  const { period, getDateRange } = usePeriod();
  const [payments, setPayments]   = useState<PaymentRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState<PaymentRecord | null>(null);

  // Стабильные строки дат — пересчитываются только при реальной смене диапазона
  const { dateFromStr, dateToStr } = useMemo(() => {
    const { from, to } = getDateRange();
    return { dateFromStr: toDateStr(from), dateToStr: toDateStr(to) };
  }, [getDateRange]);

  // Ref для отмены устаревших запросов
  const abortRef = useRef<AbortController | null>(null);

  const fetchPayments = useCallback(() => {
    if (!token) return;

    // Отменяем предыдущий запрос
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

  // Сортировка + фронтенд-защита от выхода за диапазон
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
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffb547 0%, #ff9500 100%)',
              width: '36px', height: '36px', borderRadius: '10px',
              boxShadow: '0 2px 8px rgba(255,149,0,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Icon name="CalendarClock" size={17} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--foreground))', lineHeight: 1.25 }}>
                Предстоящие платежи
              </div>
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '1px' }}>
                {PERIOD_LABEL[period] ?? 'Выбранный период'}
                {!loading && (
                  <span style={{ marginLeft: '6px', color: 'hsl(var(--muted-foreground) / 0.6)' }}>
                    {dateFromStr} — {dateToStr}
                  </span>
                )}
              </div>
            </div>
          </div>

          {!loading && count > 0 && (
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{
                fontSize: '17px', fontWeight: 800,
                color: 'hsl(var(--foreground))',
                fontVariantNumeric: 'tabular-nums', lineHeight: 1.2,
              }}>
                {formatAmount(total)}
              </div>
              <div style={{ fontSize: '11px', color: dashboardColors.orange, fontWeight: 600, marginTop: '2px' }}>
                {count} {cLabel}
              </div>
            </div>
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
          <EmptyState period={period} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {groups.map(group => (
              <DaySection key={group.dateKey} group={group} onPaymentClick={setSelected} />
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
