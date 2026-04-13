import Icon from '@/components/ui/icon';
import { getActionConfig, getEntityTypeInfo, getFieldLabel, formatValue, HIDDEN_FIELDS } from './auditConstants';

/* ─── Вспомогательные компоненты ─────────────────── */
export const ActionBadge = ({ action }: { action: string }) => {
  const cfg = getActionConfig(action);
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <Icon name={cfg.icon} size={11} />
      {cfg.label}
    </span>
  );
};

export const EntityBadge = ({ entityType }: { entityType: string }) => {
  const info = getEntityTypeInfo(entityType);
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md"
      style={{ background: 'rgba(255,255,255,0.07)', color: 'hsl(var(--muted-foreground))' }}
    >
      <Icon name={info.icon} size={11} />
      {info.label}
    </span>
  );
};

export const FieldDiff = ({ field, oldVal, newVal }: { field: string; oldVal: unknown; newVal: unknown }) => (
  <div className="flex flex-wrap items-center gap-1.5 text-xs py-2"
    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <span className="text-muted-foreground min-w-[120px] font-medium">{getFieldLabel(field)}</span>
    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-700 dark:text-red-400 line-through break-all">
      {formatValue(oldVal, field)}
    </span>
    <Icon name="ArrowRight" size={11} className="text-muted-foreground/40 flex-shrink-0" />
    <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-700 dark:text-green-400 break-all">
      {formatValue(newVal, field)}
    </span>
  </div>
);

export const ValueRow = ({ label, value, highlight }: { label: string; value: string; highlight?: 'green' | 'red' }) => (
  <div className="flex items-start gap-3 py-1.5 text-xs"
    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <span className="text-muted-foreground min-w-[120px] flex-shrink-0 font-medium">{label}</span>
    <span className={
      highlight === 'green' ? 'text-green-700 dark:text-green-400' :
        highlight === 'red' ? 'text-red-700 dark:text-red-400 line-through opacity-70' :
          'text-foreground/90'
    }>{value}</span>
  </div>
);

/** Информационная карточка объекта (для создания/удаления показываем полные данные) */
export const ObjectInfoCard = ({ data, highlight, title }: { data: Record<string, unknown>; highlight: 'green' | 'red'; title: string }) => {
  const entries = Object.entries(data).filter(([k, v]) => v != null && v !== '' && !HIDDEN_FIELDS.has(k));
  if (entries.length === 0) return null;

  const borderColor = highlight === 'green' ? 'rgba(1,181,116,0.15)' : 'rgba(255,107,107,0.15)';
  const bgColor = highlight === 'green' ? 'rgba(1,181,116,0.03)' : 'rgba(255,107,107,0.03)';
  const iconName = highlight === 'green' ? 'Plus' : 'Trash2';
  const iconColor = highlight === 'green' ? '#01b574' : '#ff6b6b';

  return (
    <div className="mb-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
        <Icon name={iconName} size={12} style={{ color: iconColor }} />
        <span>{title}</span>
      </div>
      <div className="rounded-lg px-3" style={{ border: `1px solid ${borderColor}`, background: bgColor }}>
        {entries.map(([field, val]) => (
          <ValueRow key={field} label={getFieldLabel(field)} value={formatValue(val, field)} highlight={highlight} />
        ))}
      </div>
    </div>
  );
};