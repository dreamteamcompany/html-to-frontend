import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';
import { PaymentDocument } from './editPaymentTypes';

interface EditPaymentDocumentsProps {
  existingDocs: PaymentDocument[];
  currentFileUrl: string | undefined;
  uploadedFileName: string | null;
  displayFileName: string | null;
  isUploadingFile: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCancelNewFile: () => void;
}

const EditPaymentDocuments = ({
  existingDocs,
  currentFileUrl,
  uploadedFileName,
  displayFileName,
  isUploadingFile,
  onFileChange,
  onCancelNewFile,
}: EditPaymentDocumentsProps) => {
  return (
    <div className="space-y-3">
      <Label>Документы (счёт)</Label>

      {existingDocs.length > 0 && (
        <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
          {existingDocs.map((doc) => (
            <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 py-2.5 bg-primary/5">
              <div className="flex items-start gap-2 min-w-0 flex-1">
                <Icon name="FileText" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium break-anywhere">{doc.file_name}</span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Icon name="Eye" size={13} />
                  Открыть
                </a>
                <a
                  href={doc.file_url}
                  download
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Icon name="Download" size={13} />
                  Скачать
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentFileUrl && uploadedFileName && (
        <div className="flex items-start justify-between gap-2 px-3 py-2.5 rounded-lg border border-green-500/30 bg-green-500/5">
          <div className="flex items-start gap-2 min-w-0 flex-1 flex-wrap">
            <Icon name="CheckCircle" size={16} className="text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm font-medium break-anywhere text-green-800 dark:text-green-300">{displayFileName}</span>
            <span className="text-xs text-green-700/70 dark:text-green-400/70 flex-shrink-0 mt-0.5">новый</span>
          </div>
          <button
            type="button"
            onClick={onCancelNewFile}
            className="text-xs text-muted-foreground hover:text-red-700 dark:hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
          >
            <Icon name="X" size={14} />
          </button>
        </div>
      )}

      <label className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-white/20 hover:border-primary/50 cursor-pointer transition-colors ${isUploadingFile ? 'opacity-50 pointer-events-none' : ''}`}>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={onFileChange}
          className="hidden"
          disabled={isUploadingFile}
        />
        {isUploadingFile ? (
          <>
            <Icon name="Loader2" size={16} className="animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Загрузка файла...</span>
          </>
        ) : (
          <>
            <Icon name="Paperclip" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {existingDocs.length > 0 ? 'Заменить документ' : 'Прикрепить документ'} (PDF, JPG, PNG)
            </span>
          </>
        )}
      </label>
    </div>
  );
};

export default EditPaymentDocuments;