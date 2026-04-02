import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { PaymentRecord } from '@/contexts/PaymentsCacheContext';
import { formatAmount } from './UpcomingPaymentsTypes';

const REC: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  monthly: { label: 'ежемес.', icon: 'RefreshCw', color: '#0ea5e9', bg: 'rgba(14,165,233,0.10)' },
  yearly:  { label: 'ежегодно', icon: 'CalendarDays', color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  weekly:  { label: 'еженед.', icon: 'RotateCw', color: '#10b981', bg: 'rgba(16,185,129,0.10)' },
};

const UpcomingPaymentRow = ({
  payment,
  accent,
  onClick,
}: {
  payment: PaymentRecord;
  accent: string;
  onClick: (p: PaymentRecord) => void;
  isLast: boolean;
}) => {
  const [hov, setHov] = useState(false);
  const rec = REC[(payment as Record<string, unknown>).recurrence_type as string];

  const title = payment.description || payment.service_name || 'Платёж';
  const contractor = payment.contractor_name || payment.legal_entity_name || '';
  const department = payment.department_name || '';
  const service = payment.service_name || '';
  const category = payment.category_name || '';

  const secondaryParts = [contractor, department].filter(Boolean);
  const tertiaryParts = [service, category].filter(Boolean);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(payment)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(payment); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex',
        alignItems: 'stretch',
        padding: '12px 14px',
        borderRadius: '10px',
        cursor: 'pointer',
        background: hov ? `${accent}0a` : 'hsl(var(--card))',
        border: `1px solid ${hov ? `${accent}30` : 'hsl(var(--border) / 0.5)'}`,
        transition: 'all 0.2s ease',
        outline: 'none',
        minWidth: 0,
        gap: '12px',
        transform: hov ? 'translateY(-1px)' : 'none',
        boxShadow: hov ? `0 4px 12px ${accent}15` : '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px',
        background: `${accent}12`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, alignSelf: 'center',
      }}>
        <Icon
          name={payment.category_icon || 'Receipt'}
          fallback="Receipt"
          size={18}
          style={{ color: accent }}
        />
      </div>

      <div style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <span style={{
            fontSize: '13px', fontWeight: 600,
            color: 'hsl(var(--foreground))',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: '1 1 0', minWidth: 0, lineHeight: 1.3,
          }}>
            {title}
          </span>
          {rec && (
            <span style={{
              fontSize: '10px', fontWeight: 600,
              color: rec.color, background: rec.bg,
              borderRadius: '6px', padding: '2px 7px',
              whiteSpace: 'nowrap', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '3px',
              lineHeight: 1.3,
            }}>
              <Icon name={rec.icon} fallback="RefreshCw" size={10} style={{ color: rec.color }} />
              {rec.label}
            </span>
          )}
        </div>

        {secondaryParts.length > 0 && (
          <div style={{
            fontSize: '11px', color: 'hsl(var(--muted-foreground))',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}>
            {secondaryParts.join(' · ')}
          </div>
        )}

        {tertiaryParts.length > 0 && secondaryParts.join(' · ') !== tertiaryParts.join(' · ') && (
          <div style={{
            fontSize: '10px', color: 'hsl(var(--muted-foreground) / 0.6)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            lineHeight: 1.3,
          }}>
            {tertiaryParts.join(' · ')}
          </div>
        )}
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        justifyContent: 'center', flexShrink: 0, gap: '2px',
      }}>
        <span style={{
          fontSize: '15px', fontWeight: 800,
          color: 'hsl(var(--foreground))', whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums', lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}>
          {formatAmount(payment.amount)}
        </span>
        <Icon name="ChevronRight" size={12} style={{
          color: hov ? accent : 'hsl(var(--muted-foreground) / 0.3)',
          transition: 'color 0.2s',
        }} />
      </div>
    </div>
  );
};

export default UpcomingPaymentRow;
