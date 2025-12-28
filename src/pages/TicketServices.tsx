import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { useToast } from '@/hooks/use-toast';

const BACKEND_URL = 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd';

interface User {
  id: number;
  full_name: string;
  role: string;
}

interface CustomerDepartment {
  id: number;
  name: string;
  description: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  intermediate_approver_id: number;
  final_approver_id: number;
  intermediate_approver_name?: string;
  final_approver_name?: string;
  customer_department_id?: number;
  customer_department_name?: string;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
  created_at: string;
}

const TicketServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<CustomerDepartment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    final_approver_id: '',
    customer_department_id: '',
    category_id: '',
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

  useEffect(() => {
    loadServices();
    loadUsers();
    loadDepartments();
    loadCategories();
  }, []);

  const loadServices = async () => {
    try {
      const response = await apiFetch(`${BACKEND_URL}?endpoint=services`);
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Failed to load services:', error);
      setServices([]);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить услуги',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiFetch(`${BACKEND_URL}?endpoint=users`);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      setUsers([]);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await apiFetch(`${BACKEND_URL}?endpoint=customer-departments`);
      const data = await response.json();
      setDepartments(Array.isArray(data) ? data : data.departments || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
      setDepartments([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiFetch(`${BACKEND_URL}?endpoint=categories`);
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setCategories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.final_approver_id) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      const url = editingService
        ? `${BACKEND_URL}?endpoint=services&id=${editingService.id}`
        : `${BACKEND_URL}?endpoint=services`;

      const response = await apiFetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          intermediate_approver_id: parseInt(formData.final_approver_id),
          final_approver_id: parseInt(formData.final_approver_id),
          customer_department_id: formData.customer_department_id ? parseInt(formData.customer_department_id) : null,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: editingService ? 'Услуга обновлена' : 'Услуга создана',
        });
        setDialogOpen(false);
        resetForm();
        loadServices();
      } else {
        throw new Error('Failed to save service');
      }
    } catch (error) {
      console.error('Failed to save service:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить услугу',
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      final_approver_id: service.final_approver_id.toString(),
      customer_department_id: service.customer_department_id ? service.customer_department_id.toString() : '',
      category_id: service.category_id ? service.category_id.toString() : '',
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить эту услугу?')) return;

    try {
      const response = await apiFetch(`${BACKEND_URL}?endpoint=services&id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Услуга удалена',
        });
        loadServices();
      } else {
        throw new Error('Failed to delete service');
      }
    } catch (error) {
      console.error('Failed to delete service:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить услугу',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      final_approver_id: '',
      customer_department_id: '',
      category_id: '',
    });
    setEditingService(null);
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
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

      <div className="flex-1 lg:pl-[250px]">
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="lg:hidden p-2 hover:bg-accent rounded-lg"
              >
                <Icon name="Menu" size={20} />
              </button>
              <h1 className="text-2xl font-bold">Услуги заявок</h1>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" size={20} className="mr-2" />
                  Добавить услугу
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingService ? 'Редактировать услугу' : 'Новая услуга'}</DialogTitle>
                  <DialogDescription>
                    Заполните информацию об услуге заявки
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Название *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Название услуги"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Описание</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Описание услуги"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="approver">Согласующий *</Label>
                    <Select
                      value={formData.final_approver_id}
                      onValueChange={(value) => setFormData({ ...formData, final_approver_id: value })}
                    >
                      <SelectTrigger id="approver">
                        <SelectValue placeholder="Выберите согласующего" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.full_name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department">Отдел-заказчик</Label>
                    <Select
                      value={formData.customer_department_id}
                      onValueChange={(value) => setFormData({ ...formData, customer_department_id: value })}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Выберите отдел" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id.toString()}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Категория</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                      Отмена
                    </Button>
                    <Button type="submit">
                      {editingService ? 'Сохранить' : 'Создать'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="p-6">
          <Card>
            <CardHeader>
              <CardTitle>Список услуг</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Загрузка...</div>
              ) : services.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Нет услуг. Добавьте первую услугу.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Название</TableHead>
                      <TableHead>Описание</TableHead>
                      <TableHead>Согласующий</TableHead>
                      <TableHead>Отдел</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{service.description}</TableCell>
                        <TableCell>{service.final_approver_name}</TableCell>
                        <TableCell>{service.customer_department_name || '—'}</TableCell>
                        <TableCell>
                          {service.category_name ? (
                            <div className="flex items-center gap-2">
                              {service.category_icon && <span>{service.category_icon}</span>}
                              <span>{service.category_name}</span>
                            </div>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(service)}
                            >
                              <Icon name="Pencil" size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(service.id)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default TicketServices;
