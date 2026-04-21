import { Card, CardContent } from '@/components/ui/card';
import { dashboardTypography } from '../dashboardStyles';
import { usePeriod } from '@/contexts/PeriodContext';
import { usePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { useDrillDown } from '../useDrillDown';
import DrillDownModal from '../DrillDownModal';
import { useResponsiveState, useDynamicsData } from './monthlyDynamics/hooks';
import DynamicsLineChart from './monthlyDynamics/DynamicsLineChart';

const MonthlyDynamicsChart = () => {
  const { period, getDateRange, dateFrom, dateTo } = usePeriod();
  const { payments: allPayments, loading } = usePaymentsCache();
  const { drillFilter, openDrill, closeDrill } = useDrillDown();
  const { isMobile, isLight } = useResponsiveState();

  const { chartData, labels, chartKeys } = useDynamicsData(
    allPayments,
    getDateRange,
    period,
    dateFrom,
    dateTo,
  );

  return (
    <>
      <Card className="h-full flex flex-col" style={{ background: 'hsl(var(--card))', border: '1px solid rgba(117, 81, 233, 0.4)', borderTop: '4px solid #7551e9', boxShadow: isLight ? '0 4px 24px rgba(117,81,233,0.07)' : '0 4px 28px rgba(117,81,233,0.13)' }}>
        <CardContent className="p-3 sm:p-6 flex flex-col flex-1">
          <div style={{ marginBottom: '12px' }} className="sm:mb-4">
            <h3 className={dashboardTypography.cardTitle}>Динамика расходов</h3>
          </div>
          <DynamicsLineChart
            loading={loading}
            chartData={chartData}
            labels={labels}
            chartKeys={chartKeys}
            isMobile={isMobile}
            isLight={isLight}
            openDrill={openDrill}
          />
        </CardContent>
      </Card>
      <DrillDownModal filter={drillFilter} onClose={closeDrill} />
    </>
  );
};

export default MonthlyDynamicsChart;
