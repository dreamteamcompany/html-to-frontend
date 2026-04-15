import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { PaymentRecord, invalidatePaymentsCache } from '@/contexts/PaymentsCacheContext';

const fmt = (amount: number | string) => {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return '— ₽';
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
};

const fmtDate = (date: string | undefined) => {
  if (!date) return '—';
  const d = new Date(date.includes('T') ? date : date + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

const REC_LABEL: Record<string, string> = {
  once: 'Однократно', daily: 'Ежедневно',
  weekly: 'Еженедельно', monthly: 'Ежемесячно', yearly: 'Ежегодно',
};

const DetailItem = ({ icon, label, value }: { icon: string; label: string; value?: React.ReactNode }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5 py-2">
      <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Icon name={icon} size={13} className="text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium leading-tight">{label}</div>
        <div className="text-sm font-semibold text-foreground break-words leading-snug mt-0.5">{value}</div>
      </div>
    </div>
  );
};

interface Props {
  payment:       PaymentRecord | null;
  onClose:       () => void;
  onActionDone?: () => void;
}

const PlannedPaymentDetailModal = ({ payment, onClose, onActionDone }: Props) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);
  const [confirmReject, setConfirmReject] = useState(false);
  const [confirmApprove, setConfirmApprove] = useState(false);

  useEffect(() => { setActionLoading(null); setConfirmReject(false); setConfirmApprove(false); }, [payment?.id]);

  const handleApprove = async () => {
    if (!payment || !token) return;
    setActionLoading('approve');
    try {
      const res = await fetch(
        `${API_ENDPOINTS.main}?endpoint=planned-payments&id=${payment.id}&action=convert`,
        { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token }, body: JSON.stringify({ id: payment.id }) }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Ошибка' }));
        throw new Error(err.error || 'Не удалось согласовать');
      }
      toast({ title: 'Согласовано', description: 'Платёж подтверждён' });
      invalidatePaymentsCache();
      onActionDone?.();
      onClose();
    } catch (err: unknown) {
      toast({ title: 'Ошибка', description: err instanceof Error ? err.message : 'Ошибка', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!payment || !token) return;
    setActionLoading('reject');
    try {
      const res = await fetch(
        `${API_ENDPOINTS.main}?endpoint=planned-payments&id=${payment.id}`,
        { method: 'DELETE', headers: { 'X-Auth-Token': token } }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Ошибка' }));
        throw new Error(err.error || 'Не удалось отклонить');
      }
      toast({ title: 'Отклонено', description: 'Запланированный платёж отклонён' });
      invalidatePaymentsCache();
      onActionDone?.();
      onClose();
    } catch (err: unknown) {
      toast({ title: 'Ошибка', description: err instanceof Error ? err.message : 'Ошибка', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  if (!payment) return null;

  const recType = (payment as Record<string, unknown>).recurrence_type as string;
  const invoiceNumber = (payment as Record<string, unknown>).invoice_number as string | undefined;
  const recEndDate = (payment as Record<string, unknown>).recurrence_end_date as string | undefined;

  return (
    <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="!p-0 w-[95vw] !gap-0 !flex !flex-col" style={{ maxWidth: '520px', overflow: 'hidden', maxHeight: '95dvh', borderRadius: '16px' }}>

        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--primary) / 0.03))' }}>
          <div className="px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255, 181, 71, 0.15)' }}>
                  <Icon name="CalendarClock" size={15} style={{ color: '#ffb547' }} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground font-medium">Запланированный платёж</div>
                  <div className="text-[11px] text-muted-foreground/60">#{payment.id}</div>
                </div>
              </div>
              <div className="w-8 h-8" />
            </div>

            <div className="text-center pb-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight leading-none">{fmt(payment.amount)}</div>
              <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-1" style={{ background: '#6366f1', color: '#fff' }}>
                  <Icon name="Clock" size={10} />
                  Запланированный
                </span>
                {recType && recType !== 'once' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-1" style={{ background: '#0ea5e9', color: '#fff' }}>
                    <Icon name="Repeat" size={10} />
                    {REC_LABEL[recType] ?? recType}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 sm:px-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            <DetailItem icon="Calendar" label="Дата платежа" value={fmtDate(payment.payment_date as string)} />
            <DetailItem icon="Tag" label="Категория" value={payment.category_name} />
            <DetailItem icon="Building2" label="Контрагент" value={payment.contractor_name} />
            <DetailItem icon="Landmark" label="Юр. лицо" value={payment.legal_entity_name} />
            <DetailItem icon="Users" label="Отдел" value={payment.department_name} />
            <DetailItem icon="Server" label="Сервис" value={payment.service_name} />
            {invoiceNumber && <DetailItem icon="FileText" label="Номер счёта" value={invoiceNumber} />}
            {recEndDate && <DetailItem icon="CalendarCheck" label="Повторять до" value={fmtDate(recEndDate)} />}
          </div>

          {payment.description && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Назначение</div>
              <div className="text-sm text-foreground leading-relaxed break-words">{payment.description}</div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 sm:px-6 border-t border-border bg-muted/30">
          <div className="flex gap-2.5">
            {!confirmApprove ? (
              <Button
                onClick={() => { setConfirmApprove(true); setConfirmReject(false); }}
                disabled={!!actionLoading}
                className="flex-1 h-10 gap-1.5 text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                style={{
                  background: '#01b574', color: '#fff', border: 'none',
                  opacity: actionLoading === 'reject' ? 0.4 : 1,
                }}
              >
                <Icon name="CheckCircle" size={15} />
                Согласовать
              </Button>
            ) : (
              <Button
                onClick={handleApprove}
                disabled={!!actionLoading}
                className="flex-1 h-10 gap-1.5 text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity animate-pulse"
                style={{ background: '#059669', color: '#fff', border: 'none' }}
              >
                {actionLoading === 'approve' ? (
                  <Icon name="Loader2" size={15} className="animate-spin" />
                ) : (
                  <Icon name="CheckCheck" size={15} />
                )}
                Подтвердить
              </Button>
            )}
            {!confirmReject ? (
              <Button
                onClick={() => { setConfirmReject(true); setConfirmApprove(false); }}
                disabled={!!actionLoading}
                variant="outline"
                className="flex-1 h-10 gap-1.5 text-sm font-semibold rounded-xl hover:bg-red-500/10 transition-colors"
                style={{
                  color: '#ff6b6b', borderColor: 'hsl(var(--border))',
                  opacity: actionLoading === 'approve' ? 0.4 : 1,
                }}
              >
                <Icon name="XCircle" size={15} />
                Отклонить
              </Button>
            ) : (
              <Button
                onClick={handleReject}
                disabled={!!actionLoading}
                className="flex-1 h-10 gap-1.5 text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity animate-pulse"
                style={{ background: '#ef4444', color: '#fff', border: 'none' }}
              >
                {actionLoading === 'reject' ? (
                  <Icon name="Loader2" size={15} className="animate-spin" />
                ) : (
                  <Icon name="AlertTriangle" size={15} />
                )}
                Подтвердить
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={onClose}
              className="shrink-0 h-10 px-4 text-sm font-medium rounded-xl text-muted-foreground hover:text-foreground"
            >
              Закрыть
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
};

export default PlannedPaymentDetailModal;