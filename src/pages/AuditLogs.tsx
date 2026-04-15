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
import AuditLogDetailModal, {
  type AuditLog,
  ENTITY_TYPES,
  getEntityTypeInfo,
  getActionConfig,
  getFieldLabel,
  buildSummary,
} from '@/components/audit/AuditLogDetailModal';

const ACTIONS = [
  { value: 'created',   label: 'Создание'                  },
  { value: 'updated',   label: 'Изменение'                 },
  { value: 'deleted',   label: 'Удаление'                  },
  { value: 'submitted', label: 'Отправка на согласование'  },
  { value: 'approved',  label: 'Согласование'              },
  { value: 'rejected',  label: 'Отклонение'                },
];

const AuditLogs = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);

  const { menuOpen, setMenuOpen, handleTouchStart, handleTouchMove, handleTouchEnd } = useSidebarTouch();

  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Детали / платёж
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [selectedApprovedPaymentId, setSelectedApprovedPaymentId] = useState<number | null>(null);
  const [deletingLogId, setDeletingLogId] = useState<number | null>(null);

  /* ── Загрузка ─────────────────────────────────── */
  useEffect(() => {
    if (!token) return;
    const load = async () => {
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
        toast({ title: 'Ошибка', description: 'Не удалось загрузить историю', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, entityTypeFilter, actionFilter]);

  /* ── Фильтрация ───────────────────────────────── */
  const filteredLogs = logs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const entityLabel = getEntityTypeInfo(log.entity_type).label.toLowerCase();
    const actionLabel = getActionConfig(log.action).label.toLowerCase();
    return (
      log.username?.toLowerCase().includes(q) ||
      entityLabel.includes(q) ||
      actionLabel.includes(q) ||
      String(log.entity_id).includes(q) ||
      buildSummary(log).toLowerCase().includes(q) ||
      (log.new_values && JSON.stringify(log.new_values).toLowerCase().includes(q)) ||
      (log.old_values && JSON.stringify(log.old_values).toLowerCase().includes(q))
    );
  });

  /* ── Клик по записи ──────────────────────────── */
  const handleLogClick = (log: AuditLog) => {
    setSelectedLog(log);
  };

  /* ── Удаление ─────────────────────────────────── */
  const handleDeleteLog = async (e: React.MouseEvent, logId: number) => {
    e.stopPropagation();
    if (!confirm('Удалить эту запись из истории?')) return;
    setDeletingLogId(logId);
    try {
      const res = await fetch(`${API_ENDPOINTS.main}?endpoint=audit-logs&id=${logId}`, {
        method: 'DELETE',
        headers: { 'X-Auth-Token': token || '' },
      });
      if (!res.ok) throw new Error();
      setLogs(prev => prev.filter(l => l.id !== logId));
      toast({ title: 'Успешно', description: 'Запись удалена' });
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось удалить запись', variant: 'destructive' });
    } finally {
      setDeletingLogId(null);
    }
  };

  /* ── Рендер ───────────────────────────────────── */
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
            <h1 className="text-2xl md:text-3xl font-bold mb-1">История изменений</h1>
            <p className="text-sm text-muted-foreground">
              Все действия в системе — платежи, пользователи, справочники, согласования
            </p>
          </div>

          <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <CardContent className="p-4 sm:p-6">

              {/* ── Фильтры ── */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по пользователю, объекту, значению..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 text-sm h-9"
                  />
                </div>
                <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
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
                  <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
                    <SelectValue placeholder="Действие" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все действия</SelectItem>
                    {ACTIONS.map(a => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* ── Счётчик ── */}
              {!loading && (
                <div className="text-xs text-muted-foreground mb-4">
                  {filteredLogs.length !== logs.length
                    ? `${filteredLogs.length} из ${logs.length} записей`
                    : `${logs.length} записей`}
                  {' · '}
                  <span className="opacity-60">Нажмите на строку для детализации</span>
                </div>
              )}

              {/* ── Список ── */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Загрузка...</p>
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Icon name="FileText" size={40} className="text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    {searchQuery || entityTypeFilter !== 'all' || actionFilter !== 'all'
                      ? 'Ничего не найдено' : 'История изменений пуста'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {filteredLogs.map(log => {
                    const action = getActionConfig(log.action);
                    const entity = getEntityTypeInfo(log.entity_type);
                    const summary = buildSummary(log);
                    const isPayment = log.entity_type === 'payment' || log.entity_type === 'approved_payment';

                    return (
                      <div
                        key={log.id}
                        className="group flex items-start gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors hover:bg-white/[0.04]"
                        style={{ border: '1px solid rgba(255,255,255,0.05)' }}
                        onClick={() => handleLogClick(log)}
                      >
                        {/* Иконка */}
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: action.bg, color: action.color, border: `1px solid ${action.border}` }}
                        >
                          <Icon name={action.icon} size={14} />
                        </div>

                        {/* Основной контент */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              {/* Строка 1: тип + id + действие */}
                              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                                <span
                                  className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md flex-shrink-0"
                                  style={{ background: 'rgba(255,255,255,0.07)', color: 'hsl(var(--muted-foreground))' }}
                                >
                                  <Icon name={entity.icon} size={10} />
                                  {entity.label}
                                </span>
                                <span className="text-sm font-medium">
                                  #{log.entity_id}
                                </span>
                                {isPayment && (
                                  <button
                                    className="text-xs text-primary hover:underline flex items-center gap-0.5"
                                    onClick={e => {
                                      e.stopPropagation();
                                      if (log.entity_type === 'payment') setSelectedPaymentId(log.entity_id);
                                      else setSelectedApprovedPaymentId(log.entity_id);
                                    }}
                                  >
                                    <Icon name="ExternalLink" size={10} />
                                    открыть
                                  </button>
                                )}
                                <span
                                  className="text-xs font-medium px-1.5 py-0.5 rounded-full"
                                  style={{ background: action.bg, color: action.color, border: `1px solid ${action.border}` }}
                                >
                                  {action.label}
                                </span>
                              </div>

                              {/* Строка 2: краткое описание */}
                              {summary && (
                                <div className="text-xs text-muted-foreground break-words max-w-[440px]">
                                  {summary}
                                </div>
                              )}

                              {/* Строка 3: пользователь */}
                              <div className="flex items-center gap-1 mt-0.5">
                                <Icon name="User" size={10} className="text-muted-foreground/50" />
                                <span className="text-xs text-muted-foreground/70">{log.username || 'Система'}</span>
                              </div>
                            </div>

                            {/* Правая часть: дата + удаление */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-xs text-muted-foreground/60 whitespace-nowrap">
                                {new Date(log.created_at).toLocaleString('ru-RU', {
                                  day: '2-digit', month: '2-digit', year: '2-digit',
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </span>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={e => handleDeleteLog(e, log.id)}
                                  disabled={deletingLogId === log.id}
                                  className="h-6 w-6 p-0 hover:bg-red-500/10 hover:text-red-500 text-muted-foreground"
                                >
                                  {deletingLogId === log.id
                                    ? <Icon name="Loader2" size={12} className="animate-spin" />
                                    : <Icon name="Trash2" size={12} />
                                  }
                                </Button>
                              </div>
                            </div>
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

      {/* ── Модальные окна ── */}
      <AuditLogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />

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