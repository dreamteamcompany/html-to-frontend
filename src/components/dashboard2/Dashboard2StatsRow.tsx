import TopPaymentsCard from './blocks/TopPaymentsCard';
import LiveMetricsCard from './blocks/LiveMetricsCard';

const Dashboard2StatsRow = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <TopPaymentsCard />
      <LiveMetricsCard />
    </div>
  );
};

export default Dashboard2StatsRow;