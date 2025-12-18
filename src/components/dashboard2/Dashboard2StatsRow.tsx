import TopPaymentsCard from './blocks/TopPaymentsCard';
import LiveMetricsCard from './blocks/LiveMetricsCard';
import CriticalAlertsCard from './blocks/CriticalAlertsCard';

const Dashboard2StatsRow = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '30px' }}>
      <TopPaymentsCard />
      <LiveMetricsCard />
      <CriticalAlertsCard />
    </div>
  );
};

export default Dashboard2StatsRow;
