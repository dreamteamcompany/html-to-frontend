import { useState } from 'react';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import PaymentsHeader from '@/components/payments/PaymentsHeader';
import KPICard from '@/components/dashboard/KPICard';
import SystemStatusBlock from '@/components/dashboard/SystemStatusBlock';
import ActivityChart from '@/components/dashboard/ActivityChart';
import RecentEvents from '@/components/dashboard/RecentEvents';
import QuickActions from '@/components/dashboard/QuickActions';
import { LoadingState, EmptyState, ErrorState, PartialState } from '@/components/dashboard/DashboardStates';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const { data, retry } = useDashboardData();
  const navigate = useNavigate();

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      setMenuOpen(false);
    }
  };

  const renderContent = () => {
    switch (data.state) {
      case 'loading':
        return <LoadingState />;
      
      case 'empty':
        return <EmptyState onGetStarted={() => navigate('/payments')} />;
      
      case 'error':
        return <ErrorState message={data.errorMessage} onRetry={retry} />;
      
      case 'partial':
      case 'ready':
        return (
          <div className="space-y-6">
            {data.state === 'partial' && (
              <PartialState message="Некоторые данные временно недоступны. Показаны данные из кэша." />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.kpis.map((kpi) => (
                <KPICard
                  key={kpi.id}
                  data={kpi}
                  onClick={kpi.id === 'errors' ? () => navigate('/monitoring') : undefined}
                />
              ))}
            </div>

            <SystemStatusBlock status={data.systemStatus} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ActivityChart data={data.activity} title="Активность операций" />
              <RecentEvents events={data.recentEvents} />
            </div>

            <QuickActions actions={data.quickActions} />

            {data.lastUpdate && (
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Icon name="Clock" className="h-3 w-3" />
                <span>
                  Обновлено: {data.lastUpdate.toLocaleString('ru', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #0f1535 0%, #1b254b 100%)' }}>
      <PaymentsSidebar
        menuOpen={menuOpen}
        dictionariesOpen={dictionariesOpen}
        setDictionariesOpen={setDictionariesOpen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />

      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="lg:ml-[250px] p-4 md:p-6 lg:p-[30px] min-h-screen flex-1 overflow-x-hidden max-w-full">
        <PaymentsHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <div className="mt-6">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Обзорный дашборд</h1>
            <p className="text-sm text-gray-400">Текущее состояние системы и последние события</p>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
