import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SearchableSelect from '@/components/ui/searchable-select';
import { Category, LegalEntity, Contractor, Department, Service, CustomFieldDef } from './editPaymentTypes';

interface EditPaymentFieldsProps {
  formData: Record<string, string | undefined>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, string | undefined>>>;
  categories: Category[];
  legalEntities: LegalEntity[];
  contractors: Contractor[];
  departments: Department[];
  services: Service[];
  customFields: CustomFieldDef[];
}

const EditPaymentFields = ({
  formData,
  setFormData,
  categories,
  legalEntities,
  contractors,
  departments,
  services,
  customFields,
}: EditPaymentFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service_id">Сервис *</Label>
          <SearchableSelect
            options={services.map(s => ({ value: s.id.toString(), label: s.name }))}
            value={formData.service_id || ''}
            onChange={(value) => {
              const service = services.find(s => s.id.toString() === value);
              setFormData(prev => ({
                ...prev,
                service_id: value,
                category_id: service?.category_id?.toString() || prev.category_id,
              }));
            }}
            placeholder="Выберите сервис"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">Категория *</Label>
          <SearchableSelect
            options={categories.map(c => ({ value: c.id.toString(), label: c.name }))}
            value={formData.category_id || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
            placeholder="Выберите категорию"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="legal_entity_id">Юридическое лицо</Label>
          <SearchableSelect
            options={legalEntities.map(le => ({ value: le.id.toString(), label: le.name }))}
            value={formData.legal_entity_id || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, legal_entity_id: value }))}
            placeholder="Выберите юр. лицо"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contractor_id">Контрагент</Label>
          <SearchableSelect
            options={contractors.map(c => ({ value: c.id.toString(), label: c.name }))}
            value={formData.contractor_id || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, contractor_id: value }))}
            placeholder="Выберите контрагента"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="department_id">Отдел-заказчик</Label>
          <SearchableSelect
            options={departments.map(d => ({ value: d.id.toString(), label: d.name }))}
            value={formData.department_id || ''}
            onChange={(value) => setFormData(prev => ({ ...prev, department_id: value }))}
            placeholder="Выберите отдел"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Сумма (₽) *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoice_number">Номер счёта</Label>
          <Input
            id="invoice_number"
            value={formData.invoice_number || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
            placeholder="Введите номер"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoice_date">Дата счёта</Label>
          <Input
            id="invoice_date"
            type="date"
            value={formData.invoice_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label htmlFor="payment_date">Дата платежа *</Label>
          <Input
            id="payment_date"
            type="date"
            value={formData.payment_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Описание (назначение платежа) *</Label>
        <Input
          id="description"
          value={formData.description || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Введите описание"
          required
        />
      </div>

      {customFields.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-sm text-muted-foreground">Дополнительные поля</h3>
          {customFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={`custom_field_${field.id}`}>{field.name}</Label>
              <Input
                id={`custom_field_${field.id}`}
                value={formData[`custom_field_${field.id}`] || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, [`custom_field_${field.id}`]: e.target.value }))}
                placeholder={`Введите ${field.name.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default EditPaymentFields;
