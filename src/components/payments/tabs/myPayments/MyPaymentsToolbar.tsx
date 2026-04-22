import Icon from '@/components/ui/icon';
import PaymentForm from '@/components/payments/PaymentForm';
import CashPaymentForm from '@/components/payments/CashPaymentForm';
import PlannedPaymentsModal from '@/components/payments/PlannedPaymentsModal';
import { exportTabPaymentsToExcel } from '@/utils/exportExcel';
import type { Payment } from '@/types/payment';
import type {
  Category,
  Contractor,
  CustomerDepartment,
  CustomField,
  FormDataValue,
  LegalEntity,
  Service,
} from '@/components/payments/paymentForm/types';

interface MyPaymentsToolbarProps {
  // PaymentForm props
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

  // CashPayment
  handlePaymentSaved: () => void;

  // Excel export
  loading: boolean;
  paymentsCount: number;
  filteredPayments: Payment[];
}

const MyPaymentsToolbar = ({
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
  handlePaymentSaved,
  loading,
  paymentsCount,
  filteredPayments,
}: MyPaymentsToolbarProps) => (
  <div className="flex flex-wrap items-center gap-3">
    <PaymentForm
      dialogOpen={dialogOpen}
      setDialogOpen={setDialogOpen}
      formData={formData}
      setFormData={setFormData}
      categories={categories}
      legalEntities={legalEntities}
      contractors={contractors}
      customerDepartments={customerDepartments}
      customFields={customFields}
      services={services}
      handleSubmit={handleSubmit}
      invoicePreview={invoicePreview}
      isProcessingInvoice={isProcessingInvoice}
      isUploadingInvoice={isUploadingInvoice}
      handleFileSelect={handleFileSelect}
      handleExtractData={handleExtractData}
      fileName={fileName}
      fileType={fileType}
      invoiceFileUrl={invoiceFileUrl}
    />

    <CashPaymentForm
      categories={categories}
      customerDepartments={customerDepartments}
      services={services}
      onSuccess={handlePaymentSaved}
    />

    <PlannedPaymentsModal />
    {!loading && paymentsCount > 0 && (
      <button
        onClick={() => exportTabPaymentsToExcel(filteredPayments, 'Мои платежи', 'Мои_платежи')}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-foreground/5 transition-colors text-sm font-semibold text-foreground whitespace-nowrap"
      >
        <Icon name="Download" size={16} />
        Выгрузить Excel
      </button>
    )}
  </div>
);

export default MyPaymentsToolbar;
