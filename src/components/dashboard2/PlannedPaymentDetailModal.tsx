import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { PaymentRecord } from '@/contexts/PaymentsCacheContext';

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

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '13px', color: 'hsl(var(--foreground))', fontWeight: 600, wordBreak: 'break-word' }}>{value}</div>
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

  useEffect(() => { setActionLoading(null); }, [payment?.id]);

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

  return (
    <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="!flex !flex-col !gap-0 !p-0 w-[95vw]" style={{ maxWidth: '900px', overflow: 'hidden', maxHeight: '95dvh' }}>
        <DialogHeader style={{ padding: '18px 20px 0', flexShrink: 0 }}>
          <DialogTitle style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="CalendarClock" size={16} style={{ color: '#ffb547', flexShrink: 0 }} />
            Запланированный платёж #{payment.id}
          </DialogTitle>
        </DialogHeader>

        <div style={{ padding: '14px 20px', overflowY: 'auto', flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            background: 'hsl(var(--muted))',
            border: '1px solid hsl(var(--border))', borderRadius: '10px',
            padding: '14px 16px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>Сумма платежа</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'hsl(var(--foreground))' }}>{fmt(payment.amount)}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: '#6366f1', borderRadius: '4px', padding: '2px 6px' }}>
                Запланированный
              </span>
              {recType && recType !== 'once' && (
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: '#0ea5e9', borderRadius: '4px', padding: '2px 6px' }}>
                  {REC_LABEL[recType] ?? recType}
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Row label="Дата платежа"    value={fmtDate(payment.payment_date as string)} />
            <Row label="Категория"        value={payment.category_name} />
            <Row label="Контрагент"       value={payment.contractor_name} />
            <Row label="Юридическое лицо" value={payment.legal_entity_name} />
            <Row label="Отдел-заказчик"   value={payment.department_name} />
            <Row label="Сервис"           value={payment.service_name} />
            {(payment as Record<string, unknown>).invoice_number && (
              <Row label="Номер счёта" value={(payment as Record<string, unknown>).invoice_number as string} />
            )}
            {(payment as Record<string, unknown>).recurrence_end_date && (
              <Row label="Повторять до" value={fmtDate((payment as Record<string, unknown>).recurrence_end_date as string)} />
            )}
          </div>

          {payment.description && (
            <div>
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 500, marginBottom: '4px' }}>Назначение</div>
              <div style={{ fontSize: '13px', color: 'hsl(var(--foreground))', background: 'hsl(var(--muted))', borderRadius: '8px', padding: '10px 12px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                {payment.description}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: '12px 20px 18px', borderTop: '1px solid hsl(var(--border))', display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
          <Button
            onClick={handleApprove}
            disabled={!!actionLoading}
            style={{
              flex: 1, minWidth: '120px', gap: '6px',
              background: '#01b574', color: '#fff', border: 'none',
              opacity: actionLoading === 'reject' ? 0.5 : 1,
            }}
            className="hover:opacity-90"
          >
            {actionLoading === 'approve' ? (
              <Icon name="Loader2" size={15} className="animate-spin" />
            ) : (
              <Icon name="CheckCircle" size={15} />
            )}
            Согласовать
          </Button>
          <Button
            onClick={handleReject}
            disabled={!!actionLoading}
            variant="outline"
            style={{
              flex: 1, minWidth: '120px', gap: '6px',
              color: '#ff6b6b', borderColor: '#ff6b6b40',
              opacity: actionLoading === 'approve' ? 0.5 : 1,
            }}
            className="hover:bg-red-500/10"
          >
            {actionLoading === 'reject' ? (
              <Icon name="Loader2" size={15} className="animate-spin" />
            ) : (
              <Icon name="XCircle" size={15} />
            )}
            Отклонить
          </Button>
          <Button variant="outline" onClick={onClose} style={{ flexShrink: 0 }}>
            Закрыть
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlannedPaymentDetailModal;
