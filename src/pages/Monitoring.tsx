import { useState, useEffect } from 'react';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import PaymentsHeader from '@/components/payments/PaymentsHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ServiceBalance {
  id: number;
  service_name: string;
  balance: number;
  currency: string;
  status: 'ok' | 'warning' | 'critical';
  last_updated: string;
  api_endpoint?: string;
  threshold_warning?: number;
  threshold_critical?: number;
}

const Monitoring = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [services, setServices] = useState<ServiceBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const { token } = useAuth();
  const { toast } = useToast();

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

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://functions.poehali.dev/ffd10ecc-7940-4a9a-92f7-e6eea426304d', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setServices(data.services || []);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
      toast({
        title: 'Ошибка загрузки',
        description: 'Не удалось загрузить данные мониторинга',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async (serviceId: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/ffd10ecc-7940-4a9a-92f7-e6eea426304d?action=refresh&serviceId=${serviceId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        await loadServices();
        toast({
          title: 'Обновлено',
          description: 'Баланс успешно обновлен',
        });
      }
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить баланс',
        variant: 'destructive',
      });
    }
  };

  const refreshAllBalances = async () => {
    setLoading(true);
    try {
      const refreshPromises = services.map(service => 
        fetch(`https://functions.poehali.dev/ffd10ecc-7940-4a9a-92f7-e6eea426304d?action=refresh&serviceId=${service.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      );
      
      await Promise.all(refreshPromises);
      await loadServices();
      
      toast({
        title: 'Обновлено',
        description: `Обновлено ${services.length} сервисов`,
      });
    } catch (error) {
      console.error('Failed to refresh all balances:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить все балансы',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (serviceId: number, serviceName: string) => {
    console.log('Delete clicked:', serviceId, serviceName);
    const confirmed = window.confirm(`Удалить "${serviceName}" из мониторинга?`);
    console.log('Confirmation result:', confirmed);
    if (!confirmed) return;
    
    console.log('Sending DELETE request...');
    try {
      const response = await fetch(`https://functions.poehali.dev/ffd10ecc-7940-4a9a-92f7-e6eea426304d?serviceId=${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('DELETE response:', response.status, response.ok);
      
      if (response.ok) {
        await loadServices();
        toast({
          title: 'Удалено',
          description: `${serviceName} удалён из мониторинга`,
        });
      } else {
        const error = await response.json();
        console.error('DELETE failed:', error);
        toast({
          title: 'Ошибка',
          description: error.error || 'Не удалось удалить сервис',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить сервис',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadServices();
  }, [token]);

  const addTimewebService = async () => {
    try {
      setAdding(true);
      const response = await fetch('https://functions.poehali.dev/ffd10ecc-7940-4a9a-92f7-e6eea426304d', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_name: 'Timeweb Cloud',
          currency: 'RUB',
          api_endpoint: 'https://api.timeweb.cloud/api/v1/account/finances',
          api_key_secret_name: 'TIMEWEB_API_TOKEN',
          threshold_warning: 500,
          threshold_critical: 100,
          auto_refresh: true,
          refresh_interval_minutes: 60,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Сервис добавлен',
          description: 'Timeweb Cloud успешно добавлен в мониторинг',
        });
        setShowAddForm(false);
        await loadServices();
      } else {
        const error = await response.json();
        toast({
          title: response.status === 409 ? 'Сервис уже добавлен' : 'Ошибка',
          description: error.error || 'Не удалось добавить сервис',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to add service:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить сервис',
        variant: 'destructive',
      });
    } finally {
      setAdding(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'critical':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return 'CheckCircle2';
      case 'warning':
        return 'AlertTriangle';
      case 'critical':
        return 'XCircle';
      default:
        return 'HelpCircle';
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

      <div className="flex-1 flex flex-col w-full overflow-x-hidden">
        <PaymentsHeader 
          title="Мониторинг балансов" 
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />

        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <h2 className="text-2xl font-bold text-white">Балансы сервисов</h2>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="default" size="sm">
                      <Icon name="Plus" className="mr-2 h-4 w-4" />
                      Добавить
                      <Icon name="ChevronDown" className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => setShowAddForm(true)}>
                      <Icon name="Server" className="mr-2 h-4 w-4" />
                      Timeweb Cloud
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={refreshAllBalances} variant="outline" size="sm" disabled={loading || services.length === 0}>
                  <Icon name="RefreshCw" className="mr-2 h-4 w-4" />
                  Обновить все
                </Button>
              </div>
            </div>

            {showAddForm && (
              <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Добавить Timeweb Cloud</h3>
                    <p className="text-sm text-white/60">Автоматический мониторинг баланса вашего аккаунта</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)} className="text-white/60 hover:text-white">
                    <Icon name="X" className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-2 text-sm text-white/70">
                    <Icon name="CheckCircle2" className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>Автоматическое обновление каждый час</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/70">
                    <Icon name="CheckCircle2" className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>Уведомления при низком балансе (&lt; 500₽ - warning, &lt; 100₽ - critical)</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/70">
                    <Icon name="CheckCircle2" className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>Требуется токен TIMEWEB_API_TOKEN (добавьте в секреты проекта)</span>
                  </div>
                </div>

                <Button onClick={addTimewebService} disabled={adding} className="w-full">
                  {adding ? (
                    <>
                      <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                      Добавление...
                    </>
                  ) : (
                    <>
                      <Icon name="Plus" className="mr-2 h-4 w-4" />
                      Добавить сервис
                    </>
                  )}
                </Button>
              </Card>
            )}

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-6 bg-white/5 border-white/10 backdrop-blur-sm animate-pulse">
                    <div className="h-24 bg-white/5 rounded"></div>
                  </Card>
                ))}
              </div>
            ) : services.length === 0 ? (
              <Card className="p-12 text-center bg-white/5 border-white/10 backdrop-blur-sm">
                <Icon name="Wallet" className="mx-auto h-16 w-16 text-white/30 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Нет подключенных сервисов</h3>
                <p className="text-white/60 mb-6">Добавьте интеграции с сервисами для мониторинга балансов</p>
                <Button variant="outline" onClick={() => setShowAddForm(true)}>
                  <Icon name="Plus" className="mr-2 h-4 w-4" />
                  Добавить Timeweb Cloud
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="p-6 bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg border ${getStatusColor(service.status)}`}>
                          <Icon name={getStatusIcon(service.status)} className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{service.service_name}</h3>
                          <p className="text-sm text-white/50">
                            Обновлено: {new Date(service.last_updated).toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => refreshBalance(service.id)}
                          className="text-white/60 hover:text-white"
                        >
                          <Icon name="RefreshCw" className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => deleteService(service.id, service.service_name)}
                          className="text-white/60 hover:text-red-500"
                        >
                          <Icon name="Trash2" className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">
                          {service.balance.toLocaleString('ru-RU')}
                        </span>
                        <span className="text-white/60">{service.currency}</span>
                      </div>

                      {service.threshold_warning && service.threshold_critical && (
                        <div className="flex gap-2 text-xs">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Icon name="AlertTriangle" className="h-3 w-3" />
                            <span>&lt; {service.threshold_warning}</span>
                          </div>
                          <div className="flex items-center gap-1 text-red-500">
                            <Icon name="XCircle" className="h-3 w-3" />
                            <span>&lt; {service.threshold_critical}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Monitoring;