import AverageSpeedCard from './blocks/AverageSpeedCard';
import ActiveTeamCard from './blocks/ActiveTeamCard';

const Dashboard2KPIRow = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <AverageSpeedCard />
      <ActiveTeamCard />
    </div>
  );
};

export default Dashboard2KPIRow;