import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Label } from '@/components/ui/label';

interface InvoiceUploadProps {
  onFileSelect: (file: File) => void;
  onExtractData: () => void;
  isProcessing: boolean;
  previewUrl: string | null;
}

const InvoiceUpload = ({ onFileSelect, onExtractData, isProcessing, previewUrl }: InvoiceUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      onFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label>Загрузка счёта</Label>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${previewUrl ? 'bg-muted/20' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {previewUrl ? (
          <div className="space-y-4">
            <div className="max-w-md mx-auto">
              {previewUrl.endsWith('.pdf') ? (
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <Icon name="FileText" size={48} />
                  <span className="text-sm">PDF файл загружен</span>
                </div>
              ) : (
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-48 mx-auto rounded border"
                />
              )}
            </div>
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-primary">
                <Icon name="Loader2" size={16} className="animate-spin" />
                <span className="text-sm font-medium">Автоматическое распознавание данных...</span>
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileSelect(null!);
                }}
                disabled={isProcessing}
              >
                <Icon name="X" size={16} className="mr-2" />
                Удалить файл
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Icon name="Upload" size={48} className="mx-auto text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Перетащите файл счёта сюда</p>
              <p className="text-xs text-muted-foreground mt-1">
                или нажмите для выбора (JPG, PNG, PDF)
              </p>
            </div>
          </div>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground">
        <Icon name="Sparkles" size={12} className="inline mr-1" />
        Загрузите счёт — система автоматически распознает и заполнит все поля
      </p>
    </div>
  );
};

export default InvoiceUpload;