import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { dashboardTypography, dashboardColors } from './dashboardStyles';
import { PaymentRecord } from '@/contexts/PaymentsCacheContext';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { usePeriod } from '@/contexts/PeriodContext';
import PlannedPaymentDetailModal from './PlannedPaymentDetailModal';

const PERIOD_LABEL: Record<string, string> = {
  today: 'Сегодня',
  week: 'Ближайшая неделя',
  month: 'Текущий месяц',
  year: 'Текущий год',
  custom: 'Выбранный период',
};

interface DayGroup {
  dateKey: string;
  label: string;
  sublabel: string;
  payments: PaymentRecord[];
  total: number;
  isToday: boolean;
  isTomorrow: boolean;
  isUrgent: boolean;
}

const formatAmount = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '— ₽';
  return new Intl.NumberFormat('ru-RU').format(num) + ' ₽';
};

const groupByDay = (payments: PaymentRecord[]): DayGroup[] => {
  const map = new Map<string, PaymentRecord[]>();
  for (const p of payments) {
    const dateKey = String(p.payment_date).slice(0, 10);
    if (!map.has(dateKey)) map.set(dateKey, []);
    map.get(dateKey)!.push(p);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const weekdays = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];

  const groups: DayGroup[] = [];
  for (const [dateKey, items] of map.entries()) {
    const date = new Date(dateKey + 'T00:00:00');
    const isToday = date.getTime() === today.getTime();
    const isTomorrow = date.getTime() === tomorrow.getTime();

    let label = '';
    let sublabel = '';
    if (isToday) {
      label = 'Сегодня';
      sublabel = `${date.getDate()} ${months[date.getMonth()]}`;
    } else if (isTomorrow) {
      label = 'Завтра';
      sublabel = `${date.getDate()} ${months[date.getMonth()]}`;
    } else {
      label = `${date.getDate()} ${months[date.getMonth()]}`;
      sublabel = weekdays[date.getDay()];
    }

    const total = items.reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);
    groups.push({ dateKey, label, sublabel, payments: items, total, isToday, isTomorrow, isUrgent: isToday });
  }

  return groups.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
};

const RECURRENCE_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  monthly: { label: 'ежемес.',  color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)' },
  yearly:  { label: 'ежегодно', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  weekly:  { label: 'еженед.',  color: '#10b981', bg: 'rgba(16,185,129,0.10)' },
};

