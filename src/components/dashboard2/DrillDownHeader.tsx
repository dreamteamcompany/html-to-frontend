import Icon from '@/components/ui/icon';
import { fmt } from './drillDownTypes';

interface DrillDownHeaderProps {
  label: string;
  count: number;
  total: number;
  isMobile: boolean;
  onClose: () => void;
}

const DrillDownHeader = ({ label, count, total, isMobile, onClose }: DrillDownHeaderProps) => (
  <div style={{
    padding: isMobile ? '16px' : '20px 24px',
    borderBottom: '1px solid hsl(var(--border))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
    background: 'rgba(117,81,233,0.06)',
    gap: '8px',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
      <div style={{
        width: '36px', height: '36px', borderRadius: '10px',
        background: 'rgba(117,81,233,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon name="TableProperties" size={16} style={{ color: '#7551e9' }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: isMobile ? '14px' : '16px', fontWeight: 700,
          color: 'hsl(var(--foreground))',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          Детализация: <span style={{ color: '#7551e9' }}>{label}</span>
        </div>
        <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
          {count} платежей · Итого: <span style={{ color: '#7551e9', fontWeight: 700 }}>{fmt(total)}</span>
        </div>
      </div>
    </div>
    <button
      onClick={onClose}
      style={{
        width: '34px', height: '34px', borderRadius: '8px',
        border: '1px solid hsl(var(--border))', background: 'transparent',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'hsl(var(--muted-foreground))',
        flexShrink: 0,
      }}
    >
      <Icon name="X" size={16} />
    </button>
  </div>
);

export default DrillDownHeader;
