import InvoiceUpload from '../InvoiceUpload';
import AdditionalInvoiceFiles from './AdditionalInvoiceFiles';

interface PaymentFormInvoiceSectionProps {
  handleFileSelect: (file: File | null) => void;
  handleExtractData: () => void;
  isProcessingInvoice: boolean;
  isUploadingInvoice?: boolean;
  invoicePreview: string | null;
  fileName?: string;
  fileType?: string;
  invoiceFileUrl?: string;
  additionalFiles?: File[];
  addAdditionalFiles?: (files: File[]) => void;
  removeAdditionalFile?: (index: number) => void;
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
  additionalFiles,
  addAdditionalFiles,
  removeAdditionalFile,
}: PaymentFormInvoiceSectionProps) => {
  const hasPrimaryFile = !!invoicePreview || !!invoiceFileUrl;

  return (
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

      {hasPrimaryFile && addAdditionalFiles && removeAdditionalFile && (
        <AdditionalInvoiceFiles
          files={additionalFiles || []}
          onAdd={addAdditionalFiles}
          onRemove={removeAdditionalFile}
          disabled={isUploadingInvoice || isProcessingInvoice}
        />
      )}
    </div>
  );
};

export default PaymentFormInvoiceSection;
