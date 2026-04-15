import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import SearchableSelect from '@/components/ui/searchable-select';

interface User {
  id: number;
  full_name: string;
  role: string;
}

interface CustomerDepartment {
  id: number;
  name: string;
  description?: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface LegalEntity {
  id: number;
  name: string;
  inn?: string;
}

interface Contractor {
  id: number;
  name: string;
  inn?: string;
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
  legal_entity_id?: number;
  legal_entity_name?: string;
  contractor_id?: number;
  contractor_name?: string;
  created_at: string;
}

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingService: Service | null;
  formData: {
    name: string;
    description: string;
    intermediate_approver_id?: string;
    final_approver_id: string;
    customer_department_id: string;
    category_id: string;
    legal_entity_id: string;
    contractor_id: string;
    [key: string]: string | undefined;
  };
  setFormData: (data: ServiceFormDialogProps['formData']) => void;
  users: User[];
  departments: CustomerDepartment[];
  categories: Category[];
  legalEntities: LegalEntity[];
  contractors: Contractor[];
  onSubmit: (e: React.FormEvent) => void;
}

const ServiceFormDialog = ({
  open,
  onOpenChange,
  editingService,
  formData,
  setFormData,
  users,
  departments,
  categories,
  legalEntities,
  contractors,
  onSubmit,
}: ServiceFormDialogProps) => {
  const userOptions = users.map((u) => ({
    value: u.id.toString(),
    label: u.full_name,
    sublabel: u.role || undefined,
  }));

  const categoryOptions = categories.map((c) => ({
    value: c.id.toString(),
    label: c.name,
    icon: c.icon || undefined,
  }));

  const departmentOptions = departments.map((d) => ({
    value: d.id.toString(),
    label: d.name,
    sublabel: d.description || undefined,
  }));

  const legalEntityOptions = legalEntities.map((e) => ({
    value: e.id.toString(),
    label: e.name,
    sublabel: e.inn ? `ИНН: ${e.inn}` : undefined,
  }));

  const contractorOptions = contractors.map((c) => ({
    value: c.id.toString(),
    label: c.name,
    sublabel: c.inn ? `ИНН: ${c.inn}` : undefined,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingService ? 'Редактировать сервис' : 'Создать сервис'}
          </DialogTitle>
          <DialogDescription>
            Укажите название сервиса и согласующих лиц
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Название *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Например: AWS Cloud Services"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Краткое описание сервиса"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Категория сервиса</Label>
            <SearchableSelect
              options={categoryOptions}
              value={formData.category_id || ''}
              onValueChange={(v) => setFormData({ ...formData, category_id: v || '' })}
              placeholder="Выберите категорию"
              searchPlaceholder="Поиск категории..."
              emptyText="Категория не найдена"
            />
          </div>

          <div className="space-y-2">
            <Label>Отдел-заказчик</Label>
            <SearchableSelect
              options={departmentOptions}
              value={formData.customer_department_id || ''}
              onValueChange={(v) => setFormData({ ...formData, customer_department_id: v || '' })}
              placeholder="Выберите отдел"
              searchPlaceholder="Поиск отдела..."
              emptyText="Отдел не найден"
            />
          </div>

          <div className="space-y-2">
            <Label>Согласующее лицо (CEO)</Label>
            <SearchableSelect
              options={userOptions}
              value={formData.final_approver_id || ''}
              onValueChange={(v) => setFormData({ ...formData, final_approver_id: v || '' })}
              placeholder="Выберите пользователя"
              searchPlaceholder="Поиск по имени..."
              emptyText="Пользователь не найден"
            />
          </div>

          <div className="space-y-2">
            <Label>Юридическое лицо</Label>
            <SearchableSelect
              options={legalEntityOptions}
              value={formData.legal_entity_id || ''}
              onValueChange={(v) => setFormData({ ...formData, legal_entity_id: v || '' })}
              placeholder="Выберите юридическое лицо"
              searchPlaceholder="Поиск по названию или ИНН..."
              emptyText="Юрлицо не найдено"
            />
          </div>

          <div className="space-y-2">
            <Label>Контрагент</Label>
            <SearchableSelect
              options={contractorOptions}
              value={formData.contractor_id || ''}
              onValueChange={(v) => setFormData({ ...formData, contractor_id: v || '' })}
              placeholder="Выберите контрагента"
              searchPlaceholder="Поиск по названию или ИНН..."
              emptyText="Контрагент не найден"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit">
              {editingService ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceFormDialog;