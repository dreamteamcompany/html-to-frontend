import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import PendingApprovalsHeader from '@/components/approvals/PendingApprovalsHeader';
import PendingApprovalsFilters from '@/components/approvals/PendingApprovalsFilters';
import PendingApprovalsList from '@/components/approvals/PendingApprovalsList';

interface Payment {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  description: string;
  amount: number;
  payment_date: string;
  legal_entity_id?: number;
  legal_entity_name?: string;
  status?: string;
  created_by?: number;
  service_id?: number;
  service_name?: string;
  contractor_name?: string;
  department_name?: string;
  invoice_number?: string;
}

interface Service {
  id: number;
  name: string;
  intermediate_approver_id: number;
  final_approver_id: number;
}

const PendingApprovals = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const { requestNotificationPermission } = usePendingApprovals();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [amountFrom, setAmountFrom] = useState<string>('');
  const [amountTo, setAmountTo] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

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

  useEffect(() => {
    if (!token || !user) return;

    const loadData = async () => {
      try {
        const [paymentsRes, servicesRes] = await Promise.all([
          fetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=payments', {
            headers: { 'X-Auth-Token': token },
          }),
          fetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=services', {
            headers: { 'X-Auth-Token': token },
          }),
        ]);

        const paymentsData = await paymentsRes.json();
        const servicesData = await servicesRes.json();

        setServices(Array.isArray(servicesData) ? servicesData : []);
        
        const allPayments = Array.isArray(paymentsData) ? paymentsData : [];
        
        console.log('[PendingApprovals] Current user ID:', user.id);
        console.log('[PendingApprovals] All payments:', allPayments.length);
        console.log('[PendingApprovals] All payments data:', allPayments);
        console.log('[PendingApprovals] Services:', servicesData);
        
        const myPendingPayments = allPayments.filter((payment: Payment) => {
          if (!payment.status || !payment.service_id) {
            console.log('[Filter] Skipping payment:', {
              id: payment.id,
              status: payment.status,
              service_id: payment.service_id,
              description: payment.description
            });
            return false;
          }
          
          const service = servicesData.find((s: Service) => s.id === payment.service_id);
          if (!service) {
            console.log('[Filter] Service not found for payment:', payment.id, 'service_id:', payment.service_id);
            return false;
          }

          console.log('[Filter] Checking payment:', {
            id: payment.id,
            status: payment.status,
            service_id: payment.service_id,
            intermediate_approver_id: service.intermediate_approver_id,
            final_approver_id: service.final_approver_id,
            user_id: user.id
          });

          if (payment.status === 'pending_tech_director' && service.intermediate_approver_id === user.id) {
            console.log('[Filter] ✅ Match: pending_tech_director');
            return true;
          }
          
          if (payment.status === 'pending_ceo' && service.final_approver_id === user.id) {
            console.log('[Filter] ✅ Match: pending_ceo');
            return true;
          }
          
          console.log('[Filter] ❌ No match');
          return false;
        });

        console.log('[PendingApprovals] Filtered payments:', myPendingPayments.length);
        setPayments(myPendingPayments);
      } catch (err) {
        console.error('Failed to load data:', err);
        toast({
          title: 'Ошибка',
          description: 'Не удалось загрузить платежи',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, user, toast]);

  const handleApprove = async (paymentId: number) => {
    const comment = prompt('Комментарий к согласованию (опционально):');
    if (comment === null) return;

    try {
      const response = await fetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=approvals', {
        method: 'PUT',
        headers: {
          'X-Auth-Token': token!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          action: 'approve',
          comment,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Платёж согласован',
        });
        setPayments(payments.filter(p => p.id !== paymentId));
      } else {
        const errorData = await response.json();
        toast({
          title: 'Ошибка',
          description: errorData.error || 'Не удалось согласовать платёж',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Approve error:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось согласовать платёж',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (paymentId: number) => {
    const comment = prompt('Причина отклонения (опционально):');
    if (comment === null) return;

    try {
      const response = await fetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=approvals', {
        method: 'PUT',
        headers: {
          'X-Auth-Token': token!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          action: 'reject',
          comment,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Платёж отклонён',
        });
        setPayments(payments.filter(p => p.id !== paymentId));
      } else {
        const errorData = await response.json();
        toast({
          title: 'Ошибка',
          description: errorData.error || 'Не удалось отклонить платёж',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Reject error:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить платёж',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'pending_tech_director':
        return <span className="px-3 py-1 rounded-full text-xs bg-blue-500/20 text-blue-300">Ожидает техдиректора</span>;
      case 'pending_ceo':
        return <span className="px-3 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-300">Ожидает CEO</span>;
      default:
        return null;
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        payment.description.toLowerCase().includes(query) ||
        payment.category_name.toLowerCase().includes(query) ||
        payment.amount.toString().includes(query) ||
        payment.service_name?.toLowerCase().includes(query) ||
        payment.contractor_name?.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }

    if (selectedService !== 'all' && payment.service_id?.toString() !== selectedService) {
      return false;
    }

    if (amountFrom && payment.amount < parseFloat(amountFrom)) {
      return false;
    }

    if (amountTo && payment.amount > parseFloat(amountTo)) {
      return false;
    }

    if (dateFrom && new Date(payment.payment_date) < new Date(dateFrom)) {
      return false;
    }

    if (dateTo && new Date(payment.payment_date) > new Date(dateTo)) {
      return false;
    }

    return true;
  });

  const activeFiltersCount = [
    selectedService !== 'all',
    amountFrom !== '',
    amountTo !== '',
    dateFrom !== '',
    dateTo !== '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedService('all');
    setAmountFrom('');
    setAmountTo('');
    setDateFrom('');
    setDateTo('');
  };

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

      <main className="lg:ml-[250px] p-4 md:p-6 lg:p-[30px] min-h-screen flex-1">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-[30px] px-4 md:px-[25px] py-4 md:py-[18px] bg-[#1b254b]/50 backdrop-blur-[20px] rounded-[15px] border border-white/10">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-white"
          >
            <Icon name="Menu" size={24} />
          </button>
          <div className="flex items-center gap-3 bg-card border border-white/10 rounded-[15px] px-4 md:px-5 py-2 md:py-[10px] w-full sm:w-[300px] lg:w-[400px]">
            <Icon name="Search" size={20} className="text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Поиск по платежам..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
            />
          </div>
          <div className="flex items-center gap-2 md:gap-3 px-3 md:px-[15px] py-2 md:py-[10px] rounded-[12px] bg-white/5 border border-white/10">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-[10px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-sm md:text-base">
              {user?.full_name?.[0] || 'А'}
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium">{user?.full_name || 'Пользователь'}</div>
              <div className="text-xs text-muted-foreground">Согласующий</div>
            </div>
          </div>
        </header>

        <PendingApprovalsHeader
          notificationPermission={notificationPermission}
          requestNotificationPermission={requestNotificationPermission}
          setNotificationPermission={setNotificationPermission}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          activeFiltersCount={activeFiltersCount}
        />

        {showFilters && (
          <PendingApprovalsFilters
            services={services}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            amountFrom={amountFrom}
            setAmountFrom={setAmountFrom}
            amountTo={amountTo}
            setAmountTo={setAmountTo}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            activeFiltersCount={activeFiltersCount}
            clearFilters={clearFilters}
            filteredCount={filteredPayments.length}
            totalCount={payments.length}
          />
        )}

        <PendingApprovalsList
          loading={loading}
          payments={filteredPayments}
          searchQuery={searchQuery}
          handleApprove={handleApprove}
          handleReject={handleReject}
          getStatusBadge={getStatusBadge}
        />
      </main>
    </div>
  );
};

export default PendingApprovals;