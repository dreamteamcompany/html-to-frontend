import Icon from '@/components/ui/icon';
import { PaymentRecord } from '@/contexts/PaymentsCacheContext';
import { dashboardColors } from './dashboardStyles';
import { DayGroup, PERIOD_LABEL, formatAmount } from './UpcomingPaymentsTypes';
import UpcomingPaymentRow from './UpcomingPaymentRow';

// ─── EmptyState ───────────────────────────────────────────────────────────────

export const UpcomingEmptyState = ({ period }: { period: string }) => (
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

// ─── DaySection ───────────────────────────────────────────────────────────────

const UpcomingPaymentDaySection = ({
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
        minWidth: 0, overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, overflow: 'hidden' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: accent, letterSpacing: '-0.02em', flexShrink: 0 }}>
            {group.label}
          </span>
          {group.sublabel && (
            <span style={{
              fontSize: '11px', fontWeight: 500,
              color: 'hsl(var(--muted-foreground))', flexShrink: 0,
            }}>
              {group.sublabel}
            </span>
          )}
          <span style={{
            fontSize: '10px', color: 'hsl(var(--muted-foreground) / 0.6)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {n} {nLabel}
          </span>
        </div>
        <span style={{
          fontSize: '12px', fontWeight: 700,
          color: accent, flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {formatAmount(group.total)}
        </span>
      </div>

      {/* Строки платежей */}
      <div>
        {group.payments.map((p, idx) => (
          <UpcomingPaymentRow
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

export default UpcomingPaymentDaySection;
