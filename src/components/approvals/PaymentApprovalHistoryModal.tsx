import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/icon';
import { API_ENDPOINTS } from '@/config/api';

interface AuditLog {
  id: number;
  payment_id: number;
  approver_id: number;
  approver_role: string;
  action: string;
  comment: string;
  created_at: string;
  username?: string;
  full_name?: string;
}

interface PaymentInfo {
  payment_id: number;
  amount?: number;
  description?: string;
}

interface PaymentApprovalHistoryModalProps {
  paymentInfo: PaymentInfo | null;
  onClose: () => void;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case 'approve': return 'CheckCircle';
    case 'reject':  return 'XCircle';
    case 'submit':  return 'Send';
    case 'revoke':  return 'RotateCcw';
    case 'created': return 'Plus';
    case 'updated': return 'Edit';
    default:        return 'Activity';
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'approve': return { textClass: 'text-green-600 dark:text-green-300',  bg: 'rgba(1,181,116,0.12)',   border: 'rgba(1,181,116,0.25)'   };
    case 'reject':  return { textClass: 'text-red-600 dark:text-red-300',      bg: 'rgba(255,107,107,0.12)', border: 'rgba(255,107,107,0.25)' };
    case 'submit':  return { textClass: 'text-blue-600 dark:text-blue-300',    bg: 'rgba(77,166,255,0.12)',  border: 'rgba(77,166,255,0.25)'  };
    case 'revoke':  return { textClass: 'text-orange-600 dark:text-orange-300', bg: 'rgba(255,181,71,0.12)',  border: 'rgba(255,181,71,0.25)'  };
    default:        return { textClass: 'text-muted-foreground',                bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
  }
};

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    approve: 'Согласован',
    reject:  'Отклонён',
    submit:  'Отправлен на согласование',
    revoke:  'Отозван',
    created: 'Создан',
    updated: 'Изменён',
  };
  return labels[action] || action;
};

