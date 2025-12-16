import Dashboard2StatsRow from './Dashboard2StatsRow';
import Dashboard2KPIRow from './Dashboard2KPIRow';
import Dashboard2PaymentCalendar from './Dashboard2PaymentCalendar';
import Dashboard2UpcomingPayments from './Dashboard2UpcomingPayments';
import Dashboard2ExpenseGrowth from './Dashboard2ExpenseGrowth';

const Dashboard2NeonCards = () => {
  return (
    <>
      <Dashboard2StatsRow />
      <Dashboard2KPIRow />
      <Dashboard2PaymentCalendar />
      <Dashboard2UpcomingPayments />
      <Dashboard2ExpenseGrowth />
    </>
  );
};

export default Dashboard2NeonCards;