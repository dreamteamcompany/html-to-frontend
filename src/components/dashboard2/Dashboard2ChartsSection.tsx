import MonthlyDynamicsChart from './blocks/MonthlyDynamicsChart';
import CategoryExpensesChart from './blocks/CategoryExpensesChart';
import ContractorComparisonChart from './blocks/ContractorComparisonChart';
import ExpenseStructureChart from './blocks/ExpenseStructureChart';
import LegalEntityComparisonChart from './blocks/LegalEntityComparisonChart';
import DepartmentComparisonChart from './blocks/DepartmentComparisonChart';

const Dashboard2ChartsSection = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '30px' }}>
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
