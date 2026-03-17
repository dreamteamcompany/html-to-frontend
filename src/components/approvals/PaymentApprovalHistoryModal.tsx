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
    case 'reject': return 'XCircle';
    case 'submit': return 'Send';
    case 'revoke': return 'RotateCcw';
    case 'created': return 'Plus';
    case 'updated': return 'Edit';
    default: return 'Activity';
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'approve': return { text: '#01b574', bg: 'rgba(1, 181, 116, 0.12)', border: 'rgba(1, 181, 116, 0.25)' };
    case 'reject': return { text: '#ff6b6b', bg: 'rgba(255, 107, 107, 0.12)', border: 'rgba(255, 107, 107, 0.25)' };
    case 'submit': return { text: '#4da6ff', bg: 'rgba(77, 166, 255, 0.12)', border: 'rgba(77, 166, 255, 0.25)' };
    case 'revoke': return { text: '#ffb547', bg: 'rgba(255, 181, 71, 0.12)', border: 'rgba(255, 181, 71, 0.25)' };
    default: return { text: 'hsl(var(--muted-foreground))', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.1)' };
  }
};

const getActionLabel = (action: string) => {
  const labels: Record<string, string> = {
    approve: 'Согласован',
    reject: 'Отклонён',
    submit: 'Отправлен на согласование',
    revoke: 'Отозван',
    created: 'Создан',
    updated: 'Изменён',
  };
  return labels[action] || action;
};

const getRoleName = (role: string) => {
  const roles: Record<string, string> = {
    tech_director: 'Технический директор',
    ceo: 'CEO',
    creator: 'Инициатор',
    submitter: 'Инициатор',
    intermediate_approver: 'Согласующий',
    final_approver: 'Финальный согласующий',
    admin: 'Администратор',
  };
  return roles[role] || role;
};

const PaymentApprovalHistoryModal = ({ paymentInfo, onClose }: PaymentApprovalHistoryModalProps) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
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
      .then(res => res.json())
      .then(data => {
        setLogs(Array.isArray(data.history) ? data.history : []);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [paymentInfo?.payment_id, token]);

  if (!paymentInfo) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Заголовок */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(var(--primary-rgb, 99,102,241), 0.12)', color: 'hsl(var(--primary))' }}
            >
              <Icon name="FileCheck" size={20} />
            </div>
            <div>
              <div className="font-semibold text-sm">
                Платёж #{paymentInfo.payment_id}
                {paymentInfo.amount != null && (
                  <span className="ml-2 text-muted-foreground font-normal">
                    — {Number(paymentInfo.amount).toLocaleString('ru-RU')} ₽
                  </span>
                )}
              </div>
              {paymentInfo.description && (
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                  {paymentInfo.description}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleOpenPayment}
              className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors flex-shrink-0"
              title="Открыть карточку платежа"
            >
              <Icon name="ExternalLink" size={14} />
              <span className="hidden sm:inline">Открыть платёж</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors flex-shrink-0"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* Подзаголовок */}
        <div
          className="px-6 py-2.5 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
        >
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            История согласований
          </span>
          {!loading && logs.length > 0 && (
            <span
              className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'hsl(var(--muted-foreground))' }}
            >
              {logs.length}
            </span>
          )}
        </div>

        {/* Контент */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
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
                className="absolute left-[19px] top-5 bottom-5"
                style={{ width: '1px', background: 'rgba(255,255,255,0.07)' }}
              />

              <div className="space-y-3">
                {logs.map((log, index) => {
                  const colors = getActionColor(log.action);
                  return (
                    <div key={log.id} className="flex gap-4">
                      {/* Иконка на линии */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
                        style={{ background: colors.bg, border: `1.5px solid ${colors.border}`, color: colors.text }}
                      >
                        <Icon name={getActionIcon(log.action)} size={16} />
                      </div>

                      {/* Карточка события */}
                      <div
                        className="flex-1 rounded-xl p-3.5 mb-1"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                      >
                        {/* Действие + дата */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className="text-sm font-semibold"
                            style={{ color: colors.text }}
                          >
                            {getActionLabel(log.action)}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                            {new Date(log.created_at).toLocaleString('ru-RU', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Пользователь + роль */}
                        <div className="flex items-center gap-1.5 mb-1">
                          <Icon name="User" size={13} className="text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-foreground/90">
                            {log.full_name || log.username || 'Система'}
                          </span>
                          {log.approver_role && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-md"
                              style={{ background: 'rgba(255,255,255,0.07)', color: 'hsl(var(--muted-foreground))' }}
                            >
                              {getRoleName(log.approver_role)}
                            </span>
                          )}
                        </div>

                        {/* Комментарий */}
                        {log.comment && (
                          <div
                            className="mt-2 text-xs rounded-lg px-3 py-2"
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              borderLeft: `3px solid ${colors.border}`,
                              color: 'hsl(var(--muted-foreground))',
                            }}
                          >
                            <Icon name="MessageSquare" size={11} className="inline mr-1.5 opacity-60" />
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