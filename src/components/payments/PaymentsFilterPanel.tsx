import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { PaymentsFilterState } from '@/hooks/usePaymentsFilter';

const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик',
  pending_ib: 'На согласовании (ИБ)',
  pending_cfo: 'На согласовании (CFO)',
  pending_ceo: 'На согласовании (CEO)',
  approved: 'Одобрен',
  rejected: 'Отклонён',
  revoked: 'Отозван',
};

interface Props {
  filters: PaymentsFilterState;
  setFilter: <K extends keyof PaymentsFilterState>(key: K, value: PaymentsFilterState[K]) => void;
  clearFilters: () => void;
  activeCount: number;
  filteredCount: number;
  totalCount: number;
  options: {
    categories: string[];
    services: string[];
    contractors: string[];
    legalEntities: string[];
    departments: string[];
    statuses: string[];
  };
}

const SelectFilter = ({
  label, value, options, onChange, statusLabels,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  statusLabels?: Record<string, string>;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-muted-foreground font-medium">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-9 rounded-md border border-white/10 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
    >
      <option value="">Все</option>
      {options.map(o => (
        <option key={o} value={o}>{statusLabels?.[o] ?? o}</option>
      ))}
    </select>
  </div>
);

const RangeFilter = ({
  label, fromValue, toValue, onFromChange, onToChange, type = 'text', placeholderFrom, placeholderTo,
}: {
  label: string;
  fromValue: string;
  toValue: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  type?: string;
  placeholderFrom?: string;
  placeholderTo?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs text-muted-foreground font-medium">{label}</label>
    <div className="flex gap-2">
      <Input
        type={type}
        value={fromValue}
        onChange={e => onFromChange(e.target.value)}
        placeholder={placeholderFrom || 'От'}
        className="h-9 bg-background border-white/10 text-sm"
      />
      <Input
        type={type}
        value={toValue}
        onChange={e => onToChange(e.target.value)}
        placeholder={placeholderTo || 'До'}
        className="h-9 bg-background border-white/10 text-sm"
      />
    </div>
  </div>
);

const PaymentsFilterPanel = ({ filters, setFilter, clearFilters, activeCount, filteredCount, totalCount, options }: Props) => (
  <div className="rounded-lg border border-white/10 bg-card p-4 space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon name="SlidersHorizontal" size={15} className="text-muted-foreground" />
        Фильтры
        {activeCount > 0 && (
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
            {activeCount}
          </span>
        )}
      </div>
      {activeCount > 0 && (
        <button
          onClick={clearFilters}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Icon name="X" size={12} />
          Сбросить
        </button>
      )}
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      <SelectFilter
        label="Категория"
        value={filters.category}
        options={options.categories}
        onChange={v => setFilter('category', v)}
      />
      <SelectFilter
        label="Сервис"
        value={filters.service}
        options={options.services}
        onChange={v => setFilter('service', v)}
      />
      <SelectFilter
        label="Контрагент"
        value={filters.contractor}
        options={options.contractors}
        onChange={v => setFilter('contractor', v)}
      />
      <SelectFilter
        label="Юр. лицо"
        value={filters.legalEntity}
        options={options.legalEntities}
        onChange={v => setFilter('legalEntity', v)}
      />
      <SelectFilter
        label="Отдел-заказчик"
        value={filters.department}
        options={options.departments}
        onChange={v => setFilter('department', v)}
      />
      {options.statuses.length > 1 && (
        <SelectFilter
          label="Статус"
          value={filters.status}
          options={options.statuses}
          onChange={v => setFilter('status', v)}
          statusLabels={STATUS_LABELS}
        />
      )}
      <RangeFilter
        label="Сумма"
        fromValue={filters.amountFrom}
        toValue={filters.amountTo}
        onFromChange={v => setFilter('amountFrom', v)}
        onToChange={v => setFilter('amountTo', v)}
        type="number"
        placeholderFrom="От ₽"
        placeholderTo="До ₽"
      />
      <RangeFilter
        label="Дата платежа"
        fromValue={filters.dateFrom}
        toValue={filters.dateTo}
        onFromChange={v => setFilter('dateFrom', v)}
        onToChange={v => setFilter('dateTo', v)}
        type="date"
      />
    </div>

    {activeCount > 0 && (
      <div className="text-xs text-muted-foreground">
        Показано {filteredCount} из {totalCount}
      </div>
    )}
  </div>
);

export default PaymentsFilterPanel;
