import InvoiceUpload from '../InvoiceUpload';
import AdditionalInvoiceFiles from './AdditionalInvoiceFiles';
import type { AdditionalFileProgress } from '@/hooks/paymentForm/useInvoiceFileUpload';

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
  additionalProgress?: Record<number, AdditionalFileProgress>;
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
  additionalProgress,
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
        onExtraFiles={addAdditionalFiles}
      />

      {hasPrimaryFile && addAdditionalFiles && removeAdditionalFile && (
        <AdditionalInvoiceFiles
          files={additionalFiles || []}
          onAdd={addAdditionalFiles}
          onRemove={removeAdditionalFile}
          disabled={isUploadingInvoice || isProcessingInvoice}
          progress={additionalProgress}
        />
      )}
    </div>
  );
};

export default PaymentFormInvoiceSection;