import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SearchableSelect from '@/components/ui/searchable-select';
import {
  Category,
  Contractor,
  CustomerDepartment,
  FormDataValue,
  LegalEntity,
  Service,
} from './types';
import {
  buildCategoryOptions,
  buildContractorOptions,
  buildDepartmentOptions,
  buildLegalEntityOptions,
  buildServiceOptions,
  resolveServiceDescription,
} from './optionsBuilders';

interface PaymentFormFieldsGridProps {
  formData: FormDataValue;
  setFormData: (data: FormDataValue) => void;
  categories: Category[];
  legalEntities: LegalEntity[];
  contractors: Contractor[];
  customerDepartments: CustomerDepartment[];
  services: Service[];
  handleServiceChange: (value: string | undefined) => void;
}

const PaymentFormFieldsGrid = ({
  formData,
  setFormData,
  categories,
  legalEntities,
  contractors,
  customerDepartments,
  services,
  handleServiceChange,
}: PaymentFormFieldsGridProps) => {
  const serviceOptions = buildServiceOptions(services);
  const categoryOptions = buildCategoryOptions(categories);
  const legalEntityOptions = buildLegalEntityOptions(legalEntities);
  const contractorOptions = buildContractorOptions(contractors);
  const departmentOptions = buildDepartmentOptions(customerDepartments);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Сервис *</Label>
          <SearchableSelect
            options={serviceOptions}
            value={formData.service_id || ''}
            onValueChange={handleServiceChange}
            placeholder="Выберите сервис"
            searchPlaceholder="Поиск сервиса..."
            emptyText="Сервис не найден"
          />
        </div>
        <div className="space-y-2">
          <Label>Категория *</Label>
          <SearchableSelect
            options={categoryOptions}
            value={formData.category_id || ''}
            onValueChange={(v) => setFormData({ ...formData, category_id: v })}
            placeholder="Выберите категорию"
            searchPlaceholder="Поиск категории..."
            emptyText="Категория не найдена"
          />
        </div>
        <div className="space-y-2">
          <Label>Юридическое лицо</Label>
          <SearchableSelect
            options={legalEntityOptions}
            value={formData.legal_entity_id || ''}
            onValueChange={(v) => setFormData({ ...formData, legal_entity_id: v })}
            placeholder="Выберите юрлицо"
            searchPlaceholder="Поиск по названию или ИНН..."
            emptyText="Юрлицо не найдено"
          />
        </div>
        <div className="space-y-2">
          <Label>Контрагент</Label>
          <SearchableSelect
            options={contractorOptions}
            value={formData.contractor_id || ''}
            onValueChange={(v) => setFormData({ ...formData, contractor_id: v })}
            placeholder="Выберите контрагента"
            searchPlaceholder="Поиск по названию или ИНН..."
            emptyText="Контрагент не найден"
          />
        </div>
        <div className="space-y-2">
          <Label>Отдел-заказчик</Label>
          <SearchableSelect
            options={departmentOptions}
            value={formData.department_id || ''}
            onValueChange={(v) => setFormData({ ...formData, department_id: v })}
            placeholder="Выберите отдел"
            searchPlaceholder="Поиск отдела..."
            emptyText="Отдел не найден"
          />
        </div>
        {formData.service_id && (
          <div className="space-y-2">
            <Label>Описание сервиса</Label>
            <Input
              value={resolveServiceDescription(services, formData.service_id)}
              readOnly
              disabled
              className="bg-muted/50 cursor-not-allowed"
              placeholder="Описание сервиса"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="amount">Сумма *</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="pr-12"
              required
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              руб.
            </span>
          </div>
          {formData.amount && parseFloat(formData.amount) > 0 && (
            <p className="text-xs text-muted-foreground">
              {parseFloat(formData.amount).toLocaleString('ru-RU', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} руб.
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice_number">Номер счёта</Label>
          <Input
            id="invoice_number"
            value={formData.invoice_number || ''}
            onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
            placeholder="Введите номер счёта"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="invoice_date">Дата счёта</Label>
          <Input
            id="invoice_date"
            type="date"
            value={formData.invoice_date || ''}
            onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
            min="2000-01-01"
            max="2099-12-31"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Назначение платежа *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Описание платежа"
          required
        />
      </div>
    </>
  );
};

export default PaymentFormFieldsGrid;