import { useState, useEffect } from 'react';
import TotalExpensesCard from './blocks/TotalExpensesCard';
import IndexationCard from './blocks/IndexationCard';
import AnnualSavingsStatCard from './blocks/AnnualSavingsStatCard';
import MonthlyDynamicsChart from './blocks/MonthlyDynamicsChart';
import CategoryExpensesChart from './blocks/CategoryExpensesChart';
import ContractorComparisonChart from './blocks/ContractorComparisonChart';
import ExpenseStructureChart from './blocks/ExpenseStructureChart';
import LegalEntityComparisonChart from './blocks/LegalEntityComparisonChart';
import Dashboard2TeamPerformance from './Dashboard2TeamPerformance';

interface DashboardCard {
  id: string;
  title: string;
  type: 'stat' | 'chart';
}

const Dashboard2AllCards = () => {
  const [cardOrder, setCardOrder] = useState<DashboardCard[]>([]);

  const defaultCards: DashboardCard[] = [
    { id: 'total-expenses', title: 'Общие IT Расходы', type: 'stat' },
    { id: 'total-payments', title: 'Индексация', type: 'stat' },
    { id: 'annual-savings', title: 'Экономия', type: 'stat' },
    { id: 'monthly-dynamics', title: 'Динамика Расходов по Месяцам', type: 'chart' },
    { id: 'category-expenses', title: 'IT Расходы по Категориям', type: 'chart' },
    { id: 'contractor-comparison', title: 'Сравнение по Контрагентам', type: 'chart' },
    { id: 'expense-structure', title: 'Структура Расходов', type: 'chart' },
    { id: 'department-comparison', title: 'Сравнение по Отделам-Заказчикам', type: 'chart' },
    { id: 'legal-entity-comparison', title: 'Сравнение по Юридическим Лицам', type: 'chart' },
  ];

  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboard2-layout');
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setCardOrder(parsed);
      } catch (e) {
        console.error('Failed to parse saved layout:', e);
        setCardOrder(defaultCards);
      }
    } else {
      setCardOrder(defaultCards);
    }
  }, []);

  const renderCard = (card: DashboardCard) => {
    switch (card.id) {
      case 'total-expenses':
        return <TotalExpensesCard />;
      case 'total-payments':
        return <IndexationCard />;
      case 'annual-savings':
        return <AnnualSavingsStatCard />;
      case 'monthly-dynamics':
        return <MonthlyDynamicsChart />;
      case 'category-expenses':
        return <CategoryExpensesChart />;
      case 'contractor-comparison':
        return <ContractorComparisonChart />;
      case 'expense-structure':
        return <ExpenseStructureChart />;
      case 'department-comparison':
        return <Dashboard2TeamPerformance />;
      case 'legal-entity-comparison':
        return <LegalEntityComparisonChart />;
      default:
        return null;
    }
  };

  if (cardOrder.length === 0) return null;

  const statCards = cardOrder.filter(card => card.type === 'stat');
  const chartCards = cardOrder.filter(card => card.type === 'chart');

  const contractorCard = chartCards.find(c => c.id === 'contractor-comparison');
  const expenseStructureCard = chartCards.find(c => c.id === 'expense-structure');
  const legalEntityCard = chartCards.find(c => c.id === 'legal-entity-comparison');
  const departmentCard = chartCards.find(c => c.id === 'department-comparison');
  
  const otherCharts = chartCards.filter(c => 
    c.id !== 'contractor-comparison' && 
    c.id !== 'expense-structure' && 
    c.id !== 'legal-entity-comparison' && 
    c.id !== 'department-comparison'
  );

  return (
    <div className="mb-6 sm:mb-8 overflow-x-hidden max-w-full">
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 mb-4 sm:mb-6">
        {statCards.map((card) => {
          return (
            <div 
              key={card.id} 
              className="w-full"
            >
              {renderCard(card)}
            </div>
          );
        })}
      </div>

      {/* Other Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {otherCharts.map((card) => (
          <div 
            key={card.id} 
            className="min-w-0 max-w-full overflow-hidden"
          >
            {renderCard(card)}
          </div>
        ))}
      </div>

      {/* Contractor & Expense Structure Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {contractorCard && (
          <div className="min-w-0 max-w-full overflow-hidden">
            {renderCard(contractorCard)}
          </div>
        )}
        {expenseStructureCard && (
          <div className="min-w-0 max-w-full overflow-hidden">
            {renderCard(expenseStructureCard)}
          </div>
        )}
      </div>

      {/* Department & Legal Entity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {departmentCard && (
          <div className="min-w-0 max-w-full overflow-hidden">
            {renderCard(departmentCard)}
          </div>
        )}
        {legalEntityCard && (
          <div className="min-w-0 max-w-full overflow-hidden">
            {renderCard(legalEntityCard)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard2AllCards;