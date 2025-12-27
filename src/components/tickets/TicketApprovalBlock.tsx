import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ApprovalHistory {
  id: number;
  action: string;
  comment?: string;
  created_at: string;
  approver_id: number;
}

interface TicketApprovalBlockProps {
  ticketId: number;
  statusName: string;
  onStatusChange: () => void;
}

const TicketApprovalBlock = ({ ticketId, statusName, onStatusChange }: TicketApprovalBlockProps) => {
  const { token, user } = useAuth();
  const [approvalHistory, setApprovalHistory] = useState<ApprovalHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [showCommentField, setShowCommentField] = useState(false);
  const [actionType, setActionType] = useState<'approved' | 'rejected' | null>(null);

  const loadApprovalHistory = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://functions.poehali.dev/f1de2a37-a195-4b2c-9bae-c49c06b56326?ticket_id=${ticketId}`,
        {
          headers: {
            'X-User-Id': user?.id.toString() || '',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApprovalHistory(data);
      }
    } catch (error) {
      console.error('Failed to load approval history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovalHistory();
  }, [ticketId, token]);

  const handleSubmitForApproval = async () => {
    if (!token || !user) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/f1de2a37-a195-4b2c-9bae-c49c06b56326',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user.id.toString(),
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ ticket_id: ticketId }),
        }
      );

      if (response.ok) {
        await loadApprovalHistory();
        onStatusChange();
      }
    } catch (error) {
      console.error('Failed to submit for approval:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprovalAction = async () => {
    if (!token || !user || !actionType) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        'https://functions.poehali.dev/f1de2a37-a195-4b2c-9bae-c49c06b56326',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': user.id.toString(),
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ticket_id: ticketId,
            action: actionType,
            comment: comment,
          }),
        }
      );

      if (response.ok) {
        await loadApprovalHistory();
        onStatusChange();
        setComment('');
        setShowCommentField(false);
        setActionType(null);
      }
    } catch (error) {
      console.error('Failed to process approval:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const pendingApprovals = approvalHistory.filter(a => a.action === 'pending');
  const completedApprovals = approvalHistory.filter(a => a.action !== 'pending' && a.action !== 'submitted');
  const isAwaitingApproval = statusName === 'На согласовании';
  const isApproved = statusName === 'Одобрена';
  const isRejected = statusName === 'Отклонена';
  const canSubmit = statusName === 'В работе' || statusName === 'Новая';
  const canApprove = isAwaitingApproval && pendingApprovals.some(a => a.approver_id === user?.id);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approved':
        return <Icon name="CheckCircle" className="text-green-500" size={16} />;
      case 'rejected':
        return <Icon name="XCircle" className="text-red-500" size={16} />;
      case 'submitted':
        return <Icon name="Send" className="text-blue-500" size={16} />;
      case 'pending':
        return <Icon name="Clock" className="text-yellow-500" size={16} />;
      default:
        return null;
    }
  };

  const getActionText = (action: string) => {
    switch (action) {
      case 'approved':
        return 'Одобрил';
      case 'rejected':
        return 'Отклонил';
      case 'submitted':
        return 'Отправил на согласование';
      case 'pending':
        return 'Ожидает решения';
      default:
        return action;
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Icon name="FileCheck" size={20} />
        Согласование
      </h3>

      {canSubmit && (
        <Button
          onClick={handleSubmitForApproval}
          disabled={submitting}
          className="w-full"
        >
          {submitting ? 'Отправка...' : 'Отправить на согласование'}
        </Button>
      )}

      {isAwaitingApproval && (
        <div className="space-y-3">
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
              <Icon name="Clock" size={16} />
              Ожидается согласование от:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
              {pendingApprovals.map((approval) => (
                <li key={approval.id}>• Согласующий #{approval.approver_id}</li>
              ))}
            </ul>
          </div>

          {canApprove && !showCommentField && (
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setActionType('approved');
                  handleApprovalAction();
                }}
                disabled={submitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Icon name="Check" size={16} className="mr-1" />
                Одобрить
              </Button>
              <Button
                onClick={() => {
                  setActionType('rejected');
                  setShowCommentField(true);
                }}
                disabled={submitting}
                variant="destructive"
                className="flex-1"
              >
                <Icon name="X" size={16} className="mr-1" />
                Отклонить
              </Button>
            </div>
          )}

          {showCommentField && (
            <div className="space-y-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Причина отклонения (опционально)"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleApprovalAction}
                  disabled={submitting}
                  variant="destructive"
                  className="flex-1"
                >
                  {submitting ? 'Отправка...' : 'Подтвердить отклонение'}
                </Button>
                <Button
                  onClick={() => {
                    setShowCommentField(false);
                    setActionType(null);
                    setComment('');
                  }}
                  variant="outline"
                  disabled={submitting}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {isApproved && (
        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <p className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
            <Icon name="CheckCircle" size={16} />
            Заявка одобрена
          </p>
          {completedApprovals.filter(a => a.action === 'approved').map((approval) => (
            <p key={approval.id} className="text-xs text-green-700 dark:text-green-300 mt-1">
              {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true, locale: ru })}
            </p>
          ))}
        </div>
      )}

      {isRejected && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
          <p className="text-sm font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
            <Icon name="XCircle" size={16} />
            Заявка отклонена
          </p>
          {completedApprovals.filter(a => a.action === 'rejected').map((approval) => (
            <div key={approval.id} className="mt-2">
              <p className="text-xs text-red-700 dark:text-red-300">
                {formatDistanceToNow(new Date(approval.created_at), { addSuffix: true, locale: ru })}
              </p>
              {approval.comment && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Причина: {approval.comment}
                </p>
              )}
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleSubmitForApproval}
              disabled={submitting}
              size="sm"
              variant="outline"
              className="flex-1"
            >
              <Icon name="RotateCcw" size={14} className="mr-1" />
              Доработать и отправить снова
            </Button>
          </div>
        </div>
      )}

      {approvalHistory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">История согласований</h4>
          <div className="space-y-2">
            {approvalHistory.slice().reverse().map((item) => (
              <div key={item.id} className="flex items-start gap-2 text-sm p-2 rounded bg-muted/50">
                {getActionIcon(item.action)}
                <div className="flex-1">
                  <p className="font-medium">{getActionText(item.action)}</p>
                  {item.comment && (
                    <p className="text-muted-foreground text-xs mt-1">{item.comment}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ru })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketApprovalBlock;
