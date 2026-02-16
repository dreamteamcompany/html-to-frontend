import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import { useCrudPage } from '@/hooks/useCrudPage';
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
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<CustomerDepartment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  const {
    items: services,
    loading,
    dialogOpen,
    setDialogOpen,
    editingItem: editingService,
    formData,
    setFormData,
    loadData: loadServices,
    handleEdit: handleEditBase,
    handleSubmit: handleSubmitBase,
    handleDelete: handleDeleteBase,
  } = useCrudPage<Service>({
    endpoint: 'services',
    initialFormData: {
      name: '',
      description: '',
      intermediate_approver_id: 0,
      final_approver_id: 0,
      customer_department_id: undefined,
      category_id: undefined,
    },
  });

  useEffect(() => {
    loadServices();
    loadUsers();
    loadDepartments();
    loadCategories();
  }, [loadServices]);

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

    // Custom validation for Services
    if (!formData.name || !formData.final_approver_id) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      await handleSubmitBase(e);
      toast({
        title: 'Успешно',
        description: editingService ? 'Сервис обновлён' : 'Сервис создан',
      });
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
    handleEditBase(service);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить этот сервис?')) return;

    try {
      await handleDeleteBase(id);
      toast({
        title: 'Успешно',
        description: 'Сервис удалён',
      });
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
      intermediate_approver_id: 0,
      final_approver_id: 0,
      customer_department_id: undefined,
      category_id: undefined,
    });
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