// ─── PaymentRow ───────────────────────────────────────────────────────────────
const PaymentRow = ({
  payment,
  accentColor,
  onClick,
  isLast,
}: {
  payment: PaymentRecord;
  accentColor: string;
  onClick: (p: PaymentRecord) => void;
  isLast: boolean;
}) => {
  const [hovered, setHovered] = useState(false);
  const rec = RECURRENCE_BADGE[(payment as Record<string, unknown>).recurrence_type as string];

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: '16px',
        padding: '7px 10px 7px 14px',
        margin: '0 -10px',
        borderRadius: '6px',
        cursor: 'pointer',
        background: hovered ? `${accentColor}0d` : 'transparent',
        borderBottom: isLast ? 'none' : '1px solid hsl(var(--border) / 0.5)',
        transition: 'background 0.12s',
        outline: 'none',
      }}
    >
      {/* Левая колонка */}
      <div style={{ minWidth: 0 }}>
        {/* Строка 1: название + тег */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'hsl(var(--foreground))',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: '1 1 0',
            minWidth: 0,
          }}>
            {payment.description || payment.service_name || 'Платёж'}
          </span>
          {rec && (
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              color: rec.color,
              background: rec.bg,
              borderRadius: '4px',
              padding: '1px 6px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              letterSpacing: '0.01em',
            }}>
              {rec.label}
            </span>
          )}
        </div>
        {/* Строка 2: детали */}
        {meta && (
          <div style={{
            fontSize: '11px',
            color: 'hsl(var(--muted-foreground))',
            marginTop: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {meta}
          </div>
        )}
      </div>

      {/* Правая колонка: сумма + стрелка */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <span style={{
          fontSize: '13px',
          fontWeight: 700,
          color: 'hsl(var(--foreground))',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatAmount(payment.amount)}
        </span>
        <Icon
          name="ChevronRight"
          size={14}
          style={{
            color: hovered ? accentColor : 'hsl(var(--muted-foreground) / 0.4)',
            transition: 'color 0.12s',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
};

// ─── DaySection ───────────────────────────────────────────────────────────────
const DaySection = ({ group, onPaymentClick }: { group: DayGroup; onPaymentClick: (p: PaymentRecord) => void }) => {
  const accentColor = group.isUrgent
    ? dashboardColors.red
    : group.isTomorrow
    ? dashboardColors.orange
    : dashboardColors.green;

  const countLabel =
    group.payments.length === 1 ? 'платёж' :
    group.payments.length < 5 ? 'платежа' : 'платежей';

  return (
    <div>
      {/* Заголовок группы — дата */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        padding: '6px 10px 6px 0',
        borderBottom: `2px solid ${accentColor}`,
        marginBottom: '2px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{
            fontSize: '13px',
            fontWeight: 800,
            color: accentColor,
            letterSpacing: '-0.01em',
          }}>
            {group.label}
          </span>
          {group.sublabel && (
            <span style={{
              fontSize: '12px',
              fontWeight: 500,
              color: 'hsl(var(--muted-foreground))',
            }}>
              {group.sublabel}
            </span>
          )}
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            color: accentColor,
            background: `${accentColor}15`,
            borderRadius: '10px',
            padding: '1px 8px',
            lineHeight: '18px',
          }}>
            {group.payments.length} {countLabel}
          </span>
        </div>
        <span style={{
          fontSize: '12px',
          fontWeight: 700,
          color: 'hsl(var(--foreground))',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatAmount(group.total)}
        </span>
      </div>

      {/* Список платежей */}
      <div style={{ paddingTop: '2px' }}>
        {group.payments.map((p, idx) => (
          <PaymentRow
            key={`${p.id}-${p.payment_date}`}
            payment={p}
            accentColor={accentColor}
            onClick={onPaymentClick}
            isLast={idx === group.payments.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const Dashboard2UpcomingPayments = () => {
  const { token } = useAuth();
  const { period, getDateRange } = usePeriod();
  const [plannedPayments, setPlannedPayments] = useState<PaymentRecord[]>([]);
  const [plannedLoading, setPlannedLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const toDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const { dateFromStr, dateToStr } = useMemo(() => {
    const { from, to } = getDateRange();
    return { dateFromStr: toDateStr(from), dateToStr: toDateStr(to) };
  }, [getDateRange]);

  const fetchPlanned = useCallback(() => {
    if (!token) return;
    setPlannedLoading(true);
    fetch(`${API_ENDPOINTS.main}?endpoint=planned-payments&date_from=${dateFromStr}&date_to=${dateToStr}`, {
      headers: { 'X-Auth-Token': token },
    })
      .then(r => r.ok ? r.json() : [])
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const mapped: PaymentRecord[] = list.map((pp: Record<string, unknown>) => ({
          id: pp.id as number,
          status: 'scheduled',
          payment_date: String(pp.planned_date as string).slice(0, 10),
          amount: pp.amount as number,
          description: pp.description as string,
          category_id: pp.category_id as number,
          category_name: pp.category_name as string,
          category_icon: pp.category_icon as string,
          service_id: pp.service_id as number,
          service_name: pp.service_name as string,
          department_id: pp.department_id as number,
          department_name: pp.department_name as string,
          contractor_name: pp.contractor_name as string,
          legal_entity_name: pp.legal_entity_name as string,
          payment_type: 'planned',
          _isPlanned: true,
          recurrence_type: pp.recurrence_type as string | undefined,
          recurrence_end_date: pp.recurrence_end_date as string | undefined,
        }));
        setPlannedPayments(mapped);
      })
      .catch(() => setPlannedPayments([]))
      .finally(() => setPlannedLoading(false));
  }, [token, dateFromStr, dateToStr]);

  useEffect(() => { fetchPlanned(); }, [fetchPlanned]);

  const { upcoming, weekTotal } = useMemo(() => {
    const sorted = [...plannedPayments].sort((a, b) => {
      const da = new Date(String(a.payment_date).includes('T') ? String(a.payment_date) : String(a.payment_date) + 'T00:00:00');
      const db = new Date(String(b.payment_date).includes('T') ? String(b.payment_date) : String(b.payment_date) + 'T00:00:00');
      return da.getTime() - db.getTime();
    });
    const total = sorted.reduce((sum, p) => sum + (parseFloat(String(p.amount)) || 0), 0);
    return { upcoming: sorted, weekTotal: total };
  }, [plannedPayments]);

  const groups = useMemo(() => groupByDay(upcoming), [upcoming]);

  const count = upcoming.length;
  const countLabel = count === 1 ? 'платёж' : count < 5 ? 'платежа' : 'платежей';

  return (
    <Card style={{
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      marginBottom: '30px',
    }}>
      <CardContent className="p-4 sm:p-5">

        {/* ── Шапка ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '12px',
          borderBottom: '1px solid hsl(var(--border))',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffb547 0%, #ff9500 100%)',
              padding: '8px',
              borderRadius: '10px',
              boxShadow: '0 2px 6px rgba(255,149,0,0.25)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon name="CalendarClock" size={18} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--foreground))', lineHeight: 1.2 }}>
                Предстоящие платежи
              </div>
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
                {PERIOD_LABEL[period] ?? 'Выбранный период'}
              </div>
            </div>
          </div>

          {!plannedLoading && count > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 800,
                color: 'hsl(var(--foreground))',
                fontVariantNumeric: 'tabular-nums',
                lineHeight: 1.2,
              }}>
                {formatAmount(weekTotal)}
              </div>
              <div style={{ fontSize: '11px', color: dashboardColors.orange, fontWeight: 600, marginTop: '2px' }}>
                {count} {countLabel}
              </div>
            </div>
          )}
        </div>

        {/* ── Состояния ── */}
        {plannedLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-orange-400" />
          </div>
        ) : count === 0 ? (
          <div className="text-center py-10">
            <Icon name="CheckCircle" size={36} style={{ color: dashboardColors.green, margin: '0 auto 10px' }} />
            <p className={dashboardTypography.cardSmall} style={{ color: 'hsl(var(--muted-foreground))' }}>
              Нет платежей за {(PERIOD_LABEL[period] ?? 'выбранный период').toLowerCase()}
            </p>
          </div>
        ) : (
          /* ── Реестр ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {groups.map((group) => (
              <DaySection
                key={group.dateKey}
                group={group}
                onPaymentClick={setSelectedPayment}
              />
            ))}
          </div>
        )}
      </CardContent>

      <PlannedPaymentDetailModal
        payment={selectedPayment}
        onClose={() => setSelectedPayment(null)}
        onActionDone={fetchPlanned}
      />
    </Card>
  );
};

export default Dashboard2UpcomingPayments;
