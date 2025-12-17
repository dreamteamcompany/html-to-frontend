import Dashboard2StatsRow from './Dashboard2StatsRow';
import Dashboard2KPIRow from './Dashboard2KPIRow';
import Dashboard2PaymentCalendar from './Dashboard2PaymentCalendar';
import Dashboard2UpcomingPayments from './Dashboard2UpcomingPayments';
import Dashboard2ExpenseGrowth from './Dashboard2ExpenseGrowth';
import Dashboard2TeamPerformance from './Dashboard2TeamPerformance';
import Dashboard2ServicesDynamics from './Dashboard2ServicesDynamics';
import Dashboard2CostIndexing from './Dashboard2CostIndexing';

const Dashboard2NeonCards = () => {
  return (
    <>
      <Dashboard2StatsRow />
      <Dashboard2KPIRow />
      <Dashboard2PaymentCalendar />
      <Dashboard2UpcomingPayments />
      <Dashboard2ExpenseGrowth />
      <Dashboard2TeamPerformance />
      <Dashboard2ServicesDynamics />
      <Dashboard2CostIndexing />
    </>
  );
};

export default Dashboard2NeonCards;