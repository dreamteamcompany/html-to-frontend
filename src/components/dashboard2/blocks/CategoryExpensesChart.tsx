import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect, useMemo } from 'react';
import { usePeriod } from '@/contexts/PeriodContext';
import { usePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { useDrillDown } from '../useDrillDown';
import DrillDownModal from '../DrillDownModal';
import { useResponsiveState, useCategoryData, useTimelineData } from './categoryExpenses/hooks';
import CategoryChartHeader from './categoryExpenses/CategoryChartHeader';
import CategoryChartCanvas from './categoryExpenses/CategoryChartCanvas';

const CategoryExpensesChart = () => {
  const { period, getDateRange, dateFrom, dateTo } = usePeriod();
  const { payments: allPayments, loading } = usePaymentsCache();
  const { drillFilter, openDrill, closeDrill } = useDrillDown();
  const [showAll, setShowAll] = useState(false);
  const { isMobile, isLight } = useResponsiveState();

  useEffect(() => {
    setShowAll(false);
  }, [period, dateFrom, dateTo]);

  const categoryData = useCategoryData(allPayments, getDateRange, period, dateFrom, dateTo);

  const total = useMemo(
    () => categoryData.reduce((s, c) => s + c.amount, 0),
    [categoryData]
  );

  const displayData = useMemo(
    () => (showAll ? categoryData : categoryData.slice(0, 5)),
    [categoryData, showAll]
  );

  const chartKey = useMemo(
    () => `cat-${period}-${dateFrom}-${dateTo}-${showAll}-${displayData.length}`,
    [period, dateFrom, dateTo, showAll, displayData.length]
  );

  const timelineData = useTimelineData(allPayments, getDateRange, period, dateFrom, dateTo);

  return (
    <>
    <Card className="h-full flex flex-col" style={{
      background: 'hsl(var(--card))',
      border: '1px solid rgba(117,81,233,0.22)',
      borderTop: '4px solid #7551e9',
      boxShadow: isLight ? '0 4px 24px rgba(117,81,233,0.07)' : '0 4px 28px rgba(117,81,233,0.13)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '220px', height: '220px',
        background: 'radial-gradient(circle at top right, rgba(117,81,233,0.07) 0%, transparent 68%)',
        pointerEvents: 'none',
      }} />

      <CardContent className="p-4 sm:p-6 flex flex-col flex-1" style={{ position: 'relative', zIndex: 1 }}>
        <CategoryChartHeader
          loading={loading}
          total={total}
          categoryData={categoryData}
          showAll={showAll}
          setShowAll={setShowAll}
          isLight={isLight}
          openDrillAll={() => openDrill({ type: 'all', value: 'all', label: 'Все расходы' })}
        />

        <CategoryChartCanvas
          loading={loading}
          displayData={displayData}
          chartKey={chartKey}
          isMobile={isMobile}
          isLight={isLight}
          timelineData={timelineData}
          openDrillCategory={(name) => openDrill({ type: 'category', value: name, label: name })}
        />
      </CardContent>
    </Card>
    <DrillDownModal filter={drillFilter} onClose={closeDrill} />
    </>
  );
};

export default CategoryExpensesChart;
