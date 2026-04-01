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
export const HIDDEN_FIELDS = new Set(['password_hash', 'email', 'last_login']);

export const getFieldLabel = (f: string) => FIELD_LABELS[f] ?? f.replace(/_/g, ' ');

/** Форматирование значения для отображения */
export const formatValue = (value: unknown, field?: string): string => {
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
export const buildContextDescription = (log: AuditLog): string => {
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
