import Dashboard2StatsRow from './Dashboard2StatsRow';
import Dashboard2KPIRow from './Dashboard2KPIRow';
import Dashboard2PaymentCalendar from './Dashboard2PaymentCalendar';
import Dashboard2UpcomingPayments from './Dashboard2UpcomingPayments';

const Dashboard2NeonCards = () => {
  return (
    <>
      <Dashboard2StatsRow />
      <Dashboard2KPIRow />
      <Dashboard2PaymentCalendar />
      <Dashboard2UpcomingPayments />
    </>
  );
};

export default Dashboard2NeonCards;
