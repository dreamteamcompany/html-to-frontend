import { useState, useEffect } from 'react';
import TotalExpensesCard from './blocks/TotalExpensesCard';
import IndexationCard from './blocks/IndexationCard';
import AttentionRequiredCard from './blocks/AttentionRequiredCard';
import AnnualSavingsStatCard from './blocks/AnnualSavingsStatCard';
import MonthlyDynamicsChart from './blocks/MonthlyDynamicsChart';
import CategoryExpensesChart from './blocks/CategoryExpensesChart';
import ContractorComparisonChart from './blocks/ContractorComparisonChart';
import ExpenseStructureChart from './blocks/ExpenseStructureChart';
import LegalEntityComparisonChart from './blocks/LegalEntityComparisonChart';
import DepartmentComparisonChart from './blocks/DepartmentComparisonChart';

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
    { id: 'attention-required', title: 'Требуют внимания', type: 'stat' },
    { id: 'annual-savings', title: 'Годовая Экономия', type: 'stat' },
    { id: 'monthly-dynamics', title: 'Динамика Расходов по Месяцам', type: 'chart' },
    { id: 'category-expenses', title: 'IT Расходы по Категориям', type: 'chart' },
    { id: 'contractor-comparison', title: 'Сравнение по Контрагентам', type: 'chart' },
    { id: 'expense-structure', title: 'Структура Расходов', type: 'chart' },
    { id: 'legal-entity-comparison', title: 'Сравнение по Юридическим Лицам', type: 'chart' },
    { id: 'department-comparison', title: 'Сравнение Затрат по Отделам-Заказчикам', type: 'chart' },
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
      case 'attention-required':
        return <AttentionRequiredCard />;
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
      case 'legal-entity-comparison':
        return <LegalEntityComparisonChart />;
      case 'department-comparison':
        return <DepartmentComparisonChart />;
      default:
        return null;
    }
  };

  if (cardOrder.length === 0) return null;

  const statCards = cardOrder.filter(card => card.type === 'stat');
  const chartCards = cardOrder.filter(card => card.type === 'chart');

  return (
    <div style={{ marginBottom: '30px' }}>
      {/* Stat Cards Row */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'nowrap' }}>
        {statCards.map((card) => {
          const isAttention = card.id === 'attention-required';
          return (
            <div 
              key={card.id} 
              style={{ 
                width: isAttention ? '400px' : '360px', 
                height: '300px',
                flexShrink: 0
              }}
            >
              {renderCard(card)}
            </div>
          );
        })}
      </div>

      {/* Chart Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 580px)', gap: '24px' }}>
        {chartCards.map((card) => (
          <div 
            key={card.id} 
            style={{ 
              width: '580px', 
              height: '400px'
            }}
          >
            {renderCard(card)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard2AllCards;
