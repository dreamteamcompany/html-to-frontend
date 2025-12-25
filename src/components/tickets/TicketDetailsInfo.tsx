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

interface TicketDetailsInfoProps {
  ticket: Ticket;
}

const TicketDetailsInfo = ({ ticket }: TicketDetailsInfoProps) => {
  return (
    <div className="space-y-6">
      {ticket.description && (
        <div>
          <h3 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-2">
            <Icon name="FileText" size={16} />
            Описание
          </h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ticket.category_name && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Категория</p>
            <div className="flex items-center gap-2">
              {ticket.category_icon && (
                <Icon name={ticket.category_icon} size={16} className="text-primary" />
              )}
              <p className="text-sm font-medium">{ticket.category_name}</p>
            </div>
          </div>
        )}

        {ticket.priority_name && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Приоритет</p>
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
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Департамент</p>
            <p className="text-sm font-medium">{ticket.department_name}</p>
          </div>
        )}

        {ticket.created_at && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-1">Создана</p>
            <p className="text-sm font-medium">
              {new Date(ticket.created_at).toLocaleDateString('ru-RU')}
            </p>
          </div>
        )}
      </div>

      {ticket.custom_fields && ticket.custom_fields.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground flex items-center gap-2">
            <Icon name="Settings" size={16} />
            Дополнительные поля
          </h3>
          <div className="space-y-3">
            {ticket.custom_fields.map((field) => (
              <div key={field.id} className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">{field.name}</p>
                <p className="text-sm">{field.value || '—'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketDetailsInfo;
