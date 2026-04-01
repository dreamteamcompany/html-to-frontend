import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/icon';
import { API_ENDPOINTS } from '@/config/api';

import {
  type AuditLog,
  getActionConfig,
  getEntityTypeInfo,
  buildContextDescription,
} from './auditConstants';
import { ActionBadge, EntityBadge } from './AuditDetailPrimitives';
import AuditDetailChanges from './AuditDetailChanges';
import AuditEntityHistory from './AuditEntityHistory';

/* ─── Ре-экспорт для обратной совместимости ─────── */
export type { AuditLog } from './auditConstants';
export {
  ENTITY_TYPES,
  getEntityTypeInfo,
  ACTION_CONFIG,
  getActionConfig,
  FIELD_LABELS,
  getFieldLabel,
  buildSummary,
} from './auditConstants';

interface Props {
  log: AuditLog | null;
  onClose: () => void;
}

/* ─── Основной модал ──────────────────────────────── */
const AuditLogDetailModal = ({ log, onClose }: Props) => {
  const { token } = useAuth();
  const [history, setHistory] = useState<AuditLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Определяем "имя" объекта из доступных данных
  const objectName = useMemo(() => {
    if (!log) return null;
    const src = log.new_values || log.old_values || {};
    return src.name ?? src.full_name ?? src.description ?? src.username ?? null;
  }, [log]);

  // Загружаем полную историю объекта
  useEffect(() => {
    if (!log || !token) return;
    setHistoryLoading(true);
    fetch(
      `${API_ENDPOINTS.main}?endpoint=audit-logs&entity_type=${log.entity_type}&entity_id=${log.entity_id}&limit=200`,
      { headers: { 'X-Auth-Token': token } }
    )
      .then(r => r.json())
      .then(d => setHistory(Array.isArray(d) ? d : []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [log, token]);

  if (!log) return null;

  const actionCfg = getActionConfig(log.action);
  const hasChangedFields = log.changed_fields && Object.keys(log.changed_fields).length > 0;
  const hasNewValues = log.new_values && Object.keys(log.new_values).length > 0;
  const hasOldValues = log.old_values && Object.keys(log.old_values).length > 0;
  const isDelete = log.action === 'deleted' || log.action === 'delete';
  const isCreate = log.action === 'created';
  const isUpdate = log.action === 'updated';

  // Форматируем точную дату и время
  const formattedDate = new Date(log.created_at).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Шапка ── */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: actionCfg.bg, color: actionCfg.color, border: `1.5px solid ${actionCfg.border}` }}
            >
              <Icon name={actionCfg.icon} size={20} />
            </div>
            <div>
              <div className="font-semibold flex items-center gap-2 flex-wrap">
                <EntityBadge entityType={log.entity_type} />
                <span>#{log.entity_id}</span>
                {objectName && <span className="text-muted-foreground text-sm font-normal">«{String(objectName)}»</span>}
                <ActionBadge action={log.action} />
              </div>
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                <Icon name="User" size={11} />
                <span className="font-medium text-foreground/80">{log.username || 'Система'}</span>
                <span className="opacity-40">·</span>
                <Icon name="Clock" size={11} />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* ── Контент ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Секция: Контекст действия */}
          <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: actionCfg.bg, color: actionCfg.color }}
              >
                <Icon name={actionCfg.icon} size={13} />
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {actionCfg.labelFull}
              </div>
            </div>

            {/* Текстовое описание контекста */}
            <div className="text-sm text-foreground/80 mb-4 leading-relaxed rounded-lg px-3 py-2.5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {buildContextDescription(log)}
            </div>

            {/* Информация о пользователе и времени */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-xs text-muted-foreground mb-0.5">Пользователь</div>
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <Icon name="User" size={13} className="text-muted-foreground" />
                  {log.username || 'Система'}
                </div>
                {log.user_id && (
                  <div className="text-xs text-muted-foreground/60 mt-0.5">ID: {log.user_id}</div>
                )}
              </div>
              <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-xs text-muted-foreground mb-0.5">Дата и время</div>
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <Icon name="Calendar" size={13} className="text-muted-foreground" />
                  {formattedDate}
                </div>
                <div className="text-xs text-muted-foreground/60 mt-0.5">
                  Запись #{log.id}
                </div>
              </div>
            </div>
          </div>

          {/* Секция: Детали изменений */}
          <AuditDetailChanges
            log={log}
            isUpdate={isUpdate}
            isCreate={isCreate}
            isDelete={isDelete}
            hasChangedFields={!!hasChangedFields}
            hasNewValues={!!hasNewValues}
            hasOldValues={!!hasOldValues}
          />

          {/* Секция: История объекта */}
          <AuditEntityHistory
            log={log}
            history={history}
            historyLoading={historyLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailModal;
