import Icon from '@/components/ui/icon';
import type { SortField, SortDir } from './drillDownTypes';

interface DrillDownToolbarProps {
  search: string;
  onSearchChange: (v: string) => void;
  sortField: SortField;
  sortDir: SortDir;
  onToggleSort: (field: SortField) => void;
  exporting: boolean;
  hasItems: boolean;
  onExport: () => void;
  isMobile: boolean;
}

const DrillDownToolbar = ({
  search,
  onSearchChange,
  sortField,
  sortDir,
  onToggleSort,
  exporting,
  hasItems,
  onExport,
  isMobile,
}: DrillDownToolbarProps) => {
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Icon name="ChevronsUpDown" size={12} />;
    return <Icon name={sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={12} />;
  };

  return (
    <div style={{
      padding: isMobile ? '12px 16px' : '14px 24px',
      borderBottom: '1px solid hsl(var(--border))',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '8px',
      flexShrink: 0,
    }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <Icon name="Search" size={14} style={{
          position: 'absolute', left: '10px', top: '50%',
          transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))',
        }} />
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Поиск по платежам..."
          style={{
            width: '100%', paddingLeft: '32px', paddingRight: '12px',
            height: '38px', borderRadius: '8px',
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            fontSize: '13px', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
        {(['payment_date', 'amount'] as SortField[]).map(f => (
          <button
            key={f}
            onClick={() => onToggleSort(f)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '6px 12px', borderRadius: '8px',
              border: '1px solid hsl(var(--border))',
              background: sortField === f ? 'rgba(117,81,233,0.12)' : 'transparent',
              color: sortField === f ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              flex: isMobile ? 1 : undefined,
              justifyContent: isMobile ? 'center' : undefined,
            }}
          >
            {f === 'payment_date' ? 'По дате' : 'По сумме'}
            <SortIcon field={f} />
          </button>
        ))}
        <button
          onClick={onExport}
          disabled={exporting || !hasItems}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            padding: '6px 12px', borderRadius: '8px',
            border: '1px solid rgba(0,185,100,0.3)',
            background: (exporting || !hasItems) ? 'rgba(255,255,255,0.04)' : 'rgba(0,185,100,0.1)',
            color: (exporting || !hasItems) ? 'hsl(var(--muted-foreground))' : '#00b964',
            fontSize: '12px', fontWeight: 600,
            cursor: (exporting || !hasItems) ? 'not-allowed' : 'pointer',
            transition: 'all 0.18s', whiteSpace: 'nowrap',
            flex: isMobile ? '1 0 100%' : undefined,
            justifyContent: isMobile ? 'center' : undefined,
          }}
          onMouseEnter={e => {
            if (!exporting && hasItems)
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,185,100,0.18)';
          }}
          onMouseLeave={e => {
            if (!exporting && hasItems)
              (e.currentTarget as HTMLElement).style.background = 'rgba(0,185,100,0.1)';
          }}
        >
          {exporting ? (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2" style={{ borderColor: '#00b964' }} />
          ) : (
            <Icon name="FileSpreadsheet" size={13} />
          )}
          {exporting ? 'Формирую...' : 'Выгрузить Excel'}
        </button>
      </div>
    </div>
  );
};

export default DrillDownToolbar;