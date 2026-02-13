import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import InvoiceUpload from './InvoiceUpload';
import FUNC2URL from '@/../backend/func2url.json';

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface LegalEntity {
  id: number;
  name: string;
  inn: string;
  kpp: string;
  address: string;
}

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  options: string;
}

interface Contractor {
  id: number;
  name: string;
  inn: string;
}

interface CustomerDepartment {
  id: number;
  name: string;
  description: string;
}

interface Service {
  id: number;
  name: string;
  description: string;
  intermediate_approver_id: number;
  final_approver_id: number;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
}

interface PaymentFormProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  formData: Record<string, string | undefined>;
  setFormData: (data: Record<string, string | undefined>) => void;
  categories: Category[];
  legalEntities: LegalEntity[];
  contractors: Contractor[];
  customerDepartments: CustomerDepartment[];
  customFields: CustomField[];
  services: Service[];
  handleSubmit: (e: React.FormEvent) => void;
  invoicePreview: string | null;
  isProcessingInvoice: boolean;
  handleFileSelect: (file: File | null) => void;
  handleExtractData: () => void;
  fileName?: string;
  fileType?: string;
}

const PaymentForm = ({
  dialogOpen,
  setDialogOpen,
  formData,
  setFormData,
  categories,
  legalEntities,
  contractors,
  customerDepartments,
  customFields,
  services,
  handleSubmit,
  invoicePreview,
  isProcessingInvoice,
  handleFileSelect,
  handleExtractData,
  fileName,
  fileType,
}: PaymentFormProps) => {
  const { hasPermission } = useAuth();

  const resolveServiceName = (id?: string) => {
    if (!id) return '';
    const s = services.find(x => x.id.toString() === id);
    return s?.name || '';
  };

  const resolveCategoryName = (id?: string) => {
    if (!id) return '';
    const c = categories.find(x => x.id.toString() === id);
    return c?.name || '';
  };

  const resolveLegalEntityName = (id?: string) => {
    if (!id) return '';
    const e = legalEntities.find(x => x.id.toString() === id);
    return e?.name || '';
  };

  const resolveContractorName = (id?: string) => {
    if (!id) return '';
    const c = contractors.find(x => x.id.toString() === id);
    return c?.name || '';
  };

  const resolveDepartmentName = (id?: string) => {
    if (!id) return '';
    const d = customerDepartments.find(x => x.id.toString() === id);
    return d?.name || '';
  };

  const resolveServiceDescription = (id?: string) => {
    if (!id) return '';
    const s = services.find(x => x.id.toString() === id);
    return s?.description || '';
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-2">История платежей</h1>
        <p className="text-sm md:text-base text-muted-foreground">Все операции по IT расходам</p>
      </div>
      {hasPermission('payments', 'create') && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto">
              <Icon name="Plus" size={18} />
              <span>Добавить платёж</span>
            </Button>
          </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Новый платёж</DialogTitle>
            <DialogDescription>
              Загрузите счёт — данные заполнятся автоматически
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="md:col-span-2">
              <InvoiceUpload
                onFileSelect={handleFileSelect}
                onExtractData={handleExtractData}
                isProcessing={isProcessingInvoice}
                previewUrl={invoicePreview}
                fileName={fileName}
                fileType={fileType}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Сервис *</Label>
                <Input
                  value={resolveServiceName(formData.service_id)}
                  readOnly
                  className="bg-muted/50 cursor-default"
                  placeholder="Заполнится из счёта"
                />
                {formData.service_id && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setFormData({ ...formData, service_id: undefined, service_description: '' })}
                  >
                    ✕ очистить
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Категория *</Label>
                <Input
                  value={resolveCategoryName(formData.category_id)}
                  readOnly
                  className="bg-muted/50 cursor-default"
                  placeholder="Заполнится из счёта"
                />
                {formData.category_id && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setFormData({ ...formData, category_id: undefined })}
                  >
                    ✕ очистить
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Юридическое лицо</Label>
                <Input
                  value={resolveLegalEntityName(formData.legal_entity_id)}
                  readOnly
                  className="bg-muted/50 cursor-default"
                  placeholder="Заполнится из счёта"
                />
                {formData.legal_entity_id && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setFormData({ ...formData, legal_entity_id: undefined })}
                  >
                    ✕ очистить
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Контрагент</Label>
                <Input
                  value={resolveContractorName(formData.contractor_id)}
                  readOnly
                  className="bg-muted/50 cursor-default"
                  placeholder="Заполнится из счёта"
                />
                {formData.contractor_id && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setFormData({ ...formData, contractor_id: undefined })}
                  >
                    ✕ очистить
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <Label>Отдел-заказчик</Label>
                <Input
                  value={resolveDepartmentName(formData.department_id)}
                  readOnly
                  className="bg-muted/50 cursor-default"
                  placeholder="Заполнится из счёта"
                />
                {formData.department_id && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => setFormData({ ...formData, department_id: undefined })}
                  >
                    ✕ очистить
                  </button>
                )}
              </div>
              {formData.service_id && (
                <div className="space-y-2">
                  <Label>Описание сервиса</Label>
                  <Input
                    value={resolveServiceDescription(formData.service_id)}
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
                      maximumFractionDigits: 2 
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
              <Label htmlFor="description">Назначение</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Описание платежа"
                required
              />
            </div>
            
            {customFields.length > 0 && (
              <div className="border-t border-white/10 pt-4 space-y-4">
                <h4 className="text-sm font-semibold text-muted-foreground">Дополнительные поля</h4>
                {customFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={`custom_field_${field.id}`}>{field.name}</Label>
                    {field.field_type === 'text' && (
                      <Input
                        id={`custom_field_${field.id}`}
                        value={formData[`custom_field_${field.id}`] || ''}
                        onChange={(e) => setFormData({ ...formData, [`custom_field_${field.id}`]: e.target.value })}
                        placeholder={`Введите ${field.name.toLowerCase()}`}
                      />
                    )}
                    {(field.field_type === 'select' || field.field_type === 'toggle') && (
                      <Input
                        id={`custom_field_${field.id}`}
                        value={formData[`custom_field_${field.id}`] || ''}
                        readOnly
                        className="bg-muted/50 cursor-default"
                        placeholder="Заполнится автоматически"
                      />
                    )}
                    {field.field_type === 'file' && (
                      <div>
                        <Input
                          id={`custom_field_${field.id}`}
                          type="file"
                          accept={field.options ? field.options.split(',').map(ext => `.${ext.trim()}`).join(',') : '*'}
                          className="cursor-pointer file:mr-4 file:py-2.5 file:px-5 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer file:shadow-sm"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            
                            const allowedExtensions = field.options?.split(',').map(ext => ext.trim().toLowerCase()) || [];
                            const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
                            
                            if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExtension)) {
                              alert(`Недопустимый формат файла. Разрешены: ${field.options}`);
                              e.target.value = '';
                              return;
                            }
                            
                            const reader = new FileReader();
                            reader.onload = async () => {
                              const base64 = (reader.result as string).split(',')[1];
                              
                              try {
                                const response = await fetch(FUNC2URL['invoice-ocr'], {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    file: base64,
                                    fileName: file.name,
                                    contentType: file.type
                                  })
                                });
                                
                                const data = await response.json();
                                if (data.url) {
                                  setFormData({ ...formData, [`custom_field_${field.id}`]: data.url });
                                }
                              } catch (err) {
                                console.error('Upload failed:', err);
                                alert('Ошибка загрузки файла');
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        {formData[`custom_field_${field.id}`] && (
                          <p className="text-xs text-green-500 mt-1">Файл загружен</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <Button type="submit" className="w-full">
              Добавить
            </Button>
          </form>
        </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PaymentForm;
