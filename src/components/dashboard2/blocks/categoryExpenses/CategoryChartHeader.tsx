import Icon from '@/components/ui/icon';
import { dashboardTypography } from '../../dashboardStyles';
import { CategoryItem } from './types';

interface CategoryChartHeaderProps {
  loading: boolean;
  total: number;
  categoryData: CategoryItem[];
  showAll: boolean;
  setShowAll: (v: boolean) => void;
  isLight: boolean;
  openDrillAll: () => void;
}

const CategoryChartHeader = ({
  loading,
  total,
  categoryData,
  showAll,
  setShowAll,
  isLight,
  openDrillAll,
}: CategoryChartHeaderProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
            background: 'rgba(117,81,233,0.12)',
            border: '1px solid rgba(117,81,233,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="LayoutGrid" size={16} style={{ color: '#7551e9' }} />
          </div>
          <h3 className={dashboardTypography.cardTitle} style={{ fontSize: '15px' }}>
            IT Расходы по Категориям
          </h3>
        </div>
        {!loading && total > 0 && (
          <div
            onClick={openDrillAll}
            style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginLeft: '44px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '4px', padding: '2px 4px', transition: 'background 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(117,81,233,0.10)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            Итого: <span style={{ color: '#7551e9', fontWeight: 700 }}>{new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)} ₽</span>
            <span style={{ marginLeft: '2px', opacity: 0.7 }}>· {categoryData.length} категорий</span>
          </div>
        )}
      </div>

      {categoryData.length > 5 && (
        <div style={{ display: 'flex', gap: '3px', background: isLight ? 'rgba(0,0,0,0.05)' : 'hsl(var(--muted))', padding: '3px', borderRadius: '10px' }}>
          {[{ label: 'Топ-5', val: false }, { label: 'Все', val: true }].map(({ label, val }) => (
            <button
              key={label}
              onClick={() => setShowAll(val)}
              style={{
                padding: '4px 12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                background: showAll === val ? '#7551e9' : 'transparent',
                color: showAll === val ? '#fff' : 'hsl(var(--muted-foreground))',
                fontWeight: '600',
                transition: 'all 0.18s',
                boxShadow: showAll === val ? '0 2px 10px rgba(117,81,233,0.4)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryChartHeader;
