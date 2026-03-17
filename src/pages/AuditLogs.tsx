import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import PaymentDetailsModal from '@/components/payments/PaymentDetailsModal';
import ApprovedPaymentDetailsModal from '@/components/payments/ApprovedPaymentDetailsModal';
import { API_ENDPOINTS } from '@/config/api';

interface AuditLog {
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

const ENTITY_TYPES: { value: string; label: string; icon: string }[] = [
  { value: 'payment',       label: 'Платёж',          icon: 'CreditCard'   },
  { value: 'user',          label: 'Пользователь',     icon: 'User'         },
  { value: 'category',      label: 'Категория',        icon: 'Tag'          },
  { value: 'service',       label: 'Сервис',           icon: 'Server'       },
  { value: 'contractor',    label: 'Контрагент',       icon: 'Building2'    },
  { value: 'legal_entity',  label: 'Юр. лицо',        icon: 'Briefcase'    },
  { value: 'saving',        label: 'Экономия',         icon: 'PiggyBank'    },
  { value: 'ticket',        label: 'Заявка',           icon: 'Ticket'       },
];

const ACTIONS: { value: string; label: string }[] = [
  { value: 'created',   label: 'Создание'                  },
  { value: 'updated',   label: 'Изменение'                 },
  { value: 'deleted',   label: 'Удаление'                  },
  { value: 'submitted', label: 'Отправка на согласование'  },
  { value: 'approved',  label: 'Согласование'              },
  { value: 'rejected',  label: 'Отклонение'                },
  { value: 'delete',    label: 'Удаление (legacy)'         },
];

const getEntityTypeLabel = (entityType: string) => {
  return ENTITY_TYPES.find(e => e.value === entityType)?.label || entityType;
};

const getEntityTypeIcon = (entityType: string) => {
  return ENTITY_TYPES.find(e => e.value === entityType)?.icon || 'Activity';
};

const getActionConfig = (action: string): { label: string; icon: string; color: string; bg: string; border: string } => {
  const map: Record<string, { label: string; icon: string; color: string; bg: string; border: string }> = {
    created:   { label: 'Создан',                    icon: 'Plus',        color: '#01b574', bg: 'rgba(1,181,116,0.1)',    border: 'rgba(1,181,116,0.2)'    },
    updated:   { label: 'Изменён',                   icon: 'Edit',        color: '#4da6ff', bg: 'rgba(77,166,255,0.1)',   border: 'rgba(77,166,255,0.2)'   },
    deleted:   { label: 'Удалён',                    icon: 'Trash2',      color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.2)'  },
    delete:    { label: 'Удалён',                    icon: 'Trash2',      color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.2)'  },
    submitted: { label: 'Отправлен на согласование', icon: 'Send',        color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)'  },
    approved:  { label: 'Согласован',                icon: 'CheckCircle', color: '#01b574', bg: 'rgba(1,181,116,0.1)',    border: 'rgba(1,181,116,0.2)'    },
    rejected:  { label: 'Отклонён',                  icon: 'XCircle',     color: '#ff6b6b', bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.2)'  },
  };
  return map[action] || { label: action, icon: 'Activity', color: 'hsl(var(--muted-foreground))', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
};

const getFieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    amount: 'Сумма', description: 'Описание', category_id: 'Категория',
    status: 'Статус', legal_entity_id: 'Юр. лицо', contractor_id: 'Контрагент',
    department_id: 'Отдел', service_id: 'Сервис', payment_date: 'Дата платежа',
    name: 'Название', inn: 'ИНН', kpp: 'КПП', full_name: 'ФИО', username: 'Логин',
  };
  return labels[field] || field;
};

const AuditLogs = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);

  const {
    menuOpen,
    setMenuOpen,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSidebarTouch();

  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [selectedApprovedPaymentId, setSelectedApprovedPaymentId] = useState<number | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;

    const loadLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: '500',
          ...(entityTypeFilter !== 'all' && { entity_type: entityTypeFilter }),
          ...(actionFilter !== 'all' && { action: actionFilter }),
        });

        const res = await fetch(`${API_ENDPOINTS.main}?endpoint=audit-logs&${params}`, {
          headers: { 'X-Auth-Token': token },
        });
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch {
        toast({ title: 'Ошибка', description: 'Не удалось загрузить историю изменений', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, [token, entityTypeFilter, actionFilter]);

  const handlePaymentClick = (entityType: string, entityId: number) => {
    if (entityType === 'payment') setSelectedPaymentId(entityId);
    else if (entityType === 'approved_payment') setSelectedApprovedPaymentId(entityId);
  };

  const handleDeleteLog = async (logId: number) => {
    if (!confirm('Удалить эту запись из истории?')) return;
    setDeletingLogId(logId);
    try {
      const res = await fetch(`${API_ENDPOINTS.main}?endpoint=audit-logs&id=${logId}`, {
        method: 'DELETE',
        headers: { 'X-Auth-Token': token || '' },
      });
      if (!res.ok) throw new Error();
      setLogs(logs.filter(l => l.id !== logId));
      toast({ title: 'Успешно', description: 'Запись удалена' });
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось удалить запись', variant: 'destructive' });
    } finally {
      setDeletingLogId(null);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.username?.toLowerCase().includes(q) ||
      getEntityTypeLabel(log.entity_type).toLowerCase().includes(q) ||
      getActionConfig(log.action).label.toLowerCase().includes(q) ||
      String(log.entity_id).includes(q) ||
      (log.new_values && JSON.stringify(log.new_values).toLowerCase().includes(q)) ||
      (log.old_values && JSON.stringify(log.old_values).toLowerCase().includes(q))
    );
  });

  const isPaymentClickable = (entityType: string) =>
    entityType === 'payment' || entityType === 'approved_payment';

  return (
    <div className="flex min-h-screen">
      <PaymentsSidebar
        menuOpen={menuOpen}
        dictionariesOpen={dictionariesOpen}
        setDictionariesOpen={setDictionariesOpen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />

      <main className="flex-1 lg:ml-64 bg-background min-h-screen overflow-x-hidden max-w-full">
        <div className="p-4 sm:p-6 space-y-6">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors mb-4"
          >
            <Icon name="Menu" size={24} />
          </button>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">История изменений</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Все действия в системе — платежи, пользователи, справочники, согласования
            </p>
          </div>

          <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <CardContent className="p-4 sm:p-6">

              {/* Фильтры */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по пользователю, объекту, значению..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 text-sm"
                  />
                </div>
                <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[190px]">
                    <SelectValue placeholder="Тип объекта" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    {ENTITY_TYPES.map(e => (
                      <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-full sm:w-[190px]">
                    <SelectValue placeholder="Действие" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все действия</SelectItem>
                    {ACTIONS.filter(a => a.value !== 'delete').map(a => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Счётчик */}
              {!loading && (
                <div className="text-xs text-muted-foreground mb-4">
                  {filteredLogs.length} {filteredLogs.length === logs.length ? 'записей' : `из ${logs.length} записей`}
                </div>
              )}

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Загрузка...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Icon name="FileText" size={40} className="text-muted-foreground/40" />
                  <p className="text-muted-foreground">История изменений пуста</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredLogs.map(log => {
                    const action = getActionConfig(log.action);
                    const clickable = isPaymentClickable(log.entity_type);
                    const hasChanges = log.changed_fields && Object.keys(log.changed_fields).length > 0;
                    const hasNewValues = log.new_values && Object.keys(log.new_values).length > 0;
                    const hasOldValues = log.old_values && Object.keys(log.old_values).length > 0;

                    return (
                      <div
                        key={log.id}
                        className="group rounded-xl p-4 hover:bg-white/[0.03] transition-colors"
                        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Иконка действия */}
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: action.bg, border: `1px solid ${action.border}`, color: action.color }}
                          >
                            <Icon name={action.icon} size={16} />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Заголовок строки */}
                            <div className="flex items-start justify-between gap-3 mb-1.5">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                  {/* Тип объекта */}
                                  <span
                                    className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md"
                                    style={{ background: 'rgba(255,255,255,0.07)', color: 'hsl(var(--muted-foreground))' }}
                                  >
                                    <Icon name={getEntityTypeIcon(log.entity_type)} size={11} />
                                    {getEntityTypeLabel(log.entity_type)}
                                  </span>

                                  {/* ID объекта — кликабельный для платежей */}
                                  <button
                                    onClick={() => clickable && handlePaymentClick(log.entity_type, log.entity_id)}
                                    className={`text-sm font-medium ${
                                      clickable
                                        ? 'text-primary hover:underline cursor-pointer'
                                        : 'text-foreground cursor-default'
                                    }`}
                                  >
                                    #{log.entity_id}
                                    {clickable && <Icon name="ExternalLink" size={11} className="inline ml-1 opacity-60" />}
                                  </button>

                                  {/* Бейдж действия */}
                                  <span
                                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                                    style={{ background: action.bg, color: action.color, border: `1px solid ${action.border}` }}
                                  >
                                    {action.label}
                                  </span>
                                </div>

                                {/* Пользователь */}
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Icon name="User" size={11} />
                                  <span>{log.username || 'Система'}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(log.created_at).toLocaleString('ru-RU', {
                                    day: '2-digit', month: '2-digit', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                  })}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteLog(log.id)}
                                  disabled={deletingLogId === log.id}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 hover:bg-red-500/10 hover:text-red-500"
                                >
                                  {deletingLogId === log.id
                                    ? <Icon name="Loader2" size={14} className="animate-spin" />
                                    : <Icon name="Trash2" size={14} />
                                  }
                                </Button>
                              </div>
                            </div>

                            {/* Изменённые поля */}
                            {hasChanges && (
                              <div className="mt-2 space-y-1">
                                {Object.entries(log.changed_fields!).map(([field, values]) => (
                                  <div key={field} className="flex flex-wrap items-center gap-1.5 text-xs">
                                    <span className="text-muted-foreground/70">{getFieldLabel(field)}:</span>
                                    <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 line-through">
                                      {String(values.old)}
                                    </span>
                                    <Icon name="ArrowRight" size={11} className="text-muted-foreground/50" />
                                    <span className="px-1.5 py-0.5 rounded bg-green-500/10 text-green-400">
                                      {String(values.new)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Новые значения (при создании) */}
                            {!hasChanges && hasNewValues && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(log.new_values!).slice(0, 4).map(([field, val]) =>
                                  val != null && val !== '' && field !== 'role_ids' ? (
                                    <span key={field} className="text-xs text-muted-foreground">
                                      <span className="opacity-60">{getFieldLabel(field)}:</span>{' '}
                                      <span className="text-foreground/80">{String(val)}</span>
                                    </span>
                                  ) : null
                                )}
                              </div>
                            )}

                            {/* Удалённые значения */}
                            {!hasChanges && !hasNewValues && hasOldValues && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {Object.entries(log.old_values!).slice(0, 3).map(([field, val]) =>
                                  val != null ? (
                                    <span key={field} className="text-xs text-muted-foreground line-through opacity-60">
                                      {getFieldLabel(field)}: {String(val)}
                                    </span>
                                  ) : null
                                )}
                              </div>
                            )}

                            {/* Комментарий из metadata */}
                            {log.metadata?.comment && (
                              <div className="mt-2 text-xs text-muted-foreground italic flex items-center gap-1">
                                <Icon name="MessageSquare" size={11} className="opacity-60" />
                                {String(log.metadata.comment)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {selectedPaymentId && (
        <PaymentDetailsModal
          paymentId={selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
        />
      )}
      {selectedApprovedPaymentId && (
        <ApprovedPaymentDetailsModal
          paymentId={selectedApprovedPaymentId}
          onClose={() => setSelectedApprovedPaymentId(null)}
        />
      )}
    </div>
  );
};

export default AuditLogs;
