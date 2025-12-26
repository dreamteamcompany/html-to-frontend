import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
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
  const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'related' | 'sla'>('info');

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
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 gap-0 overflow-hidden flex flex-col">
        {/* Заголовок заявки */}
        <div className="px-6 py-4 border-b bg-muted/20">
          <h1 className="text-xl font-semibold">Запрос на обслуживание "{ticket.id}"</h1>
        </div>

        {/* Основное содержание */}
        <div className="flex-1 overflow-hidden flex">
          {/* Левая колонка - Суть заявки и комментарии */}
          <div className="flex-1 overflow-y-auto bg-background">
            <div className="p-6">
              {/* Суть заявки */}
              <div className="mb-6 border rounded-lg p-5 bg-card">
                <button className="flex items-center gap-2 text-sm font-semibold mb-4 w-full">
                  <Icon name="ChevronDown" size={16} />
                  Суть заявки
                </button>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Тема:</span>
                    <p className="text-sm font-medium">{ticket.title}</p>
                  </div>
                  
                  {ticket.description && (
                    <div>
                      <span className="text-sm text-muted-foreground">Описание:</span>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed mt-1">{ticket.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Комментарии и Файлы (вкладки) */}
              <div className="border-b mb-4">
                <div className="flex gap-6">
                  <button className="pb-2 border-b-2 border-primary text-sm font-medium">
                    Комментарии ({comments.length})
                  </button>
                  <button className="pb-2 border-b-2 border-transparent text-sm text-muted-foreground hover:text-foreground">
                    Файлы (0)
                  </button>
                </div>
              </div>

              {/* Форма комментария */}
              <div className="mb-6">
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

          {/* Правая колонка - Информация с вкладками */}
          <div className="w-[400px] border-l bg-muted/10 overflow-y-auto flex flex-col">
            {/* Вкладки */}
            <div className="border-b bg-background">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'info'
                      ? 'border-primary text-primary bg-muted/20'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Информация
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'tasks'
                      ? 'border-primary text-primary bg-muted/20'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Задачи (0)
                </button>
                <button
                  onClick={() => setActiveTab('related')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'related'
                      ? 'border-primary text-primary bg-muted/20'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Связи (0)
                </button>
                <button
                  onClick={() => setActiveTab('sla')}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'sla'
                      ? 'border-primary text-primary bg-muted/20'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  SLA
                </button>
              </div>
            </div>

            {/* Контент вкладок */}
            <div className="flex-1 overflow-y-auto p-5">
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Статус */}
                  <div>
                    <button className="flex items-center gap-2 text-sm font-semibold mb-3 w-full">
                      <Icon name="ChevronDown" size={16} />
                      Статус
                    </button>
                    <div className="space-y-3 pl-6">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Ответственный:</p>
                        <p className="text-sm">{ticket.assignee_name || 'Не назначен'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Статус:</p>
                        <Badge
                          style={{ 
                            backgroundColor: `${ticket.status_color}20`,
                            color: ticket.status_color,
                            borderColor: ticket.status_color
                          }}
                          className="border"
                        >
                          {ticket.status_name}
                        </Badge>
                      </div>
                      {ticket.due_date && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Решить до:</p>
                          <p className="text-sm">{new Date(ticket.due_date).toLocaleString('ru-RU')}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Информация */}
                  <div>
                    <button className="flex items-center gap-2 text-sm font-semibold mb-3 w-full">
                      <Icon name="ChevronDown" size={16} />
                      Информация
                    </button>
                    <div className="space-y-3 pl-6">
                      {ticket.category_name && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Категория:</p>
                          <p className="text-sm">{ticket.category_name}</p>
                        </div>
                      )}
                      {ticket.priority_name && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Приоритет:</p>
                          <Badge
                            variant="outline"
                            style={{ 
                              borderColor: ticket.priority_color,
                              color: ticket.priority_color
                            }}
                          >
                            {ticket.priority_name}
                          </Badge>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Создано:</p>
                        <p className="text-sm">{ticket.created_at ? new Date(ticket.created_at).toLocaleString('ru-RU') : '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Данные о контрагенте */}
                  <div>
                    <button className="flex items-center gap-2 text-sm font-semibold mb-3 w-full">
                      <Icon name="ChevronDown" size={16} />
                      Данные о контрагенте
                    </button>
                    <div className="space-y-3 pl-6">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Имя:</p>
                        <p className="text-sm">{ticket.creator_name || 'Не указано'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Email:</p>
                        <p className="text-sm">{ticket.creator_email || 'Не указано'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Дополнительные поля */}
                  {ticket.custom_fields && ticket.custom_fields.length > 0 && (
                    <div>
                      <button className="flex items-center gap-2 text-sm font-semibold mb-3 w-full">
                        <Icon name="ChevronDown" size={16} />
                        ИТ-активы
                      </button>
                      <div className="space-y-2 pl-6">
                        {ticket.custom_fields.map((field) => (
                          <div key={field.id}>
                            <p className="text-xs text-muted-foreground mb-1">{field.name}:</p>
                            <p className="text-sm">{field.value || '—'}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="ListTodo" size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Задач пока нет</p>
                </div>
              )}

              {activeTab === 'related' && (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Link" size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Связанных заявок нет</p>
                </div>
              )}

              {activeTab === 'sla' && (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Clock" size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">SLA метрики не настроены</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsModal;