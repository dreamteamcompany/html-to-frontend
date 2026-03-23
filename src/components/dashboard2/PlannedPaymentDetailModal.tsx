import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { PaymentRecord } from '@/contexts/PaymentsCacheContext';

interface PlannedPaymentDetailModalProps {
  payment: PaymentRecord | null;
  onClose: () => void;
  onActionDone?: () => void;
}

const formatAmount = (amount: number | string) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '— ₽';
  return new Intl.NumberFormat('ru-RU').format(num) + ' ₽';
};

const formatDate = (date: string | undefined) => {
  if (!date) return '—';
  const d = new Date(date.includes('T') ? date : date + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '14px', color: 'hsl(var(--foreground))', fontWeight: 600 }}>{value}</div>
    </div>
  );
};

const PlannedPaymentDetailModal = ({ payment, onClose, onActionDone }: PlannedPaymentDetailModalProps) => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  if (!payment) return null;

  const isAdmin = user?.roles?.some(r => r.name === 'Администратор' || r.name === 'Admin');
  const canApprove = isAdmin || user?.permissions?.some(p => p.name === 'payments.approve');

  const handleApprove = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.approvalsApi, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ payment_id: payment.id, action: 'approve', comment: '' }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Не удалось согласовать');
      }
      toast({ title: 'Успешно', description: 'Платёж согласован' });
      onClose();
      onActionDone?.();
    } catch (e: unknown) {
      toast({ title: 'Ошибка', description: e instanceof Error ? e.message : 'Не удалось согласовать', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.approvalsApi, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ payment_id: payment.id, action: 'reject', comment: rejectComment.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Не удалось отклонить');
      }
      toast({ title: 'Успешно', description: 'Платёж отклонён' });
      setShowRejectDialog(false);
      setRejectComment('');
      onClose();
      onActionDone?.();
    } catch (e: unknown) {
      toast({ title: 'Ошибка', description: e instanceof Error ? e.message : 'Не удалось отклонить', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open onOpenChange={onClose}>
        <DialogContent style={{ maxWidth: '520px', padding: '0', overflow: 'hidden' }}>
          <DialogHeader style={{ padding: '20px 20px 0' }}>
            <DialogTitle style={{ fontSize: '16px', fontWeight: 700 }}>
              Запланированный платёж #{payment.id}
            </DialogTitle>
            <DialogDescription style={{ fontSize: '12px', marginTop: '2px' }}>
              Полная информация о платеже
            </DialogDescription>
          </DialogHeader>

          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '60vh' }}>
            {/* Сумма */}
            <div style={{
              background: 'linear-gradient(135deg, #ffb54720 0%, #ff950010 100%)',
              border: '1px solid #ffb54740',
              borderRadius: '10px',
              padding: '14px 16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>Сумма платежа</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'hsl(var(--foreground))' }}>
                {formatAmount(payment.amount)}
              </div>
              {payment._isPlanned && (
                <div style={{
                  display: 'inline-block', marginTop: '6px',
                  fontSize: '10px', fontWeight: 700, color: '#fff',
                  background: '#6366f1', borderRadius: '4px', padding: '2px 6px',
                }}>
                  запланированный
                </div>
              )}
            </div>

            {/* Детали */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Row label="Дата платежа" value={formatDate(payment.payment_date as string)} />
              <Row label="Категория" value={payment.category_name} />
              <Row label="Контрагент" value={payment.contractor_name} />
              <Row label="Юридическое лицо" value={payment.legal_entity_name} />
              <Row label="Отдел-заказчик" value={payment.department_name} />
              <Row label="Сервис" value={payment.service_name} />
            </div>

            {payment.description && (
              <div>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 500, marginBottom: '4px' }}>Описание</div>
                <div style={{
                  fontSize: '13px', color: 'hsl(var(--foreground))',
                  background: 'hsl(var(--muted))', borderRadius: '8px', padding: '10px 12px',
                  lineHeight: '1.5',
                }}>
                  {payment.description}
                </div>
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div style={{ padding: '12px 20px 20px', borderTop: '1px solid hsl(var(--border))', display: 'flex', gap: '10px' }}>
            {canApprove ? (
              <>
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  style={{ flex: 1, background: '#16a34a', color: '#fff' }}
                  className="hover:bg-green-700"
                >
                  <Icon name="Check" size={16} />
                  Согласовать
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  <Icon name="X" size={16} />
                  Отклонить
                </Button>
              </>
            ) : (
              <div style={{ flex: 1, fontSize: '12px', color: 'hsl(var(--muted-foreground))', textAlign: 'center', padding: '8px' }}>
                Недостаточно прав для согласования
              </div>
            )}
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Закрыть
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог отклонения с комментарием */}
      {showRejectDialog && (
        <Dialog open onOpenChange={() => { setShowRejectDialog(false); setRejectComment(''); }}>
          <DialogContent style={{ maxWidth: '420px' }}>
            <DialogHeader>
              <DialogTitle>Отклонить платёж</DialogTitle>
              <DialogDescription>Укажите причину отклонения платежа #{payment.id}</DialogDescription>
            </DialogHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '4px 0' }}>
              <Textarea
                placeholder="Причина отклонения (необязательно)"
                value={rejectComment}
                onChange={e => setRejectComment(e.target.value)}
                rows={3}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="destructive"
                  onClick={handleRejectConfirm}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  {loading ? 'Отклоняю...' : 'Отклонить'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => { setShowRejectDialog(false); setRejectComment(''); }}
                  disabled={loading}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default PlannedPaymentDetailModal;
