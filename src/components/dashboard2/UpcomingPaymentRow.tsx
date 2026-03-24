import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { PaymentRecord } from '@/contexts/PaymentsCacheContext';
import { formatAmount } from './UpcomingPaymentsTypes';

// ─── Бейджи рекуррентности ────────────────────────────────────────────────────

const REC: Record<string, { label: string; color: string; bg: string }> = {
  monthly: { label: 'ежемес.',  color: '#0ea5e9', bg: 'rgba(14,165,233,0.09)'  },
  yearly:  { label: 'ежегодно', color: '#f59e0b', bg: 'rgba(245,158,11,0.09)'  },
  weekly:  { label: 'еженед.',  color: '#10b981', bg: 'rgba(16,185,129,0.09)'  },
};

// ─── PaymentRow ───────────────────────────────────────────────────────────────

const UpcomingPaymentRow = ({
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
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 8px 8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        background: hov ? `${accent}12` : 'transparent',
        borderBottom: isLast ? 'none' : '1px solid hsl(var(--border) / 0.45)',
        transition: 'background 0.13s',
        outline: 'none',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {/* Левая колонка */}
      <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
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
              borderRadius: '4px', padding: '1px 5px',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
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

export default UpcomingPaymentRow;
