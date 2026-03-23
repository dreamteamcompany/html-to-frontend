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

const getCategoryIcon = (categoryName: string = ''): string => {
  const n = categoryName.toLowerCase();
  if (n.includes('сервер') || n.includes('хостинг')) return 'Server';
  if (n.includes('облак') || n.includes('saas')) return 'Cloud';
  if (n.includes('софт') || n.includes('програм')) return 'Code';
  if (n.includes('дизайн') || n.includes('figma')) return 'Palette';
  if (n.includes('безопасн')) return 'Shield';
  if (n.includes('база') || n.includes('данн')) return 'Database';
  return 'DollarSign';
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

const RECURRENCE_BADGE: Record<string, { label: string; color: string; bg: string; border: string }> = {
  monthly:  { label: 'ежемес.',  color: '#0ea5e9', bg: '#0ea5e915', border: '#0ea5e930' },
  yearly:   { label: 'ежегодно', color: '#f59e0b', bg: '#f59e0b15', border: '#f59e0b30' },
  weekly:   { label: 'еженед.',  color: '#10b981', bg: '#10b98115', border: '#10b98130' },
};

// ─── PaymentRow ───────────────────────────────────────────────────────────────
const PaymentRow = ({ payment, accentColor, onClick }: { payment: PaymentRecord; accentColor: string; onClick: (p: PaymentRecord) => void }) => {
  const icon = getCategoryIcon(payment.category_name);
  const rec = RECURRENCE_BADGE[(payment as Record<string, unknown>).recurrence_type as string];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(payment)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(payment); }}
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr auto',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 12px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${accentColor}0d`; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {/* Иконка */}
      <div style={{
        width: '28px', height: '28px', borderRadius: '7px',
        background: `${accentColor}20`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={icon} size={13} style={{ color: accentColor }} />
      </div>

      {/* Основная информация */}
      <div style={{ minWidth: 0 }}>
        {/* Строка 1: название + бейджи */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '12px', fontWeight: 700, color: 'hsl(var(--foreground))',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            maxWidth: '240px',
          }}>
            {payment.description || payment.service_name || 'Платёж'}
          </span>
          {rec && (
            <span style={{
              fontSize: '9px', fontWeight: 700, color: rec.color,
              background: rec.bg, border: `1px solid ${rec.border}`,
              borderRadius: '4px', padding: '1px 4px', whiteSpace: 'nowrap',
            }}>
              {rec.label}
            </span>
          )}
        </div>
        {/* Строка 2: контрагент / юрлицо · отдел · сервис */}
        <div style={{
          fontSize: '10px', color: 'hsl(var(--muted-foreground))',
          marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {[
            payment.contractor_name || payment.legal_entity_name,
            payment.department_name,
            payment.service_name,
          ].filter(Boolean).join(' · ') || payment.category_name || ''}
        </div>
      </div>

      {/* Сумма */}
      <div style={{
        fontSize: '13px', fontWeight: 800, color: 'hsl(var(--foreground))',
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        {formatAmount(payment.amount)}
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

  return (
    <div>
      {/* Заголовок дня */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 12px',
        borderLeft: `3px solid ${accentColor}`,
        marginBottom: '2px',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: accentColor }}>
            {group.label}
          </span>
          <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
            {group.sublabel}
          </span>
          <span style={{
            fontSize: '10px', color: accentColor,
            background: `${accentColor}18`, borderRadius: '10px',
            padding: '1px 7px', fontWeight: 700,
          }}>
            {group.payments.length}
          </span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
          {formatAmount(group.total)}
        </span>
      </div>

      {/* Строки платежей */}
      <div>
        {group.payments.map((p) => (
          <PaymentRow key={`${p.id}-${p.payment_date}`} payment={p} accentColor={accentColor} onClick={onPaymentClick} />
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

  // Строки вместо Date-объектов — стабильны при сравнении в useCallback
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
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '30px',
    }}>
      <CardContent className="p-4 sm:p-6">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div style={{
              background: 'linear-gradient(135deg, #ffb547 0%, #ff9500 100%)',
              padding: '10px', borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(255,181,71,0.3)', flexShrink: 0,
            }}>
              <Icon name="CalendarClock" size={20} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 className={dashboardTypography.cardTitle} style={{ color: 'hsl(var(--foreground))' }}>
                Предстоящие платежи
              </h3>
              <p className={`${dashboardTypography.cardSmall} mt-0.5`} style={{ color: 'hsl(var(--muted-foreground))' }}>
                {PERIOD_LABEL[period] ?? 'Выбранный период'}
              </p>
            </div>
          </div>

          {!plannedLoading && count > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'hsl(var(--foreground))' }}>
                {formatAmount(weekTotal)}
              </div>
              <div style={{ fontSize: '11px', color: dashboardColors.orange, fontWeight: 600 }}>
                {count} {countLabel}
              </div>
            </div>
          )}
        </div>

        {/* Состояния */}
        {plannedLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : count === 0 ? (
          <div className="text-center py-10">
            <Icon name="CheckCircle" size={40} style={{ color: dashboardColors.green, margin: '0 auto 12px' }} />
            <p className={dashboardTypography.cardSmall} style={{ color: 'hsl(var(--muted-foreground))' }}>
              Нет запланированных платежей: {(PERIOD_LABEL[period] ?? 'выбранный период').toLowerCase()}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {groups.map((group, i) => (
              <div key={group.dateKey}>
                <DaySection group={group} onPaymentClick={setSelectedPayment} />
                {i < groups.length - 1 && (
                  <div style={{ height: '1px', background: 'hsl(var(--border))', margin: '10px 0 0' }} />
                )}
              </div>
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