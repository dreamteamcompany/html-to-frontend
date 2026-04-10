import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface CustomField {
  id: number;
  name: string;
  field_type: string;
  value: string;
}

export interface PaymentDocument {
  id: number;
  payment_id: number;
  file_name: string;
  file_url: string;
  document_type: string;
  uploaded_at: string;
}

export interface Payment {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  description: string;
  amount: number;
  payment_date: string;
  legal_entity_id?: number;
  legal_entity_name?: string;
  status?: string;
  created_by?: number;
  created_by_name?: string;
  service_id?: number;
  service_name?: string;
  contractor_name?: string;
  contractor_id?: number;
  department_name?: string;
  department_id?: number;
  invoice_number?: string;
  invoice_date?: string;
  invoice_file_url?: string;
  invoice_file_uploaded_at?: string;
  created_at?: string;
  submitted_at?: string;
  ceo_approved_at?: string;
  tech_director_approved_at?: string;
  custom_fields?: CustomField[];
  documents?: PaymentDocument[];
}

export interface Department {
  id: number;
  name: string;
  description?: string;
}

interface ApprovedPaymentInfoProps {
  payment: Payment;
  isAdmin: boolean;
  canRevoke: boolean;
  currentDeptName: string | undefined;
  isEditingDept: boolean;
  isSavingDept: boolean;
  selectedDeptId: string;
  departments: Department[];
  onStartEditDept: () => void;
  onCancelEditDept: () => void;
  onSaveDept: () => void;
  onSelectDept: (val: string) => void;
  onRevokeClick: () => void;
}

const ApprovedPaymentInfo = ({
  payment,
  isAdmin,
  canRevoke,
  currentDeptName,
  isEditingDept,
  isSavingDept,
  selectedDeptId,
  departments,
  onStartEditDept,
  onCancelEditDept,
  onSaveDept,
  onSelectDept,
  onRevokeClick,
}: ApprovedPaymentInfoProps) => {
  return (
    <div className="w-full lg:w-1/2 lg:border-r border-border overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-3 sm:space-y-4">
      <div className="flex items-start gap-3 sm:gap-4 min-w-0">
        <div className="bg-primary/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
          <Icon name={payment.category_icon} size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 break-anywhere">{payment.category_name}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-primary">{payment.amount.toLocaleString('ru-RU')} ₽</p>
        </div>
      </div>

      {payment.description && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Описание</p>
          <p className="font-semibold text-foreground break-anywhere">{payment.description}</p>
        </div>
      )}

      {payment.category_name && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Категория</p>
          <div className="flex items-center gap-2 font-semibold text-foreground min-w-0">
            <Icon name={payment.category_icon || 'Tag'} size={18} className="flex-shrink-0" />
            <span className="break-anywhere">{payment.category_name}</span>
          </div>
        </div>
      )}

      {payment.legal_entity_name && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Юридическое лицо</p>
          <p className="font-semibold text-foreground break-anywhere">{payment.legal_entity_name}</p>
        </div>
      )}

      {payment.contractor_name && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Контрагент</p>
          <p className="font-semibold text-foreground break-anywhere">{payment.contractor_name}</p>
        </div>
      )}

      {(currentDeptName || isAdmin) && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Отдел-заказчик</p>
            {isAdmin && !isEditingDept && (
              <button
                onClick={onStartEditDept}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <Icon name="Pencil" size={12} />
                Изменить
              </button>
            )}
          </div>
          {isEditingDept ? (
            <div className="flex items-center gap-2">
              <Select value={selectedDeptId} onValueChange={onSelectDept}>
                <SelectTrigger className="flex-1 h-8 text-sm">
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Не указан —</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" className="h-8 px-3" onClick={onSaveDept} disabled={isSavingDept}>
                {isSavingDept ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Check" size={14} />}
              </Button>
              <Button size="sm" variant="ghost" className="h-8 px-2" onClick={onCancelEditDept} disabled={isSavingDept}>
                <Icon name="X" size={14} />
              </Button>
            </div>
          ) : (
            <p className="font-semibold text-foreground break-anywhere">{currentDeptName || <span className="text-foreground/50 italic text-sm">Не указан</span>}</p>
          )}
        </div>
      )}

      {payment.service_name && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Сервис</p>
          <p className="font-semibold text-foreground break-anywhere">{payment.service_name}</p>
        </div>
      )}

      {payment.invoice_number && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Номер счёта</p>
          <p className="font-semibold text-foreground break-anywhere">{payment.invoice_number}</p>
        </div>
      )}

      {payment.created_by_name && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Создал заявку</p>
          <p className="font-semibold text-foreground break-anywhere">{payment.created_by_name}</p>
        </div>
      )}

      {payment.custom_fields && payment.custom_fields.length > 0 && (
        <>
          {payment.custom_fields.map((field) => (
            <div key={field.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">{field.name}</p>
              {field.field_type === 'file' && field.value ? (
                <div className="rounded-lg border border-border p-3 bg-primary/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon name="FileText" size={16} className="text-primary flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground break-anywhere">
                        {field.value.split('/').pop()?.split('_').slice(2).join('_') || 'Файл'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={field.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <Icon name="Eye" size={14} />
                        Просмотр
                      </a>
                      <a
                        href={field.value}
                        download
                        className="flex items-center gap-1 text-xs font-semibold text-foreground/70 hover:text-foreground"
                      >
                        <Icon name="Download" size={14} />
                        Скачать
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="font-semibold text-foreground break-anywhere">{field.value}</p>
              )}
            </div>
          ))}
        </>
      )}

      {canRevoke && (
        <div className="pt-4 border-t border-border">
          <Button
            variant="destructive"
            className="w-full"
            onClick={onRevokeClick}
          >
            <Icon name="XCircle" size={18} />
            Отозвать платеж
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApprovedPaymentInfo;