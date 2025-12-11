import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface LegalEntity {
  id: number;
  name: string;
  inn: string;
  kpp: string;
  address: string;
}

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  options: string;
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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
  const [formData, setFormData] = useState<Record<string, string>>({
    category_id: '',
    description: '',
    amount: '',
    legal_entity_id: '',
  });

  const loadPayments = () => {
    fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=payments')
      .then(res => res.json())
      .then(data => {
        setPayments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load payments:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPayments();
    fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(err => console.error('Failed to load categories:', err));
    fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=legal-entities')
      .then(res => res.json())
      .then(setLegalEntities)
      .catch(err => console.error('Failed to load legal entities:', err));
    fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=custom-fields')
      .then(res => res.json())
      .then((fields) => {
        setCustomFields(fields);
        const initialData: Record<string, string> = {
          category_id: '',
          description: '',
          amount: '',
          legal_entity_id: '',
        };
        fields.forEach((field: CustomField) => {
          initialData[`custom_field_${field.id}`] = '';
        });
        setFormData(initialData);
      })
      .catch(err => console.error('Failed to load custom fields:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: parseInt(formData.category_id),
          description: formData.description,
          amount: parseFloat(formData.amount),
          legal_entity_id: formData.legal_entity_id ? parseInt(formData.legal_entity_id) : null,
        }),
      });

      if (response.ok) {
        setDialogOpen(false);
        const resetData: Record<string, string> = {
          category_id: '',
          description: '',
          amount: '',
          legal_entity_id: '',
        };
        customFields.forEach(field => {
          resetData[`custom_field_${field.id}`] = '';
        });
        setFormData(resetData);
        loadPayments();
      }
    } catch (err) {
      console.error('Failed to add payment:', err);
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside 
        className={`w-[250px] bg-[#1b254b] border-r border-white/10 fixed left-0 top-0 h-screen z-50 transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <a href="/" className="flex items-center gap-3 px-5 py-5 pb-[30px] border-b border-white/10">
          <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center font-bold text-white">
            V
          </div>
          <span className="text-white font-semibold">Vision UI</span>
        </a>
        <ul className="px-[15px] py-5 space-y-1">
          <li>
            <Link to="/" className="flex items-center gap-3 px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              <Icon name="Home" size={20} />
              <span>Дашборд</span>
            </Link>
          </li>
          <li>
            <Link to="/payments" className="flex items-center gap-3 px-[15px] py-3 rounded-lg bg-primary text-white">
              <Icon name="CreditCard" size={20} />
              <span>Платежи</span>
            </Link>
          </li>
          <li>
            <button 
              onClick={() => setDictionariesOpen(!dictionariesOpen)}
              className="w-full flex items-center justify-between px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon name="BookOpen" size={20} />
                <span>Справочники</span>
              </div>
              <Icon 
                name="ChevronDown" 
                size={16} 
                className={`transition-transform ${dictionariesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {dictionariesOpen && (
              <div className="mt-1 space-y-1">
                <Link 
                  to="/legal-entities" 
                  className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon name="Building2" size={18} />
                  <span>Юридические лица</span>
                </Link>
                <Link 
                  to="/categories" 
                  className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon name="Tag" size={18} />
                  <span>Категории платежей</span>
                </Link>
                <Link 
                  to="/custom-fields" 
                  className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon name="Settings" size={18} />
                  <span>Дополнительные поля</span>
                </Link>
              </div>
            )}
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              <Icon name="Box" size={20} />
              <span>Сервисы</span>
            </a>
          </li>
        </ul>
      </aside>

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
              placeholder="Поиск платежей..." 
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
            />
          </div>
          <div className="flex items-center gap-2 md:gap-3 px-3 md:px-[15px] py-2 md:py-[10px] rounded-[12px] bg-white/5 border border-white/10">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-[10px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-sm md:text-base">
              А
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium">Администратор</div>
              <div className="text-xs text-muted-foreground">Администратор</div>
            </div>
          </div>
        </header>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">История платежей</h1>
            <p className="text-sm md:text-base text-muted-foreground">Все операции по IT расходам</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto">
                <Icon name="Plus" size={18} />
                <span>Добавить платёж</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Новый платёж</DialogTitle>
                <DialogDescription>
                  Добавьте информацию о новой операции
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Категория</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          <div className="flex items-center gap-2">
                            <Icon name={cat.icon} size={16} />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legal_entity">Юридическое лицо</Label>
                  <Select
                    value={formData.legal_entity_id || undefined}
                    onValueChange={(value) => setFormData({ ...formData, legal_entity_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите юридическое лицо (опционально)" />
                    </SelectTrigger>
                    <SelectContent>
                      {legalEntities.map((entity) => (
                        <SelectItem key={entity.id} value={entity.id.toString()}>
                          {entity.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Назначение</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Описание платежа"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Сумма</Label>
                  <Input
                    id="amount"
                    type="text"
                    value={formData.amount ? formData.amount.replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\s/g, '');
                      if (/^\d*$/.test(value)) {
                        setFormData({ ...formData, amount: value });
                      }
                    }}
                    placeholder="0"
                    required
                  />
                </div>
                
                {customFields.length > 0 && (
                  <div className="border-t border-white/10 pt-4 space-y-4">
                    <h4 className="text-sm font-semibold text-muted-foreground">Дополнительные поля</h4>
                    {customFields.map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={`custom_field_${field.id}`}>{field.name}</Label>
                        {field.field_type === 'text' && (
                          <Input
                            id={`custom_field_${field.id}`}
                            value={formData[`custom_field_${field.id}`] || ''}
                            onChange={(e) => setFormData({ ...formData, [`custom_field_${field.id}`]: e.target.value })}
                            placeholder={`Введите ${field.name.toLowerCase()}`}
                          />
                        )}
                        {field.field_type === 'select' && (
                          <Select
                            value={formData[`custom_field_${field.id}`]}
                            onValueChange={(value) => setFormData({ ...formData, [`custom_field_${field.id}`]: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите значение" />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.split(',').map((option, idx) => (
                                <SelectItem key={idx} value={option.trim()}>
                                  {option.trim()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {field.field_type === 'toggle' && (
                          <Select
                            value={formData[`custom_field_${field.id}`]}
                            onValueChange={(value) => setFormData({ ...formData, [`custom_field_${field.id}`]: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите значение" />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.split(',').map((option, idx) => (
                                <SelectItem key={idx} value={option.trim()}>
                                  {option.trim()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                        {field.field_type === 'file' && (
                          <Input
                            id={`custom_field_${field.id}`}
                            type="text"
                            value={formData[`custom_field_${field.id}`] || ''}
                            onChange={(e) => setFormData({ ...formData, [`custom_field_${field.id}`]: e.target.value })}
                            placeholder="URL файла"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <Button type="submit" className="w-full">
                  Добавить
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
            ) : payments.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Нет платежей. Добавьте первый платёж для начала работы.
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Категория</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Юр. лицо</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Назначение</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Сумма</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Дата</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Icon name={payment.category_icon} size={18} />
                              </div>
                              <span className="font-medium">{payment.category_name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {payment.legal_entity_name || <span className="text-muted-foreground/50">—</span>}
                          </td>
                          <td className="p-4 text-muted-foreground">{payment.description}</td>
                          <td className="p-4">
                            <span className="font-bold text-lg">{payment.amount.toLocaleString('ru-RU')} ₽</span>
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {new Date(payment.payment_date).toLocaleDateString('ru-RU', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="md:hidden space-y-3 p-4">
                  {payments.map((payment) => (
                    <Card key={payment.id} className="border-white/10 bg-white/5">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                              <Icon name={payment.category_icon} size={18} />
                            </div>
                            <span className="font-medium">{payment.category_name}</span>
                          </div>
                          <span className="font-bold text-lg">{payment.amount.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        {payment.legal_entity_name && (
                          <div className="text-sm">
                            <span className="text-muted-foreground/70">Юр. лицо: </span>
                            <span className="text-muted-foreground">{payment.legal_entity_name}</span>
                          </div>
                        )}
                        <div className="text-sm text-muted-foreground">{payment.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(payment.payment_date).toLocaleDateString('ru-RU', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </div>
                      </CardContent>
                    </Card>
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

export default Payments;