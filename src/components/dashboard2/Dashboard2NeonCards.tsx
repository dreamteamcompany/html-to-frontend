import Dashboard2StatsRow from './Dashboard2StatsRow';
import Dashboard2KPIRow from './Dashboard2KPIRow';
import Dashboard2UpcomingPayments from './Dashboard2UpcomingPayments';
import Dashboard2ServicesDynamics from './Dashboard2ServicesDynamics';

const Dashboard2NeonCards = () => {
  return (
    <>
      <Dashboard2StatsRow />
      <Dashboard2KPIRow />
      <Dashboard2UpcomingPayments />
      <Dashboard2ServicesDynamics />
    </>
  );
};

export default Dashboard2NeonCards;