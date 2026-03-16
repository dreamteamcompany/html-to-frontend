import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { dashboardTypography } from '../dashboardStyles';
import { usePeriod } from '@/contexts/PeriodContext';
import { useDrillDown } from '../useDrillDown';
import DrillDownModal from '../DrillDownModal';

interface TopDepartment {
  department_name: string;
  total_saved: number;
}

interface SavingsData {
  total_amount: number;
  count: number;
  top_departments: TopDepartment[];
}

const AnnualSavingsStatCard = () => {
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [loadError, setLoadError] = useState(false);
  const { token } = useAuth();
  const { period, getDateRange, dateFrom, dateTo } = usePeriod();
  const { drillFilter, openDrill, closeDrill } = useDrillDown();

  const loadSavingsData = useCallback(async () => {
    if (!token) return;
    setLoadError(false);
    try {
      const { from, to } = getDateRange();
      const params = new URLSearchParams({
        startDate: from.toISOString(),
        endDate: to.toISOString(),
      });
      const res = await fetch(
        `${API_ENDPOINTS.main}?endpoint=savings-dashboard&${params}`,
        { headers: { 'X-Auth-Token': token } }
      );
      if (res.ok) {
        setSavingsData(await res.json());
      } else {
        setLoadError(true);
      }
    } catch {
      setLoadError(true);
    }
  }, [token, period, dateFrom, dateTo]);

  useEffect(() => {
    loadSavingsData();
  }, [loadSavingsData]);

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(amount).replace(/,/g, '.') + ' RUB';

  const countLabel = (n: number) =>
    n === 1 ? 'запись' : n < 5 ? 'записи' : 'записей';

  return (
    <>
    <Card
      className="h-full"
      style={{ background: 'hsl(var(--card))', border: '1px solid rgba(1, 181, 116, 0.4)', borderTop: '4px solid #01b574', position: 'relative', overflow: 'hidden', cursor: !savingsData ? 'default' : 'pointer' }}
      onClick={() => savingsData && openDrill({ type: 'all', value: '', label: 'Экономия' })}
    >
      <CardContent className="p-4 sm:p-6 h-full flex flex-col justify-between" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex justify-between items-start mb-4 sm:mb-5">
          <div>
            <div className={`${dashboardTypography.cardTitle} mb-2`}>Экономия</div>
            <div className={dashboardTypography.cardSubtitle}>Сумма экономии за период</div>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(1, 181, 116, 0.1)', color: '#01b574', border: '1px solid rgba(1, 181, 116, 0.2)' }}>
            <Icon name="PiggyBank" size={18} className="sm:w-5 sm:h-5" />
          </div>
        </div>

        {loadError && (
          <div className="text-xs text-red-400 mb-2">Не удалось загрузить данные</div>
        )}
        <div className={`${dashboardTypography.cardValue} mb-2`} style={{ color: '#01b574' }}>
          {savingsData ? formatAmount(savingsData.total_amount) : '—'}
        </div>
        <div className={`${dashboardTypography.cardSecondary} mb-3`}>
          {savingsData
            ? `${savingsData.count} ${countLabel(savingsData.count)} в реестре`
            : loadError ? 'Ошибка загрузки' : 'Загрузка...'}
        </div>

        {savingsData && savingsData.top_departments && savingsData.top_departments.length > 0 && (
          <div className="border-t border-border pt-3 mt-3">
            <div className={`${dashboardTypography.cardBadge} mb-2 text-muted-foreground`}>
              Топ отделов-заказчиков:
            </div>
            <div className="flex flex-col gap-1.5">
              {savingsData.top_departments.slice(0, 3).map((dept, index) => (
                <div
                  key={dept.department_name}
                  className={`flex justify-between items-center ${dashboardTypography.cardSmall}`}
                >
                  <div className="flex items-center gap-1.5 text-foreground min-w-0 flex-1">
                    <span
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded flex items-center justify-center ${dashboardTypography.cardTiny} font-bold flex-shrink-0`}
                      style={{
                        background: index === 0 ? 'rgba(1, 181, 116, 0.2)' : 'hsl(var(--muted))',
                        color: index === 0 ? '#01b574' : 'hsl(var(--muted-foreground))'
                      }}
                    >
                      {index + 1}
                    </span>
                    <span className="font-medium truncate">{dept.department_name}</span>
                  </div>
                  <span className="font-semibold ml-2 flex-shrink-0" style={{ color: '#01b574' }}>
                    {formatAmount(dept.total_saved)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    <DrillDownModal filter={drillFilter} onClose={closeDrill} />
    </>
  );
};

export default AnnualSavingsStatCard;