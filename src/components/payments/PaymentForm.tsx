import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import PaymentFormInvoiceSection from './paymentForm/PaymentFormInvoiceSection';
import PaymentFormFieldsGrid from './paymentForm/PaymentFormFieldsGrid';
import PaymentFormCustomFields from './paymentForm/PaymentFormCustomFields';
import {
  Category,
  Contractor,
  CustomerDepartment,
  CustomField,
  FormDataValue,
  LegalEntity,
  Service,
} from './paymentForm/types';

interface PaymentFormProps {
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  formData: FormDataValue;
  setFormData: (data: FormDataValue) => void;
  categories: Category[];
  legalEntities: LegalEntity[];
  contractors: Contractor[];
  customerDepartments: CustomerDepartment[];
  customFields: CustomField[];
  services: Service[];
  handleSubmit: (e: React.FormEvent) => void;
  invoicePreview: string | null;
  isProcessingInvoice: boolean;
  isUploadingInvoice?: boolean;
  handleFileSelect: (file: File | null) => void;
  handleExtractData: () => void;
  fileName?: string;
  fileType?: string;
  invoiceFileUrl?: string;
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
  isUploadingInvoice,
  handleFileSelect,
  handleExtractData,
  fileName,
  fileType,
  invoiceFileUrl,
}: PaymentFormProps) => {
  const { hasPermission } = useAuth();

  const handleServiceChange = (value: string | undefined) => {
    if (!value) {
      setFormData({ ...formData, service_id: '', service_description: '' });
      return;
    }
    const service = services.find((s) => s.id.toString() === value);
    const updates: FormDataValue = {
      ...formData,
      service_id: value || '',
      service_description: service?.description || '',
      description: service?.description || formData.description || '', // Дублируем в назначение платежа
    };

    // Автозаполнение связанных полей
    if (service?.category_id) {
      updates.category_id = service.category_id.toString();
    }
    if (service?.legal_entity_id) {
      updates.legal_entity_id = service.legal_entity_id.toString();
    }
    if (service?.contractor_id) {
      updates.contractor_id = service.contractor_id.toString();
    }
    if (service?.customer_department_id) {
      updates.department_id = service.customer_department_id.toString();
    }

    setFormData(updates);
  };

  if (!hasPermission('payments', 'create')) return null;

  return (
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
            Загрузите счёт для автозаполнения или выберите данные вручную
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentFormInvoiceSection
            handleFileSelect={handleFileSelect}
            handleExtractData={handleExtractData}
            isProcessingInvoice={isProcessingInvoice}
            isUploadingInvoice={isUploadingInvoice}
            invoicePreview={invoicePreview}
            fileName={fileName}
            fileType={fileType}
            invoiceFileUrl={invoiceFileUrl}
          />
          <PaymentFormFieldsGrid
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            legalEntities={legalEntities}
            contractors={contractors}
            customerDepartments={customerDepartments}
            services={services}
            handleServiceChange={handleServiceChange}
          />
          <PaymentFormCustomFields
            customFields={customFields}
            formData={formData}
            setFormData={setFormData}
          />
          <Button type="submit" className="w-full">
            Добавить
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;
