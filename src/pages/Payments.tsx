import { useState, useEffect } from 'react';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import MyPaymentsTab from '@/components/payments/tabs/MyPaymentsTab';
import PendingApprovalsTab from '@/components/payments/tabs/PendingApprovalsTab';
import ApprovedPaymentsTab from '@/components/payments/tabs/ApprovedPaymentsTab';
import RejectedPaymentsTab from '@/components/payments/tabs/RejectedPaymentsTab';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';

const Payments = () => {
  const { user } = useAuth();
  const isCEO = user?.roles?.some(role => role.name === 'CEO' || role.name === 'Генеральный директор');
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(isCEO ? 'pending' : 'my');
  const [counters, setCounters] = useState({ my: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const response = await apiFetch(`${API_ENDPOINTS.paymentsApi}?scope=all`);
        const data = await response.json();
        const payments = Array.isArray(data) ? data : [];
        
        setCounters({
          my: payments.filter(p => !p.status || p.status === 'draft').length,
          pending: payments.filter(p => p.status && p.status.startsWith('pending_')).length,
          approved: payments.filter(p => p.status === 'approved').length,
          rejected: payments.filter(p => p.status === 'rejected').length,
        });
      } catch (error) {
        console.error('Failed to fetch counters:', error);
      }
    };

    fetchCounters();
    const interval = setInterval(fetchCounters, 30000);
    return () => clearInterval(interval);
  }, []);

  const {
    menuOpen,
    setMenuOpen,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSidebarTouch();

  return (
    <div className="flex min-h-screen">
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

      <main className="lg:ml-[250px] min-h-screen flex-1 overflow-x-hidden max-w-full">
        <div className="px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex justify-between items-start gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="lg:hidden p-2 -ml-2 text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <Icon name="Menu" size={24} />
                </button>
                <h1 className="text-2xl md:text-3xl font-bold">История платежей</h1>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">Все операции по IT расходам</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start border-b border-white/10 rounded-none bg-transparent p-0 h-auto mb-6">
              {!isCEO && (
              <TabsTrigger 
                value="my" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Icon name="FileText" size={18} className="mr-2" />
                Мои платежи
                {counters.my > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {counters.my}
                  </span>
                )}
              </TabsTrigger>
              )}
              <TabsTrigger 
                value="pending" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 relative"
              >
                <Icon name="Clock" size={18} className="mr-2" />
                На согласовании
                {counters.pending > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {counters.pending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="approved" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Icon name="CheckCircle" size={18} className="mr-2" />
                Согласованные
                {counters.approved > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {counters.approved}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="rejected" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                <Icon name="XCircle" size={18} className="mr-2" />
                Отклонённые
                {counters.rejected > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                    {counters.rejected}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {!isCEO && (
            <TabsContent value="my" className="mt-0">
              <MyPaymentsTab />
            </TabsContent>
            )}

            <TabsContent value="pending" className="mt-0">
              <PendingApprovalsTab />
            </TabsContent>

            <TabsContent value="approved" className="mt-0">
              <ApprovedPaymentsTab />
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              <RejectedPaymentsTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Payments;