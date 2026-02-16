import { useState } from 'react';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import PaymentsHeader from '@/components/payments/PaymentsHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import MyPaymentsTab from '@/components/payments/tabs/MyPaymentsTab';
import PendingApprovalsTab from '@/components/payments/tabs/PendingApprovalsTab';
import ApprovedPaymentsTab from '@/components/payments/tabs/ApprovedPaymentsTab';
import RejectedPaymentsTab from '@/components/payments/tabs/RejectedPaymentsTab';

const Payments = () => {
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('my');

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
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-white/10">
          <div className="px-4 sm:px-6 py-4">
            <PaymentsHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          </div>

          <div className="px-4 sm:px-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start border-b border-white/10 rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="my" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <Icon name="FileText" size={18} className="mr-2" />
                  Мои платежи
                </TabsTrigger>
                <TabsTrigger 
                  value="pending" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <Icon name="Clock" size={18} className="mr-2" />
                  На согласовании
                </TabsTrigger>
                <TabsTrigger 
                  value="approved" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <Icon name="CheckCircle" size={18} className="mr-2" />
                  Согласованные
                </TabsTrigger>
                <TabsTrigger 
                  value="rejected" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                >
                  <Icon name="XCircle" size={18} className="mr-2" />
                  Отклонённые
                </TabsTrigger>
              </TabsList>

              <div className="p-4 sm:p-6">
                <TabsContent value="my" className="mt-0">
                  <MyPaymentsTab />
                </TabsContent>

                <TabsContent value="pending" className="mt-0">
                  <PendingApprovalsTab />
                </TabsContent>

                <TabsContent value="approved" className="mt-0">
                  <ApprovedPaymentsTab />
                </TabsContent>

                <TabsContent value="rejected" className="mt-0">
                  <RejectedPaymentsTab />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payments;
