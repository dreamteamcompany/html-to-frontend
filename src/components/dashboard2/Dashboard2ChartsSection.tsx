import MonthlyDynamicsChart from './blocks/MonthlyDynamicsChart';
import CategoryExpensesChart from './blocks/CategoryExpensesChart';
import ContractorComparisonChart from './blocks/ContractorComparisonChart';
import ExpenseStructureChart from './blocks/ExpenseStructureChart';
import LegalEntityComparisonChart from './blocks/LegalEntityComparisonChart';
import DepartmentComparisonChart from './blocks/DepartmentComparisonChart';

const Dashboard2ChartsSection = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <MonthlyDynamicsChart />
      <CategoryExpensesChart />
      <ContractorComparisonChart />
      <ExpenseStructureChart />
      <LegalEntityComparisonChart />
      <DepartmentComparisonChart />
    </div>
  );
};

export default Dashboard2ChartsSection;