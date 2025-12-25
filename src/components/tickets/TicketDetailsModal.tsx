import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

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
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  closed_at?: string;
  custom_fields?: CustomField[];
}

interface TicketDetailsModalProps {
  ticket: Ticket | null;
  onClose: () => void;
}

const TicketDetailsModal = ({ ticket, onClose }: TicketDetailsModalProps) => {
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

          <div className="flex gap-3 pt-4">
            <Button onClick={onClose} className="flex-1">
              Закрыть
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailsModal;