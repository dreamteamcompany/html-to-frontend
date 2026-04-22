import InvoiceUpload from '../InvoiceUpload';

interface PaymentFormInvoiceSectionProps {
  handleFileSelect: (file: File | null) => void;
  handleExtractData: () => void;
  isProcessingInvoice: boolean;
  isUploadingInvoice?: boolean;
  invoicePreview: string | null;
  fileName?: string;
  fileType?: string;
  invoiceFileUrl?: string;
}

const PaymentFormInvoiceSection = ({
  handleFileSelect,
  handleExtractData,
  isProcessingInvoice,
  isUploadingInvoice,
  invoicePreview,
  fileName,
  fileType,
  invoiceFileUrl,
}: PaymentFormInvoiceSectionProps) => (
  <div className="col-span-2">
    <InvoiceUpload
      onFileSelect={handleFileSelect}
      onExtractData={handleExtractData}
      isProcessing={isProcessingInvoice}
      isUploading={isUploadingInvoice}
      previewUrl={invoicePreview}
      fileName={fileName}
      fileType={fileType}
      existingFileUrl={!invoicePreview ? invoiceFileUrl : undefined}
    />
  </div>
);

export default PaymentFormInvoiceSection;
