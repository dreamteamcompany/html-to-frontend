import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { PaymentCounters } from './usePaymentCounters';

interface PaymentsTabsBarProps {
  isCEO: boolean;
  counters: PaymentCounters;
}

const CounterBadge = ({ value }: { value: number }) => {
  if (value <= 0) return null;
  return (
    <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
      {value}
    </span>
  );
};

const PaymentsTabsBar = ({ isCEO, counters }: PaymentsTabsBarProps) => (
  <TabsList className="w-full justify-start border-b border-white/10 rounded-none bg-transparent p-0 h-auto mb-6 overflow-scroll">
    {!isCEO && (
      <TabsTrigger
        value="my"
        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
      >
        <Icon name="FileText" size={18} className="mr-2" />
        Мои платежи
        <CounterBadge value={counters.my} />
      </TabsTrigger>
    )}
    <TabsTrigger
      value="pending"
      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 relative"
    >
      <Icon name="Clock" size={18} className="mr-2" />
      На согласовании
      <CounterBadge value={counters.pending} />
    </TabsTrigger>
    <TabsTrigger
      value="approved"
      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
    >
      <Icon name="CheckCircle" size={18} className="mr-2" />
      Согласованные
      <CounterBadge value={counters.approved} />
    </TabsTrigger>
    <TabsTrigger
      value="rejected"
      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
    >
      <Icon name="XCircle" size={18} className="mr-2" />
      Отклонённые
      <CounterBadge value={counters.rejected} />
    </TabsTrigger>
  </TabsList>
);

export default PaymentsTabsBar;
