import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface Saving {
  id: number;
  service_id: number;
  service_name: string;
  description: string;
  amount: number;
  frequency: string;
  currency: string;
  department_id: number;
  department_name: string;
  saving_reason_id?: number;
  saving_reason_name?: string;
  created_at: string;
}

interface Service {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface SavingReason {
  id: number;
  name: string;
  icon: string;
}

const Savings = () => {
  const [savings, setSavings] = useState<Saving[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [savingReasons, setSavingReasons] = useState<SavingReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    service_id: '',
    description: '',
    amount: '',
    frequency: 'once',
    currency: 'RUB',
    department_id: '',
    saving_reason_id: '',
  });

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

  const loadSavings = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=savings', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavings(Array.isArray(data) ? data : []);
      } else {
        setSavings([]);
      }
    } catch (err) {
      console.error('Failed to load savings:', err);
      setSavings([]);
    } finally {
      setLoading(false);
    }
  };

  const loadServices = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=services', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Savings] Loaded services:', data);
        console.log('[Savings] Is array?', Array.isArray(data));
        console.log('[Savings] Type:', typeof data);
        
        // Если пришел объект со свойством services
        const servicesList = data.services || data;
        console.log('[Savings] Services list:', servicesList);
        
        setServices(Array.isArray(servicesList) ? servicesList : []);
      } else {
        console.error('[Savings] Failed to load services, status:', response.status);
      }
    } catch (err) {
      console.error('[Savings] Failed to load services:', err);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=departments', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const departmentsList = data.departments || data;
        setDepartments(Array.isArray(departmentsList) ? departmentsList : []);
      }
    } catch (err) {
      console.error('Failed to load departments:', err);
    }
  };

  const loadSavingReasons = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=saving-reasons', {
        headers: {
          'X-Auth-Token': token || '',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSavingReasons(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load saving reasons:', err);
    }
  };

  useEffect(() => {
    loadSavings();
    loadServices();
    loadDepartments();
    loadSavingReasons();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=savings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          service_id: parseInt(formData.service_id),
          description: formData.description,
          amount: parseFloat(formData.amount),
          frequency: formData.frequency,
          currency: formData.currency,
          department_id: parseInt(formData.department_id),
          saving_reason_id: formData.saving_reason_id ? parseInt(formData.saving_reason_id) : null,
        }),
      });

      if (response.ok) {
        setDialogOpen(false);
        setFormData({
          service_id: '',
          description: '',
          amount: '',
          frequency: 'once',
          currency: 'RUB',
          department_id: '',
          saving_reason_id: '',
        });
        loadSavings();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при сохранении экономии');
      }
    } catch (err) {
      console.error('Failed to save saving:', err);
      alert('Ошибка при сохранении экономии');
    }
  };

  const handleDeleteSaving = async (savingId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись об экономии?')) return;
    
    try {
      const response = await fetch(`https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=savings&id=${savingId}`, {
        method: 'DELETE',
        headers: {
          'X-Auth-Token': token || '',
        },
      });

      if (response.ok) {
        loadSavings();
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка при удалении');
      }
    } catch (err) {
      console.error('Failed to delete saving:', err);
      alert('Ошибка при удалении');
    }
  };

  const frequencyLabels: Record<string, string> = {
    once: 'Единоразово',
    monthly: 'Ежемесячно',
    yearly: 'Ежегодно',
    quarterly: 'Ежеквартально',
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
        <div className="flex justify-between items-center mb-6">
          <button
            className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name="Menu" size={24} className="text-muted-foreground" />
          </button>
          <div className="flex-1 lg:flex-none" />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Реестр экономии</h1>
            <p className="text-sm md:text-base text-muted-foreground">Учёт и управление экономией средств</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Icon name="Plus" size={20} />
                Добавить экономию
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Добавить экономию</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="service_id">Сервис *</Label>
                  <Select 
                    value={formData.service_id} 
                    onValueChange={(value) => setFormData({ ...formData, service_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={services.length === 0 ? "Загрузка..." : "Выберите сервис"} />
                    </SelectTrigger>
                    <SelectContent>
                      {services.length === 0 ? (
                        <SelectItem value="none" disabled>Загрузка сервисов...</SelectItem>
                      ) : (
                        services.map(service => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание экономии *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Опишите, как была достигнута экономия"
                    required
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Сумма экономии *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      placeholder="10000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Валюта *</Label>
                    <Select 
                      value={formData.currency} 
                      onValueChange={(value) => setFormData({ ...formData, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RUB">RUB</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saving_reason_id">Экономия достигнута за счет:</Label>
                  <Select 
                    value={formData.saving_reason_id} 
                    onValueChange={(value) => setFormData({ ...formData, saving_reason_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={savingReasons.length === 0 ? "Загрузка..." : "Выберите причину"} />
                    </SelectTrigger>
                    <SelectContent>
                      {savingReasons.length === 0 ? (
                        <SelectItem value="none" disabled>Загрузка причин...</SelectItem>
                      ) : (
                        savingReasons.map(reason => (
                          <SelectItem key={reason.id} value={reason.id.toString()}>
                            <span className="flex items-center gap-2">
                              <span>{reason.icon}</span>
                              <span>{reason.name}</span>
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="frequency">Эквивалент *</Label>
                  <Select 
                    value={formData.frequency} 
                    onValueChange={(value) => setFormData({ ...formData, frequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Единоразово</SelectItem>
                      <SelectItem value="monthly">Ежемесячно</SelectItem>
                      <SelectItem value="quarterly">Ежеквартально</SelectItem>
                      <SelectItem value="yearly">Ежегодно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department_id">Отдел-заказчик *</Label>
                  <Select 
                    value={formData.department_id} 
                    onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={departments.length === 0 ? "Загрузка..." : "Выберите отдел"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length === 0 ? (
                        <SelectItem value="none" disabled>Загрузка отделов...</SelectItem>
                      ) : (
                        departments.map(department => (
                          <SelectItem key={department.id} value={department.id.toString()}>
                            {department.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button type="submit">Добавить</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
            ) : savings.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Нет записей об экономии. Добавьте первую запись.
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-white/5">
                      <tr>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Сервис</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Описание</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Причина</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Сумма</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Эквивалент</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Отдел</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Дата</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savings.map(saving => (
                        <tr key={saving.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                          <td className="p-4 font-medium">{saving.service_name}</td>
                          <td className="p-4 text-muted-foreground max-w-xs truncate">{saving.description}</td>
                          <td className="p-4">
                            {saving.saving_reason_name ? (
                              <span className="text-muted-foreground">{saving.saving_reason_name}</span>
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </td>
                          <td className="p-4 font-semibold text-green-500">
                            {saving.amount.toLocaleString('ru-RU')} {saving.currency}
                          </td>
                          <td className="p-4 text-muted-foreground">{frequencyLabels[saving.frequency]}</td>
                          <td className="p-4 text-muted-foreground">{saving.department_name}</td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(saving.created_at).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSaving(saving.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-4 p-4">
                  {savings.map(saving => (
                    <div key={saving.id} className="p-4 rounded-lg border border-white/5 bg-card space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{saving.service_name}</div>
                          <div className="text-sm text-muted-foreground mt-1">{saving.description}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSaving(saving.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </div>
                      <div className="text-xl font-bold text-green-500">
                        {saving.amount.toLocaleString('ru-RU')} {saving.currency}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {frequencyLabels[saving.frequency]}
                      </div>
                      {saving.saving_reason_name && (
                        <div className="text-sm text-muted-foreground">
                          Причина: {saving.saving_reason_name}
                        </div>
                      )}
                      <div className="text-sm text-muted-foreground">
                        Отдел: {saving.department_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(saving.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Savings;