import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TicketComments from '@/components/tickets/TicketComments';

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
  category_id?: number;
  category_name?: string;
  category_icon?: string;
  priority_id?: number;
  priority_name?: string;
  priority_color?: string;
  status_id?: number;
  status_name?: string;
  status_color?: string;
  department_id?: number;
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

interface Status {
  id: number;
  name: string;
  color: string;
  order: number;
}

const TicketDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'related' | 'sla'>('info');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [sendingPing, setSendingPing] = useState(false);

  useEffect(() => {
    if (id) {
      loadTicket();
      loadStatuses();
      loadComments();
    }
  }, [id]);

  const loadTicket = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://poehali.ylab.io/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTicket(data);
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatuses = async () => {
    try {
      const response = await fetch('https://poehali.ylab.io/api/ticket-statuses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStatuses(data);
      }
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const response = await fetch(`https://poehali.ylab.io/api/tickets/${id}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      setSubmittingComment(true);
      const response = await fetch(`https://poehali.ylab.io/api/tickets/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment, is_internal: false }),
      });
      
      if (response.ok) {
        setNewComment('');
        loadComments();
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (statusId: number) => {
    try {
      setUpdating(true);
      const response = await fetch(`https://poehali.ylab.io/api/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status_id: statusId }),
      });
      
      if (response.ok) {
        loadTicket();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSendPing = async () => {
    try {
      setSendingPing(true);
      await fetch(`https://poehali.ylab.io/api/tickets/${id}/ping`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error('Error sending ping:', error);
    } finally {
      setSendingPing(false);
    }
  };

  const handleReaction = async (commentId: number, emoji: string) => {
    try {
      await fetch(`https://poehali.ylab.io/api/comments/${commentId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji }),
      });
      loadComments();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Icon name="FileQuestion" size={64} className="text-muted-foreground mb-4" />
        <p className="text-xl text-muted-foreground mb-4">Тикет не найден</p>
        <Button onClick={() => navigate('/tickets')}>Вернуться к списку</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Заголовок заявки */}
      <div className="border-b bg-muted/20 sticky top-0 z-10">
        <div className="container max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/tickets')}
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              Назад
            </Button>
            <h1 className="text-xl font-semibold">Запрос на обслуживание "{ticket.id}"</h1>
          </div>
        </div>
      </div>

      {/* Основное содержание */}
      <div className="container max-w-[1600px] mx-auto">
        <div className="flex">
          {/* Левая колонка - Суть заявки и комментарии */}
          <div className="flex-1 p-6">
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

          {/* Правая колонка - Информация с вкладками */}
          <div className="w-[400px] border-l bg-muted/10">
            {/* Вкладки */}
            <div className="border-b bg-background sticky top-[73px]">
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
            <div className="p-5 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 73px - 53px)' }}>
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
      </div>
    </div>
  );
};

export default TicketDetails;
