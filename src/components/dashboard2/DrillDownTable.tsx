import Icon from '@/components/ui/icon';
import { fmt, fmtDate, resolvePaymentType, STATUS_LABEL } from './drillDownTypes';
import type { PaymentRecord } from './drillDownTypes';

interface DrillDownTableProps {
  sorted: PaymentRecord[];
  total: number;
  isMobile: boolean;
  isLight: boolean;
  onPaymentClick?: (p: PaymentRecord) => void;
}

const DrillDownTable = ({ sorted, total, isMobile, isLight, onPaymentClick }: DrillDownTableProps) => (
  <>
    {/* ═══ CONTENT ═══ */}
    <div style={{ overflowY: 'auto', flex: 1 }}>
      {sorted.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
          <Icon name="SearchX" size={40} style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '12px' }} />
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>Платежи не найдены</p>
        </div>
      ) : isMobile ? (
        /* ═══ MOBILE: карточки ═══ */
        <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sorted.map((p, i) => {
            const st = STATUS_LABEL[p.status || ''] ?? { label: p.status || '—', color: '#9ca3af' };
            return (
              <div
                key={p.id ?? i}
                role={onPaymentClick ? 'button' : undefined}
                tabIndex={onPaymentClick ? 0 : undefined}
                onClick={() => onPaymentClick?.(p)}
                onKeyDown={e => { if (onPaymentClick && (e.key === 'Enter' || e.key === ' ')) onPaymentClick(p); }}
                style={{
                  background: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  padding: '14px',
                  cursor: onPaymentClick ? 'pointer' : undefined,
                  transition: 'border-color 0.15s',
                }}
              >
                {/* Строка 1: описание + сумма */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--foreground))', lineHeight: 1.3 }}>
                      {p.description || '—'}
                    </div>
                    {p.contractor_name && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '4px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0 }}>Контрагент</span>
                        <span style={{ fontSize: '11px', color: 'hsl(var(--foreground))', overflowWrap: 'anywhere' }}>{p.contractor_name}</span>
                      </div>
                    )}
                    {p.service_name && (
                      <div style={{ display: 'flex', gap: '4px', marginTop: '2px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0 }}>Сервис</span>
                        <span style={{ fontSize: '11px', color: '#7551e9', overflowWrap: 'anywhere' }}>{p.service_name}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#7551e9', flexShrink: 0 }}>
                    {fmt(p.amount)}
                  </div>
                </div>

                {/* Строка 2: категория + отдел + юр. лицо */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  {p.category_name && (
                    <span style={{
                      fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                      background: 'rgba(117,81,233,0.1)', color: '#7551e9', fontWeight: 600,
                    }}>
                      {p.category_name}
                    </span>
                  )}
                  {p.department_name && (
                    <span style={{
                      fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                      background: 'hsl(var(--border))', color: 'hsl(var(--foreground))', fontWeight: 500,
                    }}>
                      {p.department_name}
                    </span>
                  )}
                  {p.legal_entity_name && (
                    <span style={{
                      fontSize: '11px', padding: '3px 8px', borderRadius: '6px',
                      background: 'rgba(1,181,116,0.10)', color: 'rgba(1,181,116,1)', fontWeight: 500,
                    }}>
                      {p.legal_entity_name}
                    </span>
                  )}
                </div>

                {/* Строка 3: дата + тип + статус */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                      {p.payment_date ? fmtDate(String(p.payment_date)) : '—'}
                    </span>
                    {(p.payment_type || p.legal_entity_name === 'Наличные') && (
                      <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
                        · {resolvePaymentType(p.payment_type, p.legal_entity_name)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 8px', borderRadius: '6px',
                      fontSize: '11px', fontWeight: 600,
                      background: `${st.color}20`, color: st.color,
                    }}>
                      {st.label}
                    </span>
                    {onPaymentClick && (
                      <Icon name="ChevronRight" size={14} style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ═══ DESKTOP: таблица ═══ */
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border))', position: 'sticky', top: 0, background: 'hsl(var(--card))', zIndex: 1 }}>
                {['Описание', 'Категория', 'Отдел', 'Юр. лицо', 'Тип расчёта', 'Дата', 'Сумма', 'Статус'].map(h => (
                  <th key={h} style={{
                    padding: '10px 12px', textAlign: 'left',
                    fontSize: '11px', fontWeight: 600,
                    color: 'hsl(var(--muted-foreground))',
                    textTransform: 'uppercase', letterSpacing: '0.4px',
                    whiteSpace: 'nowrap', overflow: 'hidden',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((p, i) => {
                const st = STATUS_LABEL[p.status || ''] ?? { label: p.status || '—', color: '#9ca3af' };
                return (
                  <tr
                    key={p.id ?? i}
                    style={{ borderBottom: '1px solid hsl(var(--border))', transition: 'background 0.15s', cursor: onPaymentClick ? 'pointer' : undefined }}
                    onClick={() => onPaymentClick?.(p)}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isLight ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.03)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    <td style={{ padding: '11px 12px', verticalAlign: 'top' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))', overflowWrap: 'anywhere', lineHeight: 1.4 }}>
                        {p.description || '—'}
                      </div>
                      {p.contractor_name && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '3px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0 }}>Контрагент</span>
                          <span style={{ fontSize: '11px', color: 'hsl(var(--foreground))', overflowWrap: 'anywhere' }}>{p.contractor_name}</span>
                        </div>
                      )}
                      {p.service_name && (
                        <div style={{ display: 'flex', gap: '4px', marginTop: '2px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '10px', fontWeight: 600, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.4px', flexShrink: 0 }}>Сервис</span>
                          <span style={{ fontSize: '11px', color: '#7551e9', overflowWrap: 'anywhere' }}>{p.service_name}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: '12px', color: 'hsl(var(--foreground))', verticalAlign: 'top', overflowWrap: 'anywhere' }}>
                      {p.category_name || '—'}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: '12px', color: 'hsl(var(--foreground))', verticalAlign: 'top', overflowWrap: 'anywhere' }}>
                      {p.department_name || '—'}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: '12px', color: 'hsl(var(--foreground))', verticalAlign: 'top', overflowWrap: 'anywhere' }}>
                      {p.legal_entity_name || '—'}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: '12px', color: 'hsl(var(--foreground))', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      {resolvePaymentType(p.payment_type, p.legal_entity_name)}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: '12px', color: 'hsl(var(--foreground))', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      {p.payment_date ? fmtDate(String(p.payment_date)) : '—'}
                    </td>
                    <td style={{ padding: '11px 12px', fontSize: '13px', fontWeight: 700, color: '#7551e9', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                      {fmt(p.amount)}
                    </td>
                    <td style={{ padding: '11px 12px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center',
                          padding: '3px 8px', borderRadius: '6px',
                          fontSize: '11px', fontWeight: 600,
                          background: `${st.color}20`, color: st.color,
                          whiteSpace: 'nowrap',
                        }}>
                          {st.label}
                        </span>
                        {onPaymentClick && (
                          <Icon name="ChevronRight" size={14} style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>

    {/* ═══ FOOTER ═══ */}
    {sorted.length > 0 && (
      <div style={{
        padding: isMobile ? '12px 16px' : '14px 24px',
        borderTop: '1px solid hsl(var(--border))',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexShrink: 0,
        background: 'rgba(117,81,233,0.04)',
      }}>
        <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
          {sorted.length} платежей
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>Итого:</span>
          <span style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 800, color: '#7551e9' }}>{fmt(total)}</span>
        </div>
      </div>
    )}
  </>
);

export default DrillDownTable;