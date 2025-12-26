import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import TicketDetailsHeader from './TicketDetailsHeader';
import TicketDetailsInfo from './TicketDetailsInfo';
import TicketDetailsSidebar from './TicketDetailsSidebar';
import TicketComments from './TicketComments';

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
  const [sendingPing, setSendingPing] = useState(false);

  useEffect(() => {
    if (ticket?.id && token) {
      loadComments();
      loadUsers();
    }
  }, [ticket?.id, token]);

  const loadUsers = async () => {
    if (!token) {
      console.log('[loadUsers] No token available');
      return;
    }

    console.log('[loadUsers] Starting to load users...');
    try {
      const mainUrl = 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd';
      const response = await fetch(`${mainUrl}?endpoint=users`, {
        headers: { 'X-Auth-Token': token },
      });

      console.log('[loadUsers] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[loadUsers] Received data:', data);
        console.log('[loadUsers] Users count:', data?.length || 0);
        
        // Адаптируем данные из формата Users API (username, full_name) в локальный формат (name, email)
        const adaptedUsers = Array.isArray(data) ? data.map((u: any) => ({
          id: u.id,
          name: u.full_name || u.username,
          email: u.username,
          role: ''
        })) : [];
        
        setUsers(adaptedUsers);
      } else {
        const errorText = await response.text();
        console.error('[loadUsers] Error response:', errorText);
      }
    } catch (err) {
      console.error('[loadUsers] Failed to load users:', err);
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

  const handleSendPing = async () => {
    if (!ticket?.id || !token) return;

    setSendingPing(true);
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
          is_ping: true,
        }),
      });

      if (response.ok) {
        await loadComments();
        toast({
          title: 'Успешно',
          description: 'Запрос отправлен исполнителю',
        });
      } else {
        const data = await response.json();
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить запрос',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to send ping:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить запрос',
        variant: 'destructive',
      });
    } finally {
      setSendingPing(false);
    }
  };

  if (!ticket) return null;

  return (
    <Dialog open={!!ticket} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            <TicketDetailsHeader ticket={ticket} />
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden flex-1 min-h-0">
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto pr-2">
              <div className="space-y-6">
                <TicketDetailsInfo ticket={ticket} />
                
                <TicketComments
                  comments={comments}
                  loadingComments={loadingComments}
                  newComment={newComment}
                  submittingComment={submittingComment}
                  onCommentChange={setNewComment}
                  onSubmitComment={handleSubmitComment}
                  isCustomer={ticket.created_by === user?.id}
                  hasAssignee={!!ticket.assigned_to}
                  sendingPing={sendingPing}
                  onSendPing={handleSendPing}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 overflow-y-auto pr-2">
            <TicketDetailsSidebar
              ticket={ticket}
              statuses={statuses}
              users={users}
              updating={updating}
              onUpdateStatus={handleUpdateStatus}
              onAssignUser={handleAssignUser}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsModal;