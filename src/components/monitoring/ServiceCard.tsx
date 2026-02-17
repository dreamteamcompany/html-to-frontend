import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface ServiceBalance {
  id: number;
  service_name: string;
  balance: number;
  currency: string;
  status: 'ok' | 'warning' | 'critical';
  last_updated: string;
  api_endpoint?: string;
  threshold_warning?: number;
  threshold_critical?: number;
  description?: string;
}

interface ServiceCardProps {
  service: ServiceBalance;
  onRefresh: (id: number) => void;
  onEdit: (service: ServiceBalance) => void;
  onDelete: (id: number, name: string) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

const ServiceCard = ({ 
  service, 
  onRefresh, 
  onEdit, 
  onDelete, 
  getStatusColor, 
  getStatusIcon 
}: ServiceCardProps) => {
  return (
    <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${getStatusColor(service.status)}`}>
            <Icon name={getStatusIcon(service.status)} className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{service.service_name}</h3>
            <p className="text-sm text-white/50">
              Обновлено: {new Date(service.last_updated).toLocaleString('ru-RU')}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onRefresh(service.id)}
            className="text-white/60 hover:text-white"
          >
            <Icon name="RefreshCw" className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onEdit(service)}
            className="text-white/60 hover:text-white"
          >
            <Icon name="Settings" className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onDelete(service.id, service.service_name)}
            className="text-white/60 hover:text-red-500"
          >
            <Icon name="Trash2" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {service.description && (
          <p className="text-sm text-white/60">{service.description}</p>
        )}
        
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {service.balance.toLocaleString('ru-RU')}
          </span>
          <span className="text-white/60">{service.currency}</span>
        </div>

        {service.threshold_warning && service.threshold_critical && (
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1 text-yellow-500">
              <Icon name="AlertTriangle" className="h-3 w-3" />
              <span>&lt; {service.threshold_warning}</span>
            </div>
            <div className="flex items-center gap-1 text-red-500">
              <Icon name="XCircle" className="h-3 w-3" />
              <span>&lt; {service.threshold_critical}</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ServiceCard;