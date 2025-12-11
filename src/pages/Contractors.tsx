import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';

interface Contractor {
  id: number;
  name: string;
  inn: string;
  kpp: string;
  ogrn: string;
  legal_address: string;
  actual_address: string;
  phone: string;
  email: string;
  contact_person: string;
  bank_name: string;
  bank_bik: string;
  bank_account: string;
  correspondent_account: string;
  notes: string;
  is_active: boolean;
  created_at: string;
}

const Contractors = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState<Contractor | null>(null);
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    inn: '',
    kpp: '',
    ogrn: '',
    legal_address: '',
    actual_address: '',
    phone: '',
    email: '',
    contact_person: '',
    bank_name: '',
    bank_bik: '',
    bank_account: '',
    correspondent_account: '',
    notes: '',
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

  const loadContractors = () => {
    fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=contractors')
      .then(res => res.json())
      .then(data => {
        setContractors(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load contractors:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadContractors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = 'https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=contractors';
      const method = editingContractor ? 'PUT' : 'POST';
      const body = editingContractor 
        ? { ...formData, id: editingContractor.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setDialogOpen(false);
        setEditingContractor(null);
        setFormData({
          name: '',
          inn: '',
          kpp: '',
          ogrn: '',
          legal_address: '',
          actual_address: '',
          phone: '',
          email: '',
          contact_person: '',
          bank_name: '',
          bank_bik: '',
          bank_account: '',
          correspondent_account: '',
          notes: '',
        });
        loadContractors();
      }
    } catch (err) {
      console.error('Failed to save contractor:', err);
    }
  };

  const handleEdit = (contractor: Contractor) => {
    setEditingContractor(contractor);
    setFormData({
      name: contractor.name,
      inn: contractor.inn,
      kpp: contractor.kpp,
      ogrn: contractor.ogrn,
      legal_address: contractor.legal_address,
      actual_address: contractor.actual_address,
      phone: contractor.phone,
      email: contractor.email,
      contact_person: contractor.contact_person,
      bank_name: contractor.bank_name,
      bank_bik: contractor.bank_bik,
      bank_account: contractor.bank_account,
      correspondent_account: contractor.correspondent_account,
      notes: contractor.notes,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого контрагента?')) return;
    
    try {
      const response = await fetch(
        `https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=contractors&id=${id}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        loadContractors();
      }
    } catch (err) {
      console.error('Failed to delete contractor:', err);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingContractor(null);
      setFormData({
        name: '',
        inn: '',
        kpp: '',
        ogrn: '',
        legal_address: '',
        actual_address: '',
        phone: '',
        email: '',
        contact_person: '',
        bank_name: '',
        bank_bik: '',
        bank_account: '',
        correspondent_account: '',
        notes: '',
      });
    }
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
              placeholder="Поиск контрагентов..." 
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
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Контрагенты</h1>
            <p className="text-sm md:text-base text-muted-foreground">Управление контрагентами</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto">
                <Icon name="Plus" size={18} />
                <span>Добавить контрагента</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingContractor ? 'Редактировать контрагента' : 'Новый контрагент'}</DialogTitle>
                <DialogDescription>
                  {editingContractor ? 'Обновите информацию о контрагенте' : 'Добавьте нового контрагента'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="ООО 'Компания'"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inn">ИНН</Label>
                    <Input
                      id="inn"
                      value={formData.inn}
                      onChange={(e) => setFormData({ ...formData, inn: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kpp">КПП</Label>
                    <Input
                      id="kpp"
                      value={formData.kpp}
                      onChange={(e) => setFormData({ ...formData, kpp: e.target.value })}
                      placeholder="123456789"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ogrn">ОГРН</Label>
                    <Input
                      id="ogrn"
                      value={formData.ogrn}
                      onChange={(e) => setFormData({ ...formData, ogrn: e.target.value })}
                      placeholder="1234567890123"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="legal_address">Юридический адрес</Label>
                  <Textarea
                    id="legal_address"
                    value={formData.legal_address}
                    onChange={(e) => setFormData({ ...formData, legal_address: e.target.value })}
                    placeholder="г. Москва, ул. Примерная, д. 1"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actual_address">Фактический адрес</Label>
                  <Textarea
                    id="actual_address"
                    value={formData.actual_address}
                    onChange={(e) => setFormData({ ...formData, actual_address: e.target.value })}
                    placeholder="г. Москва, ул. Примерная, д. 1"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Телефон</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+7 (999) 123-45-67"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="info@company.ru"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact_person">Контактное лицо</Label>
                  <Input
                    id="contact_person"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="Иванов Иван Иванович"
                  />
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h4 className="text-sm font-semibold mb-3">Банковские реквизиты</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name">Название банка</Label>
                      <Input
                        id="bank_name"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        placeholder="ПАО Сбербанк"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bank_bik">БИК</Label>
                        <Input
                          id="bank_bik"
                          value={formData.bank_bik}
                          onChange={(e) => setFormData({ ...formData, bank_bik: e.target.value })}
                          placeholder="044525225"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bank_account">Расчетный счет</Label>
                        <Input
                          id="bank_account"
                          value={formData.bank_account}
                          onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                          placeholder="40702810000000000000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="correspondent_account">Корреспондентский счет</Label>
                      <Input
                        id="correspondent_account"
                        value={formData.correspondent_account}
                        onChange={(e) => setFormData({ ...formData, correspondent_account: e.target.value })}
                        placeholder="30101810000000000000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Примечания</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Дополнительная информация"
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full">
                  {editingContractor ? 'Сохранить' : 'Добавить'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
            ) : contractors.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Нет контрагентов. Добавьте первого контрагента.
              </div>
            ) : (
              <>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Название</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">ИНН</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Контакты</th>
                        <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contractors.map((contractor) => (
                        <tr key={contractor.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4">
                            <div className="font-medium">{contractor.name}</div>
                            {contractor.contact_person && (
                              <div className="text-sm text-muted-foreground">{contractor.contact_person}</div>
                            )}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {contractor.inn || <span className="text-muted-foreground/50">—</span>}
                          </td>
                          <td className="p-4 text-muted-foreground text-sm">
                            <div>{contractor.phone || '—'}</div>
                            <div>{contractor.email || '—'}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(contractor)}
                                className="gap-2"
                              >
                                <Icon name="Pencil" size={16} />
                                Редактировать
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(contractor.id)}
                                className="gap-2 text-red-500 hover:text-red-600"
                              >
                                <Icon name="Trash2" size={16} />
                                Удалить
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="md:hidden space-y-3 p-4">
                  {contractors.map((contractor) => (
                    <Card key={contractor.id} className="border-white/10 bg-white/5">
                      <CardContent className="p-4 space-y-3">
                        <div className="font-medium text-lg">{contractor.name}</div>
                        {contractor.inn && (
                          <div className="text-sm text-muted-foreground">ИНН: {contractor.inn}</div>
                        )}
                        {contractor.contact_person && (
                          <div className="text-sm text-muted-foreground">{contractor.contact_person}</div>
                        )}
                        {(contractor.phone || contractor.email) && (
                          <div className="text-sm text-muted-foreground">
                            {contractor.phone && <div>{contractor.phone}</div>}
                            {contractor.email && <div>{contractor.email}</div>}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(contractor)}
                            className="flex-1 gap-2"
                          >
                            <Icon name="Pencil" size={16} />
                            Редактировать
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(contractor.id)}
                            className="gap-2 text-red-500 hover:text-red-600"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
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

export default Contractors;
