import Icon from '@/components/ui/icon';
import { type AuditLog, getFieldLabel, formatValue, HIDDEN_FIELDS } from './auditConstants';
import { FieldDiff, ValueRow, ObjectInfoCard } from './AuditDetailPrimitives';

interface AuditDetailChangesProps {
  log: AuditLog;
  isUpdate: boolean;
  isCreate: boolean;
  isDelete: boolean;
  hasChangedFields: boolean;
  hasNewValues: boolean;
  hasOldValues: boolean;
}

/** Секция: Детали изменений */
const AuditDetailChanges = ({
  log,
  isUpdate,
  isCreate,
  isDelete,
  hasChangedFields,
  hasNewValues,
  hasOldValues,
}: AuditDetailChangesProps) => {
  return (
    <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        {isUpdate && hasChangedFields ? 'Изменённые поля' : isCreate ? 'Данные созданного объекта' : isDelete ? 'Данные удалённого объекта' : 'Детали события'}
      </div>

      {/* Изменённые поля (было → стало) */}
      {hasChangedFields && (
        <div className="mb-3">
          <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="px-3 py-1 bg-white/[0.02]">
              {Object.entries(log.changed_fields!).map(([field, vals]) => (
                <FieldDiff key={field} field={field} oldVal={vals.old} newVal={vals.new} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* При обновлении: показать полное состояние объекта (если есть new_values или old_values) */}
      {isUpdate && hasChangedFields && (hasNewValues || hasOldValues) && (
        <div className="mb-3">
          <details className="group">
            <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground/80 transition-colors flex items-center gap-1.5 mb-2">
              <Icon name="ChevronRight" size={12} className="group-open:rotate-90 transition-transform" />
              Полное состояние объекта после изменения
            </summary>
            <div className="rounded-lg px-3" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              {Object.entries(log.new_values || log.old_values || {}).filter(([k, v]) => v != null && v !== '' && !HIDDEN_FIELDS.has(k)).map(([field, val]) => (
                <ValueRow key={field} label={getFieldLabel(field)} value={formatValue(val, field)} />
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Новые значения (создание — без changed_fields) */}
      {!hasChangedFields && hasNewValues && (
        <ObjectInfoCard data={log.new_values!} highlight="green" title={isCreate ? 'Данные нового объекта:' : 'Данные объекта:'} />
      )}

      {/* Старые значения (удаление — без changed_fields) */}
      {!hasChangedFields && !hasNewValues && hasOldValues && (
        <ObjectInfoCard data={log.old_values!} highlight="red" title="Данные на момент удаления:" />
      )}

      {/* Удаление + есть old_values + есть changed_fields */}
      {isDelete && hasOldValues && hasChangedFields && (
        <ObjectInfoCard data={log.old_values!} highlight="red" title="Данные на момент удаления:" />
      )}

      {/* Метаданные */}
      {log.metadata && Object.keys(log.metadata).length > 0 && (
        <div className="mb-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
            <Icon name="Info" size={12} />
            <span>Дополнительная информация:</span>
          </div>
          <div className="rounded-lg px-3" style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
            {Object.entries(log.metadata).map(([field, val]) => (
              <ValueRow key={field} label={getFieldLabel(field)} value={formatValue(val, field)} />
            ))}
          </div>
        </div>
      )}

      {/* Нет деталей */}
      {!hasChangedFields && !hasNewValues && !hasOldValues && !log.metadata && (
        <div className="text-xs text-muted-foreground italic flex items-center gap-1.5">
          <Icon name="AlertCircle" size={12} />
          Детали не записаны. Данные были зафиксированы до обновления системы логирования.
        </div>
      )}
    </div>
  );
};

export default AuditDetailChanges;
