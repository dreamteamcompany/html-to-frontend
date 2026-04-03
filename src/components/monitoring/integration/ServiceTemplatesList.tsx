import Icon from '@/components/ui/icon';
import { SERVICE_TEMPLATES } from './serviceTemplates';

interface ServiceTemplatesListProps {
  onSelect: (serviceId: string) => void;
}

const ServiceTemplatesList = ({ onSelect }: ServiceTemplatesListProps) => {
  return (
    <div className="grid gap-3 py-4">
      {SERVICE_TEMPLATES.map((service) => (
        <button
          key={service.id}
          onClick={() => onSelect(service.id)}
          className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted hover:bg-accent transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Icon name={service.icon as any} size={20} className="text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="text-foreground font-medium">{service.name}</div>
            <div className="text-sm text-muted-foreground">
              {service.fields.length} {service.fields.length === 1 ? 'параметр' : 'параметра'}
            </div>
          </div>
          <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
        </button>
      ))}
    </div>
  );
};

export default ServiceTemplatesList;