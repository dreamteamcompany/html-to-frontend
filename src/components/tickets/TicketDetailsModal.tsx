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
  attachments?: {
    id: number;
    filename: string;
    url: string;
    size: number;
  }[];
  reactions?: {
    emoji: string;
    count: number;
    users: number[];
  }[];
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

  const handleSubmitComment = async (files?: File[]) => {
    if (!newComment.trim() || !ticket?.id || !token) return;

    setSubmittingComment(true);
    try {
      let fileUrls: { filename: string; url: string; size: number }[] = [];
      
      // Загружаем файлы, если они есть (конвертируем в base64)
      if (files && files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          // Конвертируем файл в base64
          const reader = new FileReader();
          const base64Data = await new Promise<string>((resolve) => {
            reader.onload = () => {
              const result = reader.result as string;
              resolve(result.split(',')[1]); // Убираем prefix 'data:...'
            };
            reader.readAsDataURL(file);
          });
          
          const uploadResponse = await fetch(
            'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=upload-file',
            {
              method: 'POST',
              headers: { 
                'X-Auth-Token': token,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                filename: file.name,
                data: base64Data,
                content_type: file.type
              }),
            }
          );
          
          if (uploadResponse.ok) {
            const data = await uploadResponse.json();
            return { filename: file.name, url: data.url, size: file.size };
          }
          return null;
        });
        
        const results = await Promise.all(uploadPromises);
        fileUrls = results.filter((r): r is { filename: string; url: string; size: number } => r !== null);
      }
      
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
          attachments: fileUrls.length > 0 ? fileUrls : undefined,
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

  const handleReaction = async (commentId: number, emoji: string) => {
    if (!token || !user?.id) return;

    try {
      const mainUrl = 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd';
      const response = await fetch(`${mainUrl}?endpoint=comment-reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({
          comment_id: commentId,
          emoji,
        }),
      });

      if (response.ok) {
        await loadComments();
      }
    } catch (err) {
      console.error('Failed to add reaction:', err);
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
      <DialogContent className="max-w-7xl max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Компактный header с ключевой информацией */}
        <div className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {ticket.category_icon && (
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon name={ticket.category_icon} size={18} className="text-primary" />
                </div>
              )}
              <h2 className="text-lg font-semibold truncate flex-1">{ticket.title}</h2>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {ticket.priority_name && (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1"
                  style={{ 
                    borderColor: ticket.priority_color,
                    color: ticket.priority_color
                  }}
                >
                  <Icon name="Flag" size={12} />
                  {ticket.priority_name}
                </Badge>
              )}
              {ticket.status_name && (
                <Badge
                  style={{ 
                    backgroundColor: `${ticket.status_color}`,
                    color: 'white'
                  }}
                >
                  {ticket.status_name}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Основное содержание: двухколоночный макет */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] h-full">
            {/* Левая колонка - Контент и комментарии */}
            <div className="flex flex-col h-full overflow-y-auto border-r">
              <div className="px-6 py-5 space-y-6">
                {/* Описание */}
                {ticket.description && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="FileText" size={16} className="text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-muted-foreground">Описание</h3>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">{ticket.description}</p>
                  </div>
                )}

                {/* Дополнительные поля */}
                {ticket.custom_fields && ticket.custom_fields.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon name="Settings" size={16} className="text-muted-foreground" />
                      <h3 className="text-sm font-semibold text-muted-foreground">Дополнительные поля</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {ticket.custom_fields.map((field) => (
                        <div key={field.id} className="p-3 rounded-lg bg-muted/40 border">
                          <p className="text-xs text-muted-foreground mb-1">{field.name}</p>
                          <p className="text-sm font-medium">{field.value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Комментарии */}
                <div className="border-t pt-6">
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
                    currentUserId={user?.id}
                    onReaction={handleReaction}
                  />
                </div>
              </div>
            </div>

            {/* Правая колонка - Метаданные (сайдбар) */}
            <div className="bg-muted/20 overflow-y-auto">
              <div className="px-5 py-5 sticky top-0">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsModal;