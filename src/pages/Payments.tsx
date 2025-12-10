import { useEffect, useState } from 'react';
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
  category: string;
  description: string;
  amount: number;
  payment_date: string;
}

const categoryNames: Record<string, string> = {
  servers: 'Серверы',
  communications: 'Коммуникации',
  websites: 'Веб-сайты',
  security: 'Безопасность',
};

const categoryIcons: Record<string, string> = {
  servers: 'Server',
  communications: 'MessageSquare',
  websites: 'Globe',
  security: 'Shield',
};

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
  });

  const loadPayments = () => {
    fetch('https://functions.poehali.dev/0f0eb161-07cd-4e34-b95b-9ff274f3390a')
      .then(res => res.json())
      .then(() => {
        setPayments([]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load payments:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://functions.poehali.dev/4b19ebef-58d6-4d8b-8d7a-e941f6229594', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        setDialogOpen(false);
        setFormData({ category: '', description: '', amount: '' });
        loadPayments();
      }
    } catch (err) {
      console.error('Failed to add payment:', err);
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-[250px] bg-[#1b254b] border-r border-white/10 fixed left-0 top-0 h-screen">
        <a href="/" className="flex items-center gap-3 px-5 py-5 pb-[30px] border-b border-white/10">
          <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center font-bold text-white">
            V
          </div>
          <span className="text-white font-semibold">Vision UI</span>
        </a>
        <ul className="px-[15px] py-5 space-y-1">
          <li>
            <a href="/" className="flex items-center gap-3 px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              <Icon name="Home" size={20} />
              <span>Дашборд</span>
            </a>
          </li>
          <li>
            <a href="/payments" className="flex items-center gap-3 px-[15px] py-3 rounded-lg bg-primary text-white">
              <Icon name="CreditCard" size={20} />
              <span>Платежи</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              <Icon name="Box" size={20} />
              <span>Сервисы</span>
            </a>
          </li>
        </ul>
      </aside>

      <main className="ml-[250px] p-[30px] min-h-screen flex-1">
        <header className="flex justify-between items-center mb-[30px] px-[25px] py-[18px] bg-[#1b254b]/50 backdrop-blur-[20px] rounded-[15px] border border-white/10">
          <div className="flex items-center gap-3 bg-card border border-white/10 rounded-[15px] px-5 py-[10px] w-[400px]">
            <Icon name="Search" size={20} className="text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Поиск платежей..." 
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
            />
          </div>
          <div className="flex items-center gap-3 px-[15px] py-[10px] rounded-[12px] bg-white/5 border border-white/10">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white">
              А
            </div>
            <div>
              <div className="text-sm font-medium">Администратор</div>
              <div className="text-xs text-muted-foreground">Администратор</div>
            </div>
          </div>
        </header>

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">История платежей</h1>
            <p className="text-muted-foreground">Все операции по IT расходам</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                <Icon name="Plus" size={18} />
                Добавить платёж
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
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servers">Серверы</SelectItem>
                      <SelectItem value="communications">Коммуникации</SelectItem>
                      <SelectItem value="websites">Веб-сайты</SelectItem>
                      <SelectItem value="security">Безопасность</SelectItem>
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
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Категория</th>
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
                              <Icon name={categoryIcons[payment.category]} size={18} />
                            </div>
                            <span className="font-medium">{categoryNames[payment.category]}</span>
                          </div>
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Payments;
