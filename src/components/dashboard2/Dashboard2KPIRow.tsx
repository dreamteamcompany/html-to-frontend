import AnnualSavingsKPICard from './blocks/AnnualSavingsKPICard';
import AverageSpeedCard from './blocks/AverageSpeedCard';
import ActiveTeamCard from './blocks/ActiveTeamCard';

const Dashboard2KPIRow = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '30px' }}>
      <AnnualSavingsKPICard />
      <AverageSpeedCard />
      <ActiveTeamCard />
    </div>
  );
};

export default Dashboard2KPIRow;
