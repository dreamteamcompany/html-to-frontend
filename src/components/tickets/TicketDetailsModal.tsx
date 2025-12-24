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
  priority_name?: string;
  priority_color?: string;
  status_name?: string;
  status_color?: string;
  department_name?: string;
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
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ticket.priority_color }}
                  />
                  <span>{ticket.priority_name}</span>
                </div>
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
              <div>
                <h3 className="text-sm font-semibold mb-2 text-muted-foreground">Желаемый срок</h3>
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
