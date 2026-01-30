import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface ServiceTemplate {
  id: string;
  name: string;
  icon: string;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
    secret_name: string;
  }[];
  api_endpoint: string;
  default_warning: number;
  default_critical: number;
}

const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    id: 'timeweb-cloud',
    name: 'Timeweb Cloud',
    icon: 'Cloud',
    api_endpoint: 'https://api.timeweb.cloud/api/v1/account/finances',
    default_warning: 500,
    default_critical: 100,
    fields: [
      {
        name: 'api_token',
        label: 'API токен',
        type: 'password',
        placeholder: 'Введите API токен из личного кабинета',
        secret_name: 'TIMEWEB_API_TOKEN',
      },
    ],
  },
  {
    id: 'timeweb-hosting',
    name: 'Timeweb Hosting',
    icon: 'Server',
    api_endpoint: 'https://api.timeweb.ru/v1.1/finances/accounts',
    default_warning: 500,
    default_critical: 100,
    fields: [
      {
        name: 'api_token',
        label: 'API токен',
        type: 'password',
        placeholder: 'Введите API токен',
        secret_name: 'TIMEWEB_HOSTING_API_TOKEN',
      },
    ],
  },
  {
    id: 'smsru',
    name: 'sms.ru',
    icon: 'MessageSquare',
    api_endpoint: 'https://sms.ru/my/balance',
    default_warning: 100,
    default_critical: 20,
    fields: [
      {
        name: 'api_id',
        label: 'API ID',
        type: 'password',
        placeholder: 'Введите API ID',
        secret_name: 'SMSRU_API_ID',
      },
    ],
  },
  {
    id: 'mango',
    name: 'Mango Office',
    icon: 'Phone',
    api_endpoint: 'https://app.mango-office.ru/vpbx/account/balance',
    default_warning: 1000,
    default_critical: 200,
    fields: [
      {
        name: 'api_key',
        label: 'API ключ',
        type: 'password',
        placeholder: 'Введите API ключ',
        secret_name: 'MANGO_OFFICE_API_KEY',
      },
      {
        name: 'api_salt',
        label: 'API Salt',
        type: 'password',
        placeholder: 'Введите API Salt',
        secret_name: 'MANGO_OFFICE_API_SALT',
      },
    ],
  },
  {
    id: 'plusofon',
    name: 'Plusofon',
    icon: 'PhoneCall',
    api_endpoint: 'https://restapi.plusofon.ru/api/v1/payment/balance',
    default_warning: 500,
    default_critical: 100,
    fields: [
      {
        name: 'api_token',
        label: 'API токен',
        type: 'password',
        placeholder: 'Введите API токен',
        secret_name: 'PLUSOFON_API_TOKEN',
      },
    ],
  },
  {
    id: 'regru',
    name: 'Reg.ru',
    icon: 'Globe',
    api_endpoint: 'https://api.reg.ru/api/regru2/user/get_balance',
    default_warning: 100,
    default_critical: 20,
    fields: [
      {
        name: 'username',
        label: 'Логин',
        type: 'text',
        placeholder: 'Введите логин от API',
        secret_name: 'REGRU_USERNAME',
      },
      {
        name: 'password',
        label: 'Пароль',
        type: 'password',
        placeholder: 'Введите пароль от API',
        secret_name: 'REGRU_PASSWORD',
      },
    ],
  },
];

interface AddIntegrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (integration: any) => Promise<void>;
}

export default function AddIntegrationDialog({
  open,
  onOpenChange,
  onAdd,
}: AddIntegrationDialogProps) {
  const [step, setStep] = useState<'select' | 'configure'>('select');
  const [selectedService, setSelectedService] = useState<ServiceTemplate | null>(null);
  const [formData, setFormData] = useState({
    service_name: '',
    description: '',
    threshold_warning: 0,
    threshold_critical: 0,
    credentials: {} as Record<string, string>,
  });
  const [adding, setAdding] = useState(false);

  const handleServiceSelect = (serviceId: string) => {
    const service = SERVICE_TEMPLATES.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
      setFormData({
        service_name: service.name,
        description: '',
        threshold_warning: service.default_warning,
        threshold_critical: service.default_critical,
        credentials: {},
      });
      setStep('configure');
    }
  };

  const handleBack = () => {
    setStep('select');
    setSelectedService(null);
    setFormData({
      service_name: '',
      description: '',
      threshold_warning: 0,
      threshold_critical: 0,
      credentials: {},
    });
  };

  const handleSubmit = async () => {
    if (!selectedService) return;

    try {
      setAdding(true);
      
      await onAdd({
        service_name: formData.service_name,
        description: formData.description,
        api_endpoint: selectedService.api_endpoint,
        threshold_warning: formData.threshold_warning,
        threshold_critical: formData.threshold_critical,
        credentials: formData.credentials,
        api_key_secret_name: selectedService.fields[0].secret_name,
      });

      onOpenChange(false);
      handleBack();
    } catch (error) {
      console.error('Failed to add integration:', error);
    } finally {
      setAdding(false);
    }
  };

  const isFormValid = () => {
    if (!selectedService) return false;
    if (!formData.service_name.trim()) return false;
    
    for (const field of selectedService.fields) {
      if (!formData.credentials[field.name]?.trim()) return false;
    }
    
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#0f1535] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {step === 'configure' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="mr-2 -ml-2"
              >
                <Icon name="ChevronLeft" size={20} />
              </Button>
            )}
            {step === 'select' ? 'Выберите сервис' : 'Настройка интеграции'}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <div className="grid gap-3 py-4">
            {SERVICE_TEMPLATES.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service.id)}
                className="flex items-center gap-3 p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Icon name={service.icon as any} size={20} className="text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium">{service.name}</div>
                  <div className="text-sm text-gray-400">
                    {service.fields.length} {service.fields.length === 1 ? 'параметр' : 'параметра'}
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-gray-400" />
              </button>
            ))}
          </div>
        )}

        {step === 'configure' && selectedService && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service_name" className="text-white">
                Название в системе
              </Label>
              <Input
                id="service_name"
                value={formData.service_name}
                onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                placeholder="Например: Timeweb Cloud (основной)"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">
                Описание (необязательно)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Краткое описание"
                className="bg-white/5 border-white/10 text-white min-h-[60px]"
              />
            </div>

            <div className="border-t border-white/10 pt-4 space-y-3">
              <h4 className="text-sm font-medium text-white">Данные для подключения</h4>
              
              {selectedService.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="text-white">
                    {field.label}
                  </Label>
                  <Input
                    id={field.name}
                    type={field.type}
                    value={formData.credentials[field.name] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        credentials: {
                          ...formData.credentials,
                          [field.name]: e.target.value,
                        },
                      })
                    }
                    placeholder={field.placeholder}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4">
              <div className="space-y-2">
                <Label htmlFor="threshold_warning" className="text-white">
                  Порог предупреждения
                </Label>
                <Input
                  id="threshold_warning"
                  type="number"
                  value={formData.threshold_warning}
                  onChange={(e) =>
                    setFormData({ ...formData, threshold_warning: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="threshold_critical" className="text-white">
                  Критический порог
                </Label>
                <Input
                  id="threshold_critical"
                  type="number"
                  value={formData.threshold_critical}
                  onChange={(e) =>
                    setFormData({ ...formData, threshold_critical: parseFloat(e.target.value) || 0 })
                  }
                  className="bg-white/5 border-white/10 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 border-white/10 text-white hover:bg-white/5"
              >
                Назад
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid() || adding}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {adding ? 'Добавление...' : 'Добавить интеграцию'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
