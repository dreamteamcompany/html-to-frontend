import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import { getApiUrl } from '@/config/api';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { useToast } from '@/hooks/use-toast';
import ServicesHeader from '@/components/services/ServicesHeader';
import ServiceFormDialog from '@/components/services/ServiceFormDialog';
import ServicesTable from '@/components/services/ServicesTable';

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

const Services = () => {
  const { hasPermission } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<CustomerDepartment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const { toast } = useToast();

  const {
    menuOpen,
    setMenuOpen,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSidebarTouch();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    final_approver_id: '',
    customer_department_id: '',
    category_id: '',
  });

  useEffect(() => {
    loadServices();
    loadUsers();
    loadDepartments();
    loadCategories();
  }, []);

  const loadServices = async () => {
    try {
      const response = await apiFetch(getApiUrl('services'));
      const data = await response.json();
      setServices(data.services || []);
    } catch (error) {
      console.error('Failed to load services:', error);
      setServices([]);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сервисы',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await apiFetch(getApiUrl('approvers'));
      const data = await response.json();
      setUsers(data.approvers || []);
    } catch (error) {
      console.error('Failed to load approvers:', error);
      setUsers([]);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await apiFetch(getApiUrl('customer-departments'));
      const data = await response.json();
      setDepartments(Array.isArray(data) ? data : data.departments || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
      setDepartments([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiFetch(getApiUrl('categories'));
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
      const url = getApiUrl('services');
      const payload: Record<string, unknown> = {
        name: formData.name,
        description: formData.description,
        intermediate_approver_id: parseInt(formData.final_approver_id),
        final_approver_id: parseInt(formData.final_approver_id),
        customer_department_id: formData.customer_department_id ? parseInt(formData.customer_department_id) : null,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
      };

      if (editingService) {
        payload.id = editingService.id;
      }

      const response = await apiFetch(url, {
        method: editingService ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: editingService ? 'Сервис обновлён' : 'Сервис создан',
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
        description: 'Не удалось сохранить сервис',
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
    if (!confirm('Удалить этот сервис?')) return;

    try {
      const response = await apiFetch(getApiUrl('services'), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Сервис удалён',
        });
        loadServices();
      } else {
        throw new Error('Failed to delete service');
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

  const handleCreateClick = () => {
    setDialogOpen(true);
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

      <main className="lg:ml-[250px] p-4 md:p-6 lg:p-[30px] min-h-screen flex-1 overflow-x-hidden max-w-full">
        <ServicesHeader
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onCreateClick={handleCreateClick}
        />

        <ServiceFormDialog
          open={dialogOpen}
          onOpenChange={handleDialogClose}
          editingService={editingService}
          formData={formData}
          setFormData={setFormData}
          users={users}
          departments={departments}
          categories={categories}
          onSubmit={handleSubmit}
        />

        <ServicesTable
          services={services}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>
    </div>
  );
};

export default Services;