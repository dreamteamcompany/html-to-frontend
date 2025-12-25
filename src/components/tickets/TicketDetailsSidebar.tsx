import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
}

interface TicketDetailsSidebarProps {
  ticket: Ticket;
  statuses: Status[];
  users: User[];
  updating: boolean;
  onUpdateStatus: (statusId: string) => void;
  onAssignUser: (userId: string) => void;
}

const TicketDetailsSidebar = ({
  ticket,
  statuses,
  users,
  updating,
  onUpdateStatus,
  onAssignUser,
}: TicketDetailsSidebarProps) => {
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
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
          <Icon name="CheckCircle" size={16} />
          Статус
        </h3>
        <Select
          value={ticket.status_id?.toString()}
          onValueChange={onUpdateStatus}
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
              <p className="font-medium text-sm">{ticket.creator_name}</p>
              {ticket.creator_email && (
                <p className="text-xs text-muted-foreground">{ticket.creator_email}</p>
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
          onValueChange={onAssignUser}
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
                  <span className="text-sm">{u.name}</span>
                  <span className="text-xs text-muted-foreground">{u.email}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {ticket.due_date && deadlineInfo && (
        <div className="p-4 rounded-lg border" style={{ 
          backgroundColor: `${deadlineInfo.color}10`,
          borderColor: deadlineInfo.color
        }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ 
              backgroundColor: `${deadlineInfo.color}20`
            }}>
              <Icon name={deadlineInfo.urgent ? 'AlertCircle' : 'Clock'} size={20} style={{ color: deadlineInfo.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm mb-1" style={{ color: deadlineInfo.color }}>
                {deadlineInfo.label}
              </p>
              <p className="text-xs" style={{ color: deadlineInfo.color, opacity: 0.8 }}>
                {new Date(ticket.due_date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              {deadlineInfo.urgent && (
                <Badge 
                  className="mt-2"
                  variant="secondary"
                  style={{ 
                    backgroundColor: deadlineInfo.color,
                    color: 'white'
                  }}
                >
                  Срочно
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {ticket.category_name && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
            <Icon name="Tag" size={16} />
            Категория
          </h3>
          <div className="flex items-center gap-2">
            {ticket.category_icon && (
              <Icon name={ticket.category_icon} size={16} className="text-primary" />
            )}
            <p className="text-sm font-medium">{ticket.category_name}</p>
          </div>
        </div>
      )}

      {ticket.priority_name && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
            <Icon name="Flag" size={16} />
            Приоритет
          </h3>
          <Badge
            variant="secondary"
            style={{ 
              backgroundColor: `${ticket.priority_color}20`,
              color: ticket.priority_color,
              borderColor: ticket.priority_color
            }}
          >
            {ticket.priority_name}
          </Badge>
        </div>
      )}

      {ticket.department_name && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
            <Icon name="Building2" size={16} />
            Департамент
          </h3>
          <p className="text-sm">{ticket.department_name}</p>
        </div>
      )}

      {ticket.created_at && (
        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
            <Icon name="Calendar" size={16} />
            Создана
          </h3>
          <p className="text-sm">
            {new Date(ticket.created_at).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      )}
    </div>
  );
};

export default TicketDetailsSidebar;
