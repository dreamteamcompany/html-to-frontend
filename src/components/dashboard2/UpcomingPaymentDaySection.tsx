import Icon from '@/components/ui/icon';
import { PaymentRecord } from '@/contexts/PaymentsCacheContext';
import { dashboardColors } from './dashboardStyles';
import { DayGroup, PERIOD_LABEL, formatAmount } from './UpcomingPaymentsTypes';
import UpcomingPaymentRow from './UpcomingPaymentRow';

export const UpcomingEmptyState = ({ period }: { period: string }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: 'clamp(28px, 8vw, 44px) clamp(12px, 4vw, 16px)', gap: '10px',
  }}>
    <div style={{
      width: 'clamp(40px, 12vw, 52px)', height: 'clamp(40px, 12vw, 52px)', borderRadius: '12px',
      background: `${dashboardColors.green}12`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon name="CheckCircle" size={22} style={{ color: dashboardColors.green }} />
    </div>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(12px, 3.5vw, 14px)', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '4px' }}>
        Нет платежей
      </div>
      <div style={{ fontSize: 'clamp(11px, 3vw, 12px)', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5, wordBreak: 'break-word' }}>
        За период «{(PERIOD_LABEL[period] ?? period).toLowerCase()}»<br />нет запланированных платежей
      </div>
    </div>
  </div>
);

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
    <div style={{
      position: 'relative',
      border: '1px solid hsl(var(--border))',
      borderRadius: '12px',
      padding: 'clamp(10px, 3vw, 14px)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 'clamp(6px, 2vw, 10px)',
        marginBottom: 'clamp(8px, 2vw, 10px)', paddingLeft: '2px',
        flexWrap: 'wrap',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: accent, flexShrink: 0,
          boxShadow: `0 0 0 3px ${accent}20`,
        }} />

        <div style={{
          fontSize: 'clamp(11px, 3vw, 13px)', fontWeight: 700,
          color: accent, letterSpacing: '-0.01em',
          lineHeight: 1,
        }}>
          {group.label}
        </div>

        {group.sublabel && (
          <div style={{
            fontSize: 'clamp(9px, 2.5vw, 11px)', fontWeight: 500,
            color: 'hsl(var(--muted-foreground))',
            lineHeight: 1,
          }}>
            {group.sublabel}
          </div>
        )}

        <div style={{ flex: 1, height: '1px', background: 'hsl(var(--border) / 0.4)', minWidth: '10px' }} />

        <div style={{
          fontSize: 'clamp(9px, 2.3vw, 10px)', fontWeight: 500,
          color: 'hsl(var(--muted-foreground) / 0.85)',
          whiteSpace: 'nowrap', lineHeight: 1,
        }}>
          {n} {nLabel}
        </div>

        <div style={{
          fontSize: 'clamp(11px, 3vw, 13px)', fontWeight: 700,
          color: accent, flexShrink: 0,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}>
          {formatAmount(group.total)}
        </div>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: '6px',
        paddingLeft: 'clamp(8px, 2.5vw, 14px)',
        borderLeft: `2px solid ${accent}20`,
        marginLeft: '5px',
      }}>
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