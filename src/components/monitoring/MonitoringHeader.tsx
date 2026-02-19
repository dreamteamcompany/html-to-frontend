import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface MonitoringHeaderProps {
  onAddClick: () => void;
  onRefreshAll: () => void;
  loading: boolean;
  servicesCount: number;
}

const MonitoringHeader = ({ onAddClick, onRefreshAll, loading, servicesCount }: MonitoringHeaderProps) => {
  return (
    <div className="flex justify-between items-center gap-3 sm:gap-4">
      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Балансы сервисов</h2>
      <div className="flex gap-2 sm:gap-3 shrink-0">
        <Button 
          variant="default" 
          size="sm" 
          className="whitespace-nowrap lg:px-5 lg:py-2.5 lg:text-base"
          onClick={onAddClick}
        >
          <Icon name="Plus" className="h-4 w-4 md:mr-2 lg:h-5 lg:w-5" />
          <span className="hidden md:inline">Добавить интеграцию</span>
        </Button>
        <Button 
          onClick={onRefreshAll} 
          variant="outline" 
          size="sm" 
          disabled={loading || servicesCount === 0} 
          className="whitespace-nowrap lg:px-5 lg:py-2.5 lg:text-base"
        >
          <Icon name="RefreshCw" className={`h-4 w-4 md:mr-2 lg:h-5 lg:w-5 ${loading ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">Обновить все</span>
        </Button>
      </div>
    </div>
  );
};

export default MonitoringHeader;