import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

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
  due_date?: string;
  created_at?: string;
  custom_fields?: CustomField[];
}

interface TicketsListProps {
  tickets: Ticket[];
  loading: boolean;
  onTicketClick: (ticket: Ticket) => void;
}

const TicketsList = ({ tickets, loading, onTicketClick }: TicketsListProps) => {
  const getDeadlineProgress = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const now = new Date().getTime();
    const due = new Date(dueDate).getTime();
    const timeLeft = due - now;
    
    if (timeLeft < 0) {
      return { percent: 0, color: 'bg-red-500', label: 'Просрочена' };
    }
    
    const oneDay = 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil(timeLeft / oneDay);
    
    if (daysLeft <= 1) {
      return { percent: 100, color: 'bg-red-500', label: `${daysLeft} день` };
    } else if (daysLeft <= 3) {
      return { percent: 66, color: 'bg-orange-500', label: `${daysLeft} дня` };
    } else if (daysLeft <= 7) {
      return { percent: 33, color: 'bg-yellow-500', label: `${daysLeft} дней` };
    } else {
      return { percent: 15, color: 'bg-green-500', label: `${daysLeft} дней` };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Загрузка заявок...</p>
        </div>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Icon name="Ticket" size={32} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Нет заявок</h3>
            <p className="text-muted-foreground">
              Создайте первую заявку, нажав кнопку выше
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const sortedTickets = [...tickets].sort((a, b) => {
    const aIsCritical = a.priority_name?.toLowerCase().includes('критич') || a.priority_name?.toLowerCase().includes('высок');
    const bIsCritical = b.priority_name?.toLowerCase().includes('критич') || b.priority_name?.toLowerCase().includes('высок');
    
    if (aIsCritical && !bIsCritical) return -1;
    if (!aIsCritical && bIsCritical) return 1;
    
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
  });

  return (
    <div className="grid gap-4">
      {sortedTickets.map((ticket) => {
        const isCritical = ticket.priority_name?.toLowerCase().includes('критич') || ticket.priority_name?.toLowerCase().includes('высок');
        
        return (
        <Card
          key={ticket.id}
          className={`
            p-5 hover:shadow-lg transition-all cursor-pointer hover:border-primary/50
            ${isCritical ? 'border-2 border-red-500 bg-red-50/50 dark:bg-red-950/20' : ''}
          `}
          onClick={() => onTicketClick(ticket)}
        >
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {(ticket.status_name === 'На согласовании' || ticket.status_name === 'Одобрена' || ticket.status_name === 'Отклонена') && (
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      ticket.status_name === 'На согласовании' ? 'bg-green-500' :
                      ticket.status_name === 'Отклонена' ? 'bg-red-500' :
                      'bg-blue-500'
                    } animate-pulse`} />
                  )}
                  {ticket.category_icon && (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon name={ticket.category_icon} size={20} className="text-primary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isCritical && (
                      <Badge variant="destructive" className="text-xs font-bold uppercase flex items-center gap-1">
                        <Icon name="AlertTriangle" size={12} />
                        Критично
                      </Badge>
                    )}
                    <h3 className="font-semibold text-lg line-clamp-1">
                      {ticket.status_name === 'На согласовании' && '🔔 '}
                      {ticket.status_name === 'Отклонена' && '❌ '}
                      {ticket.status_name === 'Одобрена' && '✅ '}
                      {ticket.title}
                    </h3>
                  </div>
                  {ticket.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {ticket.description}
                    </p>
                  )}
                </div>
              </div>
              
              {ticket.status_name && (
                <Badge
                  variant="secondary"
                  className="flex-shrink-0"
                  style={{ 
                    backgroundColor: `${ticket.status_color}20`,
                    color: ticket.status_color,
                    borderColor: ticket.status_color
                  }}
                >
                  {ticket.status_name}
                </Badge>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {ticket.category_name && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon name="Tag" size={14} />
                    <span>{ticket.category_name}</span>
                  </div>
                )}

                {ticket.priority_name && (
                  <Badge
                    variant="outline"
                    className="flex items-center gap-1.5"
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
                )}

                {ticket.department_name && (
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Icon name="Building" size={14} />
                    <span>{ticket.department_name}</span>
                  </div>
                )}

                {ticket.created_at && (
                  <div className="flex items-center gap-1.5 text-muted-foreground ml-auto">
                    <Icon name="Clock" size={14} />
                    <span>
                      {new Date(ticket.created_at).toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {ticket.due_date && (() => {
                const deadline = getDeadlineProgress(ticket.due_date);
                if (!deadline) return null;
                
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Icon name="Calendar" size={12} />
                        До {new Date(ticket.due_date).toLocaleDateString('ru-RU', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="font-medium" style={{ color: deadline.color.replace('bg-', '').replace('-500', '') === 'red' ? '#ef4444' : deadline.color.replace('bg-', '').replace('-500', '') === 'orange' ? '#f97316' : deadline.color.replace('bg-', '').replace('-500', '') === 'yellow' ? '#eab308' : '#22c55e' }}>
                        {deadline.label}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${deadline.color} transition-all duration-300`}
                        style={{ width: `${deadline.percent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </Card>
        );
      })}
    </div>
  );
};

export default TicketsList;