const getRoleName = (role: string) => {
  const roles: Record<string, string> = {
    tech_director:          'Технический директор',
    ceo:                    'CEO',
    creator:                'Инициатор',
    submitter:              'Инициатор',
    intermediate_approver:  'Согласующий',
    final_approver:         'Финальный согласующий',
    admin:                  'Администратор',
  };
  return roles[role] || role;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

// ─────────────────────────────────────────────────────────────────────────────

const PaymentApprovalHistoryModal = ({ paymentInfo, onClose }: PaymentApprovalHistoryModalProps) => {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [logs, setLogs]       = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const handleOpenPayment = () => {
    if (!paymentInfo) return;
    onClose();
    navigate(`/payments?payment_id=${paymentInfo.payment_id}`);
  };

  useEffect(() => {
    if (!paymentInfo || !token) return;
    setLoading(true);
    setLogs([]);
    fetch(`${API_ENDPOINTS.approvalsApi}?payment_id=${paymentInfo.payment_id}&history=true`, {
      headers: { 'X-Auth-Token': token },
    })
      .then(r => r.json())
      .then(d => setLogs(Array.isArray(d.history) ? d.history : []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [paymentInfo?.payment_id, token]);

  if (!paymentInfo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Заголовок ── */}
        <div
          className="flex items-start gap-3 px-4 sm:px-5 py-3.5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Иконка */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(99,102,241,0.12)', color: 'hsl(var(--primary))' }}
          >
            <Icon name="FileCheck" size={18} />
          </div>

          {/* Текст — занимает всё свободное пространство */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span className="font-semibold text-sm whitespace-nowrap">
                Платёж #{paymentInfo.payment_id}
              </span>
              {paymentInfo.amount != null && (
                <span className="text-sm text-muted-foreground font-normal whitespace-nowrap">
                  — {Number(paymentInfo.amount).toLocaleString('ru-RU')} ₽
                </span>
              )}
            </div>
            {paymentInfo.description && (
              <div
                className="text-xs text-muted-foreground mt-0.5"
                style={{
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  wordBreak: 'break-word',
                }}
              >
                {paymentInfo.description}
              </div>
            )}
          </div>

          {/* Кнопки — не сжимаются */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-1">
            <button
              onClick={handleOpenPayment}
              className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs font-medium
                         text-muted-foreground hover:text-foreground hover:bg-white/10
                         transition-colors whitespace-nowrap"
              title="Открыть карточку платежа"
            >
              <Icon name="ExternalLink" size={14} />
              <span className="hidden sm:inline">Открыть платёж</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                         text-muted-foreground hover:text-foreground hover:bg-white/10
                         transition-colors flex-shrink-0"
            >
              <Icon name="X" size={17} />
            </button>
          </div>
        </div>

        {/* ── Подзаголовок ── */}
        <div
          className="px-4 sm:px-5 py-2 flex-shrink-0 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
        >
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            История согласований
          </span>
          {!loading && logs.length > 0 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'hsl(var(--muted-foreground))' }}
            >
              {logs.length}
            </span>
          )}
        </div>

        {/* ── Контент ── */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-7 h-7 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">Загрузка истории...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Icon name="FileText" size={36} className="text-muted-foreground/40" />
              <span className="text-sm text-muted-foreground">История согласований пуста</span>
            </div>
          ) : (
            <div className="relative">
              {/* Вертикальная линия */}
              <div
                className="absolute left-[19px] top-5 bottom-5 pointer-events-none"
                style={{ width: '1px', background: 'rgba(255,255,255,0.07)' }}
              />

              <div className="space-y-2.5">
                {logs.map((log) => {
                  const colors = getActionColor(log.action);
                  return (
                    <div key={log.id} className="flex gap-3">
                      {/* Иконка на линии */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${colors.textClass}`}
                        style={{
                          background: colors.bg,
                          border: `1.5px solid ${colors.border}`,
                        }}
                      >
                        <Icon name={getActionIcon(log.action)} size={16} />
                      </div>

                      {/* Карточка события */}
                      <div
                        className="flex-1 min-w-0 rounded-xl p-3 mb-1"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        {/* Статус + дата — два варианта: строка и колонка */}
                        <div className="flex items-start justify-between gap-2 mb-1.5 min-w-0">
                          <span
                            className={`text-sm font-semibold leading-snug ${colors.textClass}`}
                            style={{ wordBreak: 'break-word' }}
                          >
                            {getActionLabel(log.action)}
                          </span>
                          <span
                            className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0 mt-0.5"
                          >
                            {formatDate(log.created_at)}
                          </span>
                        </div>

                        {/* Пользователь + роль */}
                        <div className="flex items-start gap-1.5 flex-wrap min-w-0">
                          <Icon name="User" size={12} className="text-muted-foreground flex-shrink-0 mt-1" />
                          <span
                            className="text-xs text-foreground/80"
                            style={{
                              overflowWrap: 'anywhere',
                              lineHeight: 1.4,
                              minWidth: 0,
                            }}
                          >
                            {log.full_name || log.username || 'Система'}
                          </span>
                          {log.approver_role && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-md flex-shrink-0"
                              style={{
                                background: 'rgba(255,255,255,0.07)',
                                color: 'hsl(var(--muted-foreground))',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {getRoleName(log.approver_role)}
                            </span>
                          )}
                        </div>

                        {/* Комментарий */}
                        {log.comment && (
                          <div
                            className="mt-2 text-xs rounded-lg px-2.5 py-1.5"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              borderLeft: `3px solid ${colors.border}`,
                              color: 'hsl(var(--muted-foreground))',
                              wordBreak: 'break-word',
                            }}
                          >
                            <Icon name="MessageSquare" size={11} className="inline mr-1 opacity-60" />
                            {log.comment}
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
  );
};

export default PaymentApprovalHistoryModal;