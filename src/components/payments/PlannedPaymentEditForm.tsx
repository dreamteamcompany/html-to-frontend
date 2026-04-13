import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  PlannedPayment, Category, LegalEntity, Contractor, Department, Service,
} from './PlannedPaymentTypes';
import { SelectField } from './PlannedPaymentSharedFields';

interface PlannedPaymentEditFormProps {
  editData: PlannedPayment;
  setEditData: (data: PlannedPayment) => void;
  categories: Category[];
  legalEntities: LegalEntity[];
  contractors: Contractor[];
  departments: Department[];
  services: Service[];
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (ev: React.FormEvent) => void;
}

const PlannedPaymentEditForm = ({
  editData: e, setEditData, categories, legalEntities, contractors, departments, services,
  isSaving, onCancel, onSubmit,
}: PlannedPaymentEditFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4 mt-1">

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SelectField
        label="Категория"
        required
        value={e.category_id}
        onChange={(val) => setEditData({ ...e, category_id: val ?? e.category_id })}
        options={categories}
      />
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Сумма (₽) *</label>
        <input
          type="number" step="0.01" required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          value={e.amount}
          onChange={(ev) => setEditData({ ...e, amount: Number(ev.target.value) })}
        />
      </div>
    </div>

    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground">Назначение *</label>
      <input
        type="text" required
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
        value={e.description}
        onChange={(ev) => setEditData({ ...e, description: ev.target.value })}
      />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Дата платежа *</label>
        <input
          type="date" required
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          value={e.planned_date?.slice(0, 10) || ''}
          onChange={(ev) => setEditData({ ...e, planned_date: ev.target.value })}
        />
      </div>
      <SelectField
        label="Юридическое лицо"
        value={e.legal_entity_id}
        onChange={(val) => setEditData({ ...e, legal_entity_id: val })}
        options={legalEntities}
      />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SelectField
        label="Контрагент"
        value={e.contractor_id}
        onChange={(val) => setEditData({ ...e, contractor_id: val })}
        options={contractors}
      />
      <SelectField
        label="Отдел-заказчик"
        value={e.department_id}
        onChange={(val) => setEditData({ ...e, department_id: val })}
        options={departments}
      />
    </div>

    <SelectField
      label="Сервис"
      value={e.service_id}
      onChange={(val) => setEditData({ ...e, service_id: val })}
      options={services}
    />

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Номер счёта</label>
        <input
          type="text"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          value={e.invoice_number || ''}
          onChange={(ev) => setEditData({ ...e, invoice_number: ev.target.value })}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Дата счёта</label>
        <input
          type="date"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
          value={e.invoice_date?.slice(0, 10) || ''}
          onChange={(ev) => setEditData({ ...e, invoice_date: ev.target.value })}
        />
      </div>
    </div>

    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 space-y-3">
      <div className="flex items-center gap-2">
        <Icon name="Repeat" size={15} className="text-blue-600 dark:text-blue-400" />
        <span className="text-sm text-blue-700 dark:text-blue-200 font-medium">Настройки повторения</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">Тип повторения</label>
          <select
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            value={e.recurrence_type || 'once'}
            onChange={(ev) => setEditData({
              ...e,
              recurrence_type: ev.target.value,
              recurrence_end_date: ev.target.value === 'once' ? undefined : e.recurrence_end_date,
            })}
          >
            <option value="once">Однократно</option>
            <option value="weekly">Еженедельно</option>
            <option value="monthly">Ежемесячно</option>
            <option value="yearly">Ежегодно</option>
          </select>
        </div>
        {e.recurrence_type && e.recurrence_type !== 'once' && (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Дата окончания</label>
            <input
              type="date"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              value={e.recurrence_end_date?.slice(0, 10) || ''}
              onChange={(ev) => setEditData({ ...e, recurrence_end_date: ev.target.value })}
            />
          </div>
        )}
      </div>
    </div>

    <div className="flex gap-3 justify-end pt-1">
      <Button type="button" variant="outline" onClick={onCancel}>
        Отмена
      </Button>
      <Button type="submit" className="bg-blue-500 hover:bg-blue-600 gap-2" disabled={isSaving}>
        {isSaving && <Icon name="Loader2" size={14} className="animate-spin" />}
        Сохранить
      </Button>
    </div>
  </form>
);

export default PlannedPaymentEditForm;