import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

interface MyPaymentsSearchBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onToggleFilters: () => void;
  activeFiltersCount: number;
}

const MyPaymentsSearchBar = ({
  searchValue,
  onSearchChange,
  onToggleFilters,
  activeFiltersCount,
}: MyPaymentsSearchBarProps) => (
  <div className="flex items-center gap-3">
    <div className="relative flex-1">
      <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60" />
      <Input
        placeholder="Поиск по описанию, категории, сумме..."
        value={searchValue}
        onChange={e => onSearchChange(e.target.value)}
        className="pl-10 bg-background border-border text-foreground placeholder:text-foreground/50"
      />
    </div>
    <button
      onClick={onToggleFilters}
      className="relative p-2 rounded-lg border border-border text-foreground hover:bg-foreground/5 transition-colors"
    >
      <Icon name="SlidersHorizontal" size={20} />
      {activeFiltersCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center">
          {activeFiltersCount}
        </span>
      )}
    </button>
  </div>
);

export default MyPaymentsSearchBar;