import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface Priority {
  id: number;
  name: string;
  color: string;
}

interface Status {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  is_required: boolean;
}

interface Service {
  id: number;
  name: string;
  description: string;
}

interface TicketFormProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  formData: {
    title: string;
    description: string;
    category_id: string;
    priority_id: string;
    status_id: string;
    service_id: string;
    due_date: string;
    custom_fields: Record<string, string>;
  };
  setFormData: (data: any) => void;
  categories: Category[];
  priorities: Priority[];
  statuses: Status[];
  departments: Department[];
  customFields: CustomField[];
  services: Service[];
  handleSubmit: (e: React.FormEvent) => void;
}

const TicketForm = ({
  dialogOpen,
  setDialogOpen,
  formData,
  setFormData,
  categories,
  priorities,
  statuses,
  departments,
  customFields,
  services,
  handleSubmit,
}: TicketFormProps) => {
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 shadow-lg">
          <Icon name="Plus" size={20} />
          Создать заявку
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon name="TicketPlus" size={24} />
            Новая заявка
          </DialogTitle>
          <DialogDescription>
            Создайте новую заявку в техподдержку
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название заявки *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Краткое описание проблемы"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Подробное описание проблемы или запроса"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category_id">Категория</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Icon name={category.icon} size={16} />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority_id">Приоритет</Label>
              <Select
                value={formData.priority_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, priority_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите приоритет" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.id} value={priority.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: priority.color }}
                        />
                        {priority.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_id">Услуга</Label>
            <Select
              value={formData.service_id}
              onValueChange={(value) =>
                setFormData({ ...formData, service_id: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите услугу" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Желаемый срок</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
            />
          </div>

          {customFields.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h3 className="font-medium text-sm">Дополнительные поля</h3>
              {customFields.map((field) => (
                <div key={field.id} className="space-y-2">
                  <Label>
                    {field.name}
                    {field.is_required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  <Input
                    value={formData.custom_fields[field.id] || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        custom_fields: {
                          ...formData.custom_fields,
                          [field.id]: e.target.value,
                        },
                      })
                    }
                    required={field.is_required}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 gap-2">
              <Icon name="Send" size={18} />
              Создать заявку
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TicketForm;