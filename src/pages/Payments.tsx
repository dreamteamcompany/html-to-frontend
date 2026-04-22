import { useState } from 'react';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import MyPaymentsTab from '@/components/payments/tabs/MyPaymentsTab';
import PendingApprovalsTab from '@/components/payments/tabs/PendingApprovalsTab';
import ApprovedPaymentsTab from '@/components/payments/tabs/ApprovedPaymentsTab';
import RejectedPaymentsTab from '@/components/payments/tabs/RejectedPaymentsTab';
import { useAuth } from '@/contexts/AuthContext';
import { AllPaymentsCacheProvider, useAllPaymentsCache } from '@/contexts/AllPaymentsCacheContext';
import { useSearchParams } from 'react-router-dom';
import PaymentsTabsBar from './payments/PaymentsTabsBar';
import { usePaymentCounters } from './payments/usePaymentCounters';
import { useContentSwipe } from './payments/useContentSwipe';
import { usePaymentDeepLink } from './payments/usePaymentDeepLink';

const PaymentsInner = () => {
  const { user } = useAuth();
  const { payments: allPayments } = useAllPaymentsCache();
  const isCEO = user?.roles?.some(role => role.name === 'CEO' || role.name === 'Генеральный директор') ?? false;
  const isAdmin = user?.roles?.some(role => role.name === 'Администратор' || role.name === 'Admin') ?? false;
  const canApproveReject = isCEO || isAdmin;
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(isCEO ? 'pending' : 'my');
  const [searchParams, setSearchParams] = useSearchParams();

  const { openPaymentId, setOpenPaymentId } = usePaymentDeepLink({
    allPayments,
    isCEO,
    searchParams,
    setSearchParams,
    setActiveTab,
  });

  const tabs = isCEO
    ? ['pending', 'approved', 'rejected']
    : ['my', 'pending', 'approved', 'rejected'];

  const counters = usePaymentCounters(allPayments);

  const { handleContentTouchStart, handleContentTouchEnd } = useContentSwipe(tabs, activeTab, setActiveTab);

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

      <main
        className="lg:ml-[250px] min-h-screen flex-1 overflow-x-hidden max-w-full"
        onTouchStart={handleContentTouchStart}
        onTouchEnd={handleContentTouchEnd}
      >
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
            <PaymentsTabsBar isCEO={isCEO} counters={counters} />

            {!isCEO && (
              <TabsContent value="my" className="mt-0">
                <MyPaymentsTab
                  openPaymentId={activeTab === 'my' ? openPaymentId : null}
                  onOpenPaymentIdHandled={() => setOpenPaymentId(null)}
                  onAfterSubmitForApproval={() => setActiveTab('pending')}
                />
              </TabsContent>
            )}

            <TabsContent value="pending" className="mt-0">
              <PendingApprovalsTab
                openPaymentId={activeTab === 'pending' ? openPaymentId : null}
                onOpenPaymentIdHandled={() => setOpenPaymentId(null)}
                canApproveReject={canApproveReject}
              />
            </TabsContent>

            <TabsContent value="approved" className="mt-0">
              <ApprovedPaymentsTab openPaymentId={activeTab === 'approved' ? openPaymentId : null} onOpenPaymentIdHandled={() => setOpenPaymentId(null)} />
            </TabsContent>

            <TabsContent value="rejected" className="mt-0">
              <RejectedPaymentsTab openPaymentId={activeTab === 'rejected' ? openPaymentId : null} onOpenPaymentIdHandled={() => setOpenPaymentId(null)} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

const Payments = () => (
  <AllPaymentsCacheProvider>
    <PaymentsInner />
  </AllPaymentsCacheProvider>
);

export default Payments;
