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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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
  description?: string;
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
  const [addServiceType, setAddServiceType] = useState<'timeweb' | 'timeweb-hosting' | 'smsru' | 'mango' | 'plusofon' | 'regru' | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingService, setEditingService] = useState<ServiceBalance | null>(null);
  const [editForm, setEditForm] = useState({
    service_name: '',
    description: '',
    threshold_warning: 0,
    threshold_critical: 0,
  });
  const [saving, setSaving] = useState(false);
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
    const confirmed = window.confirm(`Удалить "${serviceName}" из мониторинга?`);
    if (!confirmed) return;
    
    try {
      const response = await fetch(`https://functions.poehali.dev/ffd10ecc-7940-4a9a-92f7-e6eea426304d?serviceId=${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        await loadServices();
        toast({
          title: 'Удалено',
          description: `${serviceName} удалён из мониторинга`,
        });
      } else {
        const error = await response.json();
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

  const openEditDialog = (service: ServiceBalance) => {
    setEditingService(service);
    setEditForm({
      service_name: service.service_name,
      description: service.description || '',
      threshold_warning: service.threshold_warning || 0,
      threshold_critical: service.threshold_critical || 0,
    });
  };

  const saveServiceSettings = async () => {
    if (!editingService) return;

    try {
      setSaving(true);
      const response = await fetch(`https://functions.poehali.dev/ffd10ecc-7940-4a9a-92f7-e6eea426304d?serviceId=${editingService.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_name: editForm.service_name,
          description: editForm.description,
          threshold_warning: editForm.threshold_warning,
          threshold_critical: editForm.threshold_critical,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Сохранено',
          description: 'Настройки сервиса обновлены',
        });
        setEditingService(null);
        await loadServices();
      } else {
        toast({
          title: 'Ошибка',
          description: 'Не удалось сохранить настройки',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to save service settings:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    loadServices();
    
    const interval = setInterval(() => {
      refreshAllBalances();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [token]);

  const addService = async (type: 'timeweb' | 'timeweb-hosting' | 'smsru' | 'mango' | 'plusofon' | 'regru') => {
    const serviceConfigs = {
      timeweb: {
        service_name: 'Timeweb Cloud',
        api_endpoint: 'https://api.timeweb.cloud/api/v1/account/finances',
        api_key_secret_name: 'TIMEWEB_API_TOKEN',
        threshold_warning: 500,
        threshold_critical: 100,
        description: 'Timeweb Cloud успешно добавлен в мониторинг'
      },
      'timeweb-hosting': {
        service_name: 'Timeweb Hosting',
        api_endpoint: 'https://api.timeweb.ru/v1.1/finances/accounts',
        api_key_secret_name: 'TIMEWEB_HOSTING_API_TOKEN',
        threshold_warning: 500,
        threshold_critical: 100,
        description: 'Timeweb Hosting успешно добавлен в мониторинг'
      },
      smsru: {
        service_name: 'sms.ru',
        api_endpoint: 'https://sms.ru/my/balance',
        api_key_secret_name: 'SMSRU_API_ID',
        threshold_warning: 100,
        threshold_critical: 20,
        description: 'sms.ru успешно добавлен в мониторинг'
      },
      mango: {
        service_name: 'Mango Office',
        api_endpoint: 'https://app.mango-office.ru/vpbx/account/balance',
        api_key_secret_name: 'MANGO_OFFICE_API_KEY',
        threshold_warning: 1000,
        threshold_critical: 200,
        description: 'Mango Office успешно добавлен в мониторинг'
      },
      plusofon: {
        service_name: 'Plusofon',
        api_endpoint: 'https://restapi.plusofon.ru/api/v1/payment/balance',
        api_key_secret_name: 'PLUSOFON_API_TOKEN',
        threshold_warning: 500,
        threshold_critical: 100,
        description: 'Plusofon успешно добавлен в мониторинг'
      },
      regru: {
        service_name: 'Reg.ru',
        api_endpoint: 'https://api.reg.ru/api/regru2/user/get_balance',
        api_key_secret_name: 'REGRU_USERNAME',
        threshold_warning: 1000,
        threshold_critical: 200,
        description: 'Reg.ru успешно добавлен в мониторинг'
      }
    };

    const config = serviceConfigs[type];

    try {
      setAdding(true);
      const response = await fetch('https://functions.poehali.dev/ffd10ecc-7940-4a9a-92f7-e6eea426304d', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...config,
          currency: 'RUB',
          auto_refresh: true,
          refresh_interval_minutes: 60,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Сервис добавлен',
          description: config.description,
        });
        setShowAddForm(false);
        setAddServiceType(null);
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
                    <DropdownMenuItem onClick={() => { setAddServiceType('timeweb'); setShowAddForm(true); }}>
                      <Icon name="Server" className="mr-2 h-4 w-4" />
                      Timeweb Cloud
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setAddServiceType('smsru'); setShowAddForm(true); }}>
                      <Icon name="MessageSquare" className="mr-2 h-4 w-4" />
                      sms.ru
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setAddServiceType('mango'); setShowAddForm(true); }}>
                      <Icon name="Phone" className="mr-2 h-4 w-4" />
                      Mango Office
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setAddServiceType('plusofon'); setShowAddForm(true); }}>
                      <Icon name="PhoneCall" className="mr-2 h-4 w-4" />
                      Plusofon
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setAddServiceType('timeweb-hosting'); setShowAddForm(true); }}>
                      <Icon name="Globe" className="mr-2 h-4 w-4" />
                      Timeweb Hosting
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setAddServiceType('regru'); setShowAddForm(true); }}>
                      <Icon name="Globe" className="mr-2 h-4 w-4" />
                      Reg.ru
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button onClick={refreshAllBalances} variant="outline" size="sm" disabled={loading || services.length === 0}>
                  <Icon name="RefreshCw" className="mr-2 h-4 w-4" />
                  Обновить все
                </Button>
              </div>
            </div>

            {showAddForm && addServiceType && (
              <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {addServiceType === 'timeweb' ? 'Добавить Timeweb Cloud' : 
                       addServiceType === 'timeweb-hosting' ? 'Добавить Timeweb Hosting' :
                       addServiceType === 'smsru' ? 'Добавить sms.ru' : 
                       addServiceType === 'mango' ? 'Добавить Mango Office' :
                       addServiceType === 'regru' ? 'Добавить Reg.ru' :
                       'Добавить Plusofon'}
                    </h3>
                    <p className="text-sm text-white/60">Автоматический мониторинг баланса вашего аккаунта</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => { setShowAddForm(false); setAddServiceType(null); }} className="text-white/60 hover:text-white">
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
                    <span>
                      {addServiceType === 'timeweb' || addServiceType === 'timeweb-hosting' || addServiceType === 'plusofon'
                        ? 'Уведомления при низком балансе (< 500₽ - warning, < 100₽ - critical)'
                        : addServiceType === 'mango' || addServiceType === 'regru'
                        ? 'Уведомления при низком балансе (< 1000₽ - warning, < 200₽ - critical)'
                        : 'Уведомления при низком балансе (< 100₽ - warning, < 20₽ - critical)'}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-white/70">
                    <Icon name="CheckCircle2" className="h-4 w-4 mt-0.5 text-green-500" />
                    <span>
                      {addServiceType === 'timeweb'
                        ? 'Требуется токен TIMEWEB_API_TOKEN'
                        : addServiceType === 'timeweb-hosting'
                        ? 'Требуется TIMEWEB_HOSTING_API_TOKEN, APP_KEY и LOGIN'
                        : addServiceType === 'smsru'
                        ? 'Требуется API ID SMSRU_API_ID'
                        : addServiceType === 'mango'
                        ? 'Требуется MANGO_OFFICE_API_KEY и MANGO_OFFICE_API_SALT'
                        : addServiceType === 'regru'
                        ? 'Требуется REGRU_USERNAME и REGRU_PASSWORD'
                        : 'Требуется PLUSOFON_API_TOKEN и PLUSOFON_CLIENT_ID'}
                    </span>
                  </div>
                </div>

                <Button onClick={() => addService(addServiceType)} disabled={adding} className="w-full">
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
                            Обновлено: {(() => {
                              const date = new Date(service.last_updated);
                              console.log('Raw date:', service.last_updated, 'Parsed:', date, 'MSK:', date.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }));
                              return date.toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
                            })()}
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
                          onClick={() => openEditDialog(service)}
                          className="text-white/60 hover:text-white"
                        >
                          <Icon name="Settings" className="h-4 w-4" />
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
                      {service.description && (
                        <p className="text-sm text-white/60">{service.description}</p>
                      )}
                      
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

            {editingService && (
              <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
                <DialogContent className="bg-[#0f1535] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Настройки сервиса</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="service_name">Название</Label>
                      <Input
                        id="service_name"
                        value={editForm.service_name}
                        onChange={(e) => setEditForm({ ...editForm, service_name: e.target.value })}
                        className="bg-white/5 border-white/10 text-white"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Описание</Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        placeholder="Добавьте описание для этого сервиса..."
                        className="bg-white/5 border-white/10 text-white"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="threshold_warning">Порог предупреждения</Label>
                        <Input
                          id="threshold_warning"
                          type="number"
                          value={editForm.threshold_warning}
                          onChange={(e) => setEditForm({ ...editForm, threshold_warning: Number(e.target.value) })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <p className="text-xs text-yellow-500 mt-1">Покажет предупреждение</p>
                      </div>

                      <div>
                        <Label htmlFor="threshold_critical">Критический порог</Label>
                        <Input
                          id="threshold_critical"
                          type="number"
                          value={editForm.threshold_critical}
                          onChange={(e) => setEditForm({ ...editForm, threshold_critical: Number(e.target.value) })}
                          className="bg-white/5 border-white/10 text-white"
                        />
                        <p className="text-xs text-red-500 mt-1">Покажет критическую ошибку</p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setEditingService(null)}
                        disabled={saving}
                      >
                        Отмена
                      </Button>
                      <Button
                        onClick={saveServiceSettings}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            <Icon name="Save" className="mr-2 h-4 w-4" />
                            Сохранить
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Monitoring;