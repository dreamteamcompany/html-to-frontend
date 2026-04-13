import Icon from '@/components/ui/icon';
import { type AuditLog, getActionConfig, getEntityTypeInfo, getFieldLabel, formatValue, buildSummary } from './auditConstants';

interface AuditEntityHistoryProps {
  log: AuditLog;
  history: AuditLog[];
  historyLoading: boolean;
}

/** Секция: Полная история объекта */
const AuditEntityHistory = ({ log, history, historyLoading }: AuditEntityHistoryProps) => {
  const entityInfo = getEntityTypeInfo(log.entity_type);

  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Полная история {entityInfo.label.toLowerCase()} #{log.entity_id}
        </div>
        {!historyLoading && (
          <span className="text-xs text-muted-foreground">{history.length} событий</span>
        )}
      </div>

      {historyLoading ? (
        <div className="flex items-center justify-center py-8 gap-2">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground">Загрузка...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="text-xs text-muted-foreground text-center py-6">Нет записей</div>
      ) : (
        <div className="relative">
          {/* вертикальная линия */}
          <div className="absolute left-[15px] top-4 bottom-4"
            style={{ width: '1px', background: 'rgba(255,255,255,0.07)' }} />

          <div className="space-y-1">
            {history.map(h => {
              const acfg = getActionConfig(h.action);
              const isActive = h.id === log.id;
              const summary = buildSummary(h);

              return (
                <div
                  key={h.id}
                  className="flex gap-3 py-2 pl-1 pr-2 rounded-lg transition-colors"
                  style={isActive ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' } : {}}
                >
                  {/* Точка на линии */}
                  <div
                    className="w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                    style={{ background: acfg.bg, border: `1.5px solid ${acfg.border}`, color: acfg.color }}
                  >
                    <Icon name={acfg.icon} size={13} />
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-medium" style={{ color: acfg.color }}>
                            {acfg.label}
                          </span>
                          {isActive && (
                            <span className="text-xs px-1.5 py-0.5 rounded-md"
                              style={{ background: 'rgba(255,255,255,0.1)', color: 'hsl(var(--muted-foreground))' }}>
                              текущая запись
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground/80 mt-0.5 break-anywhere">
                          {h.username || 'Система'}
                          {summary && summary !== `${entityInfo.label} #${log.entity_id} — ${acfg.label}`
                            ? ` · ${summary}` : ''}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                        {new Date(h.created_at).toLocaleString('ru-RU', {
                          day: '2-digit', month: '2-digit',
                          hour: '2-digit', minute: '2-digit', second: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Изменения полей в истории (краткий вид) */}
                    {h.changed_fields && Object.keys(h.changed_fields).length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {Object.entries(h.changed_fields).slice(0, 3).map(([field, vals]) => (
                          <span key={field} className="text-xs text-muted-foreground/70">
                            {getFieldLabel(field)}:
                            <span className="text-red-700/70 dark:text-red-400/70 line-through ml-1">{formatValue(vals.old, field)}</span>
                            <span className="text-muted-foreground/40 mx-0.5">→</span>
                            <span className="text-green-700/70 dark:text-green-400/70">{formatValue(vals.new, field)}</span>
                          </span>
                        ))}
                        {Object.keys(h.changed_fields).length > 3 && (
                          <span className="text-xs text-muted-foreground/50">
                            +{Object.keys(h.changed_fields).length - 3} ещё
                          </span>
                        )}
                      </div>
                    )}
                    {h.metadata?.comment && (
                      <div className="mt-1 text-xs text-muted-foreground/60 italic flex items-center gap-1">
                        <Icon name="MessageSquare" size={10} />
                        {String(h.metadata.comment)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditEntityHistory;