import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/icon';
import { API_ENDPOINTS } from '@/config/api';

/* ─── Типы ─────────────────────────────────────────── */
export interface AuditLog {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  user_id: number;
  username: string;
  changed_fields: Record<string, { old: unknown; new: unknown }> | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface Props {
  log: AuditLog | null;
  onClose: () => void;
}

/* ─── Справочники ─────────────────────────────────── */
export const ENTITY_TYPES: { value: string; label: string; icon: string }[] = [
  { value: 'payment',             label: 'Платёж',          icon: 'CreditCard'  },
  { value: 'user',                label: 'Пользователь',    icon: 'User'        },
  { value: 'category',            label: 'Категория',       icon: 'Tag'         },
  { value: 'service',             label: 'Сервис',          icon: 'Server'      },
  { value: 'contractor',          label: 'Контрагент',      icon: 'Building2'   },
  { value: 'legal_entity',        label: 'Юр. лицо',       icon: 'Briefcase'   },
  { value: 'customer_department', label: 'Отдел-заказчик',  icon: 'Users'       },
  { value: 'role',                label: 'Роль',            icon: 'Shield'      },
  { value: 'permission',          label: 'Разрешение',      icon: 'Key'         },
  { value: 'saving',              label: 'Экономия',        icon: 'PiggyBank'   },
  { value: 'saving_reason',       label: 'Причина экономии',icon: 'Lightbulb'   },
  { value: 'ticket',              label: 'Заявка',          icon: 'Ticket'      },
];

export const getEntityTypeInfo = (entityType: string) =>
  ENTITY_TYPES.find(e => e.value === entityType) ?? { label: entityType, icon: 'Activity' };

export const ACTION_CONFIG: Record<string, { label: string; labelFull: string; icon: string; color: string; bg: string; border: string }> = {
  created:   { label: 'Создан',                    labelFull: 'Создание объекта',                icon: 'Plus',        color: '#01b574', bg: 'rgba(1,181,116,0.12)',    border: 'rgba(1,181,116,0.25)'    },
  updated:   { label: 'Изменён',                   labelFull: 'Редактирование объекта',          icon: 'Edit2',       color: '#4da6ff', bg: 'rgba(77,166,255,0.12)',   border: 'rgba(77,166,255,0.25)'   },
  deleted:   { label: 'Удалён',                    labelFull: 'Удаление объекта',                icon: 'Trash2',      color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.25)'  },
  delete:    { label: 'Удалён',                    labelFull: 'Удаление объекта',                icon: 'Trash2',      color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.25)'  },
  submitted: { label: 'Отправлен на согласование', labelFull: 'Отправка на согласование',        icon: 'Send',        color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)'  },
  approved:  { label: 'Согласован',                labelFull: 'Согласование платежа',            icon: 'CheckCircle', color: '#01b574', bg: 'rgba(1,181,116,0.12)',    border: 'rgba(1,181,116,0.25)'    },
  rejected:  { label: 'Отклонён',                  labelFull: 'Отклонение платежа',              icon: 'XCircle',     color: '#ff6b6b', bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.25)'  },
};

export const getActionConfig = (action: string) =>
  ACTION_CONFIG[action] ?? {
    label: action, labelFull: action, icon: 'Activity',
    color: 'hsl(var(--muted-foreground))',
    bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)',
  };

export const FIELD_LABELS: Record<string, string> = {
  amount: 'Сумма', description: 'Описание', category_id: 'Категория',
  category: 'Категория', status: 'Статус', legal_entity_id: 'Юр. лицо',
  contractor_id: 'Контрагент', department_id: 'Отдел', service_id: 'Сервис',
  payment_date: 'Дата платежа', name: 'Название', inn: 'ИНН', kpp: 'КПП',
  full_name: 'ФИО', username: 'Логин', role_ids: 'Роли', is_active: 'Активен',
  position: 'Должность', address: 'Адрес', comment: 'Комментарий',
  frequency: 'Частота', saving_reason_id: 'Причина экономии',
  employee_id: 'Сотрудник', icon: 'Иконка', resource: 'Ресурс', action: 'Действие',
  customer_department_id: 'Отдел-заказчик', intermediate_approver_id: 'Согласующий (1)',
  final_approver_id: 'Согласующий (2)', ogrn: 'ОГРН', postal_code: 'Почтовый индекс',
  created_by: 'Создатель', created_at: 'Дата создания', invoice_number: 'Номер счёта',
  invoice_date: 'Дата счёта', is_planned: 'Плановый', id: 'ID', role: 'Роль',
  currency: 'Валюта', category_id_name: 'Категория',
  detached_payments: 'Отвязано платежей', detached_savings: 'Отвязано экономий',
  detached_tickets: 'Отвязано заявок', detached_planned: 'Отвязано плановых',
};

/** Скрытые/служебные поля, которые не стоит показывать */
const HIDDEN_FIELDS = new Set(['password_hash', 'email', 'last_login']);

export const getFieldLabel = (f: string) => FIELD_LABELS[f] ?? f.replace(/_/g, ' ');

/** Форматирование значения для отображения */
const formatValue = (value: unknown, field?: string): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Да' : 'Нет';
  if (Array.isArray(value)) return value.join(', ') || '—';
  const str = String(value);
  if (!str) return '—';
  // Форматируем статусы
  if (field === 'status') {
    const statusMap: Record<string, string> = {
      draft: 'Черновик', pending_ceo: 'На согласовании', approved: 'Согласован',
      rejected: 'Отклонён', paid: 'Оплачен',
    };
    return statusMap[str] || str;
  }
  // Форматируем суммы
  if (field === 'amount') {
    const num = parseFloat(str);
    if (!isNaN(num)) return num.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₽';
  }
  // Форматируем частоту
  if (field === 'frequency') {
    const freqMap: Record<string, string> = {
      monthly: 'Ежемесячно', quarterly: 'Ежеквартально', yearly: 'Ежегодно', one_time: 'Разовая',
    };
    return freqMap[str] || str;
  }
  // Форматируем boolean-like
  if (field === 'is_active' || field === 'is_planned') {
    return str === 'true' || str === '1' ? 'Да' : 'Нет';
  }
  return str;
};

/** Краткое описание действия для отображения в списке */
export const buildSummary = (log: AuditLog): string => {
  const et = getEntityTypeInfo(log.entity_type);
  const ac = getActionConfig(log.action);

  // изменения полей
  if (log.changed_fields) {
    const keys = Object.keys(log.changed_fields);
    if (keys.length === 1) {
      const k = keys[0];
      const v = log.changed_fields[k];
      return `${getFieldLabel(k)}: «${formatValue(v.old, k)}» → «${formatValue(v.new, k)}»`;
    }
    if (keys.length > 1) {
      return `Изменено полей: ${keys.map(getFieldLabel).join(', ')}`;
    }
  }
  // создание — показать имя/описание если есть
  if (log.action === 'created' && log.new_values) {
    const name = log.new_values.name ?? log.new_values.full_name ?? log.new_values.description ?? log.new_values.username;
    if (name) return `«${String(name)}»`;
  }
  // удаление
  if ((log.action === 'deleted' || log.action === 'delete') && log.old_values) {
    const name = log.old_values.name ?? log.old_values.full_name ?? log.old_values.username ?? log.old_values.description;
    if (name) return `«${String(name)}»`;
  }
  // метаданные
  if (log.metadata?.comment) return String(log.metadata.comment);

  return `${et.label} #${log.entity_id} — ${ac.label}`;
};

/** Развёрнутое описание контекста действия */
const buildContextDescription = (log: AuditLog): string => {
  const et = getEntityTypeInfo(log.entity_type);
  const entityName = log.new_values?.name ?? log.old_values?.name ?? log.new_values?.full_name ?? log.old_values?.full_name ?? log.new_values?.description ?? log.old_values?.description ?? log.new_values?.username ?? log.old_values?.username;
  const nameStr = entityName ? ` «${String(entityName)}»` : ` #${log.entity_id}`;

  switch (log.action) {
    case 'created':
      return `Пользователь ${log.username || 'Система'} создал ${et.label.toLowerCase()}${nameStr}. Все данные нового объекта приведены ниже.`;
    case 'updated': {
      const changedCount = log.changed_fields ? Object.keys(log.changed_fields).length : 0;
      if (changedCount > 0) {
        const fields = Object.keys(log.changed_fields!).map(getFieldLabel).join(', ');
        return `Пользователь ${log.username || 'Система'} отредактировал ${et.label.toLowerCase()}${nameStr}. Изменённые поля: ${fields}.`;
      }
      return `Пользователь ${log.username || 'Система'} отредактировал ${et.label.toLowerCase()}${nameStr}.`;
    }
    case 'deleted':
    case 'delete':
      return `Пользователь ${log.username || 'Система'} удалил ${et.label.toLowerCase()}${nameStr}. Данные объекта на момент удаления приведены ниже.`;
    case 'submitted':
      return `Пользователь ${log.username || 'Система'} отправил ${et.label.toLowerCase()}${nameStr} на согласование.`;
    case 'approved':
      return `Пользователь ${log.username || 'Система'} согласовал ${et.label.toLowerCase()}${nameStr}.${log.metadata?.comment ? ` Комментарий: ${String(log.metadata.comment)}` : ''}`;
    case 'rejected':
      return `Пользователь ${log.username || 'Система'} отклонил ${et.label.toLowerCase()}${nameStr}.${log.metadata?.comment ? ` Причина: ${String(log.metadata.comment)}` : ''}`;
    default:
      return `Действие «${log.action}» над ${et.label.toLowerCase()}${nameStr}.`;
  }
};

/* ─── Вспомогательные компоненты ─────────────────── */
const ActionBadge = ({ action }: { action: string }) => {
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

const EntityBadge = ({ entityType }: { entityType: string }) => {
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

const FieldDiff = ({ field, oldVal, newVal }: { field: string; oldVal: unknown; newVal: unknown }) => (
  <div className="flex flex-wrap items-center gap-1.5 text-xs py-2"
    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <span className="text-muted-foreground min-w-[120px] font-medium">{getFieldLabel(field)}</span>
    <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 line-through break-all">
      {formatValue(oldVal, field)}
    </span>
    <Icon name="ArrowRight" size={11} className="text-muted-foreground/40 flex-shrink-0" />
    <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 break-all">
      {formatValue(newVal, field)}
    </span>
  </div>
);

const ValueRow = ({ label, value, highlight }: { label: string; value: string; highlight?: 'green' | 'red' }) => (
  <div className="flex items-start gap-3 py-1.5 text-xs"
    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
    <span className="text-muted-foreground min-w-[120px] flex-shrink-0 font-medium">{label}</span>
    <span className={
      highlight === 'green' ? 'text-green-400' :
        highlight === 'red' ? 'text-red-400 line-through opacity-70' :
          'text-foreground/90'
    }>{value}</span>
  </div>
);

/** Информационная карточка объекта (для создания/удаления показываем полные данные) */
const ObjectInfoCard = ({ data, highlight, title }: { data: Record<string, unknown>; highlight: 'green' | 'red'; title: string }) => {
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
  const entityInfo = getEntityTypeInfo(log.entity_type);
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

          {/* Секция: История объекта */}
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
                              <div className="text-xs text-muted-foreground/80 mt-0.5 truncate">
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
                                  <span className="text-red-400/70 line-through ml-1">{formatValue(vals.old, field)}</span>
                                  <span className="text-muted-foreground/40 mx-0.5">→</span>
                                  <span className="text-green-400/70">{formatValue(vals.new, field)}</span>
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
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailModal;