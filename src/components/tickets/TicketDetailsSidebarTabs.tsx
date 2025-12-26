import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

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

interface TicketDetailsSidebarTabsProps {
  ticket: Ticket;
}

const TicketDetailsSidebarTabs = ({ ticket }: TicketDetailsSidebarTabsProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'tasks' | 'related' | 'sla'>('info');

  return (
    <div className="w-[500px] border-l bg-muted/10">
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
      <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 73px - 53px)' }}>
        {activeTab === 'info' && (
          <div className="space-y-8">
            {/* Статус */}
            <div className="pb-6 border-b">
              <button className="flex items-center gap-2 text-sm font-semibold mb-4 w-full">
                <Icon name="ChevronDown" size={16} />
                Статус
              </button>
              <div className="space-y-4 pl-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Ответственный:</p>
                  <p className="text-sm font-medium">{ticket.assignee_name || 'Не назначен'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Статус:</p>
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
                    <p className="text-xs text-muted-foreground mb-2">Решить до:</p>
                    <p className="text-sm font-medium">{new Date(ticket.due_date).toLocaleString('ru-RU')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Информация */}
            <div className="pb-6 border-b">
              <button className="flex items-center gap-2 text-sm font-semibold mb-4 w-full">
                <Icon name="ChevronDown" size={16} />
                Информация
              </button>
              <div className="space-y-4 pl-6">
                {ticket.category_name && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Категория:</p>
                    <p className="text-sm font-medium">{ticket.category_name}</p>
                  </div>
                )}
                {ticket.priority_name && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Приоритет:</p>
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
                  <p className="text-xs text-muted-foreground mb-2">Создано:</p>
                  <p className="text-sm font-medium">{ticket.created_at ? new Date(ticket.created_at).toLocaleString('ru-RU') : '—'}</p>
                </div>
              </div>
            </div>

            {/* Данные о контрагенте */}
            <div className="pb-6 border-b">
              <button className="flex items-center gap-2 text-sm font-semibold mb-4 w-full">
                <Icon name="ChevronDown" size={16} />
                Данные о контрагенте
              </button>
              <div className="space-y-4 pl-6">
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Имя:</p>
                  <p className="text-sm font-medium">{ticket.creator_name || 'Не указано'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Email:</p>
                  <p className="text-sm font-medium">{ticket.creator_email || 'Не указано'}</p>
                </div>
              </div>
            </div>

            {/* Дополнительные поля */}
            {ticket.custom_fields && ticket.custom_fields.length > 0 && (
              <div>
                <button className="flex items-center gap-2 text-sm font-semibold mb-4 w-full">
                  <Icon name="ChevronDown" size={16} />
                  ИТ-активы
                </button>
                <div className="space-y-4 pl-6">
                  {ticket.custom_fields.map((field) => (
                    <div key={field.id}>
                      <p className="text-xs text-muted-foreground mb-2">{field.name}:</p>
                      <p className="text-sm font-medium">{field.value || '—'}</p>
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
  );
};

export default TicketDetailsSidebarTabs;