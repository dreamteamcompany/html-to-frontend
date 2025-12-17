import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usePendingApprovals } from '@/hooks/usePendingApprovals';
import { Button } from '@/components/ui/button';

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
        
        const myPendingPayments = allPayments.filter((payment: Payment) => {
          if (!payment.status || !payment.service_id) return false;
          
          const service = servicesData.find((s: Service) => s.id === payment.service_id);
          if (!service) return false;

          if (payment.status === 'pending_tech_director' && service.intermediate_approver_id === user.id) {
            return true;
          }
          
          if (payment.status === 'pending_ceo' && service.final_approver_id === user.id) {
            return true;
          }
          
          return false;
        });

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
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      payment.description.toLowerCase().includes(query) ||
      payment.category_name.toLowerCase().includes(query) ||
      payment.amount.toString().includes(query) ||
      payment.service_name?.toLowerCase().includes(query) ||
      payment.contractor_name?.toLowerCase().includes(query)
    );
  });

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

        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">На согласовании</h1>
            {notificationPermission === 'default' && (
              <Button
                onClick={async () => {
                  await requestNotificationPermission();
                  if ('Notification' in window) {
                    setNotificationPermission(Notification.permission);
                  }
                }}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Icon name="Bell" size={16} />
                Включить уведомления
              </Button>
            )}
            {notificationPermission === 'granted' && (
              <div className="flex items-center gap-2 text-sm text-green-400">
                <Icon name="BellRing" size={16} />
                <span className="hidden sm:inline">Уведомления включены</span>
              </div>
            )}
          </div>
          <p className="text-sm md:text-base text-muted-foreground">
            Платежи, ожидающие вашего решения
          </p>
        </div>

        {loading ? (
          <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground py-8">Загрузка...</div>
            </CardContent>
          </Card>
        ) : filteredPayments.length === 0 ? (
          <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <CardContent className="p-6">
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon name="CheckCircle" size={32} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Всё согласовано!</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Платежи не найдены' : 'У вас нет платежей, ожидающих согласования'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:border-white/10 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                          <Icon name={payment.category_icon} size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-lg font-semibold">{payment.category_name}</h3>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{payment.description}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            {payment.service_name && (
                              <div className="flex items-center gap-1">
                                <Icon name="Briefcase" size={14} />
                                <span>{payment.service_name}</span>
                              </div>
                            )}
                            {payment.contractor_name && (
                              <div className="flex items-center gap-1">
                                <Icon name="Building2" size={14} />
                                <span>{payment.contractor_name}</span>
                              </div>
                            )}
                            {payment.department_name && (
                              <div className="flex items-center gap-1">
                                <Icon name="Users" size={14} />
                                <span>{payment.department_name}</span>
                              </div>
                            )}
                            {payment.invoice_number && (
                              <div className="flex items-center gap-1">
                                <Icon name="FileText" size={14} />
                                <span>Счёт №{payment.invoice_number}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Icon name="Calendar" size={14} />
                              <span>
                                {new Date(payment.payment_date).toLocaleDateString('ru-RU', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:border-l lg:border-white/10 lg:pl-6">
                      <div className="text-center sm:text-right">
                        <div className="text-sm text-muted-foreground mb-1">Сумма платежа</div>
                        <div className="text-2xl font-bold">{payment.amount.toLocaleString('ru-RU')} ₽</div>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleApprove(payment.id)}
                          className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-green-500/20 text-green-300 hover:bg-green-500/30 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <Icon name="Check" size={18} />
                          Одобрить
                        </button>
                        <button
                          onClick={() => handleReject(payment.id)}
                          className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <Icon name="X" size={18} />
                          Отклонить
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PendingApprovals;