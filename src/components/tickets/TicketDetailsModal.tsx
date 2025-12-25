import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  value: string;
}

interface Ticket {
  id: number;
  title: string;
  description?: string;
  category_name?: string;
  category_icon?: string;
  priority_id?: number;
  priority_name?: string;
  priority_color?: string;
  status_id?: number;
  status_name?: string;
  status_color?: string;
  department_name?: string;
  created_by: number;
  creator_name?: string;
  creator_email?: string;
  assigned_to?: number;
  assignee_name?: string;
  assignee_email?: string;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  closed_at?: string;
  custom_fields?: CustomField[];
}

interface Comment {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name?: string;
  user_email?: string;
  comment: string;
  is_internal: boolean;
  created_at?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Status {
  id: number;
  name: string;
  color: string;
  is_closed: boolean;
}

interface TicketDetailsModalProps {
  ticket: Ticket | null;
  onClose: () => void;
  statuses?: Status[];
  onTicketUpdate?: () => void;
}

const TicketDetailsModal = ({ ticket, onClose, statuses = [], onTicketUpdate }: TicketDetailsModalProps) => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (ticket?.id && token) {
      loadComments();
      loadUsers();
    }
  }, [ticket?.id, token]);

  const loadUsers = async () => {
    if (!token) return;

    try {
      const mainUrl = 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd';
      const response = await fetch(`${mainUrl}?endpoint=users-list`, {
        headers: { 'X-Auth-Token': token },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadComments = async () => {
    if (!ticket?.id || !token) return;

    setLoadingComments(true);
    try {
      const mainUrl = 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd';
      const response = await fetch(`${mainUrl}?endpoint=ticket-comments-api&ticket_id=${ticket.id}`, {
        headers: { 'X-Auth-Token': token },
      });

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !ticket?.id || !token) return;

    setSubmittingComment(true);
    try {
      const mainUrl = 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd';
      const response = await fetch(`${mainUrl}?endpoint=ticket-comments-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          comment: newComment,
          is_internal: false,
        }),
      });

      if (response.ok) {
        setNewComment('');
        await loadComments();
        toast({
          title: 'Успешно',
          description: 'Комментарий добавлен',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось добавить комментарий',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить комментарий',
        variant: 'destructive',
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (statusId: string) => {
    if (!ticket?.id || !token) return;

    setUpdating(true);
    try {
      const mainUrl = 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd';
      const response = await fetch(`${mainUrl}?endpoint=tickets-api`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          status_id: parseInt(statusId),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Статус заявки обновлён',
        });
        onTicketUpdate?.();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось обновить статус',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignUser = async (userId: string) => {
    if (!ticket?.id || !token) return;

    setUpdating(true);
    try {
      const mainUrl = 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd';
      const response = await fetch(`${mainUrl}?endpoint=tickets-api`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          assigned_to: userId === 'unassign' ? null : parseInt(userId),
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: userId === 'unassign' ? 'Исполнитель снят' : 'Исполнитель назначен',
        });
        onTicketUpdate?.();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось назначить исполнителя',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to assign user:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось назначить исполнителя',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (!ticket) return null;

  const getDeadlineInfo = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const now = new Date().getTime();
    const due = new Date(dueDate).getTime();
    const timeLeft = due - now;
    
    if (timeLeft < 0) {
      return { color: '#ef4444', label: 'Просрочена', urgent: true };
    }
    
    const oneDay = 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil(timeLeft / oneDay);
    
    if (daysLeft <= 1) {
      return { color: '#ef4444', label: `Остался ${daysLeft} день`, urgent: true };
    } else if (daysLeft <= 3) {
      return { color: '#f97316', label: `Осталось ${daysLeft} дня`, urgent: true };
    } else if (daysLeft <= 7) {
      return { color: '#eab308', label: `Осталось ${daysLeft} дней`, urgent: false };
    } else {
      return { color: '#22c55e', label: `Осталось ${daysLeft} дней`, urgent: false };
    }
  };

  const deadlineInfo = getDeadlineInfo(ticket.due_date);

  return (
    <Dialog open={!!ticket} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {ticket.category_icon && (
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon name={ticket.category_icon} size={20} className="text-primary" />
              </div>
            )}
            <span className="flex-1">{ticket.title}</span>
            {ticket.status_name && (
              <Badge
                variant="secondary"
                style={{ 
                  backgroundColor: `${ticket.status_color}20`,
                  color: ticket.status_color,
                  borderColor: ticket.status_color
                }}
              >
                {ticket.status_name}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                <Icon name="CheckCircle" size={16} />
                Статус
              </h3>
              <Select
                value={ticket.status_id?.toString()}
                onValueChange={handleUpdateStatus}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите статус" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={status.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                        {status.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {ticket.creator_name && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                  <Icon name="User" size={16} />
                  Заказчик
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Icon name="User" size={20} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{ticket.creator_name}</p>
                    {ticket.creator_email && (
                      <p className="text-sm text-muted-foreground">{ticket.creator_email}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
                <Icon name="UserCheck" size={16} />
                Исполнитель
              </h3>
              <Select
                value={ticket.assigned_to?.toString() || 'unassign'}
                onValueChange={handleAssignUser}
                disabled={updating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите исполнителя" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassign">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="UserX" size={14} />
                      Не назначен
                    </div>
                  </SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id.toString()}>
                      <div className="flex flex-col">
                        <span>{u.name}</span>
                        <span className="text-xs text-muted-foreground">{u.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {ticket.description && (
            <div>
              <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Описание</h3>
              <p className="text-base whitespace-pre-wrap">{ticket.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {ticket.category_name && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Категория</h3>
                <div className="flex items-center gap-2">
                  {ticket.category_icon && <Icon name={ticket.category_icon} size={16} />}
                  <span>{ticket.category_name}</span>
                </div>
              </div>
            )}

            {ticket.priority_name && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Приоритет</h3>
                <Badge
                  variant="outline"
                  className="flex items-center gap-2 w-fit"
                  style={{
                    borderColor: ticket.priority_color,
                    color: ticket.priority_color,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: ticket.priority_color }}
                  />
                  {ticket.priority_name}
                </Badge>
              </div>
            )}

            {ticket.department_name && (
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Отдел</h3>
                <div className="flex items-center gap-2">
                  <Icon name="Building" size={16} />
                  <span>{ticket.department_name}</span>
                </div>
              </div>
            )}

            {ticket.due_date && (
              <div className="col-span-2">
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Желаемый срок</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={16} />
                      <span>
                        {new Date(ticket.due_date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    {deadlineInfo && (
                      <span
                        className="text-sm font-medium"
                        style={{ color: deadlineInfo.color }}
                      >
                        {deadlineInfo.label}
                      </span>
                    )}
                  </div>
                  {deadlineInfo && (
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: deadlineInfo.urgent ? '100%' : '40%',
                          backgroundColor: deadlineInfo.color,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {ticket.custom_fields && ticket.custom_fields.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Дополнительные поля</h3>
              <div className="grid grid-cols-2 gap-4">
                {ticket.custom_fields.map((field) => (
                  <div key={field.id}>
                    <h4 className="text-xs font-medium mb-1 text-muted-foreground">{field.name}</h4>
                    <p className="text-sm">{field.value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-white/10">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {ticket.created_at && (
                <div>
                  <h3 className="text-xs font-semibold mb-1 text-muted-foreground">Создана</h3>
                  <div className="flex items-center gap-2">
                    <Icon name="Clock" size={14} />
                    <span>
                      {new Date(ticket.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              )}

              {ticket.updated_at && (
                <div>
                  <h3 className="text-xs font-semibold mb-1 text-muted-foreground">Обновлена</h3>
                  <div className="flex items-center gap-2">
                    <Icon name="RefreshCw" size={14} />
                    <span>
                      {new Date(ticket.updated_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="MessageSquare" size={20} />
              Комментарии ({comments.length})
            </h3>

            <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
              {loadingComments ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="MessageSquare" size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Комментариев пока нет</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon name="User" size={16} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="font-medium text-sm">{comment.user_name}</p>
                          {comment.created_at && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">{comment.comment}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-3">
              <Textarea
                placeholder="Добавить комментарий..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || submittingComment}
                  className="flex-1"
                >
                  {submittingComment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Отправка...
                    </>
                  ) : (
                    <>
                      <Icon name="Send" size={16} className="mr-2" />
                      Отправить
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsModal;