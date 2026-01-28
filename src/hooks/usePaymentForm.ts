import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createWorker } from 'tesseract.js';
import FUNC2URL from '@/../backend/func2url.json';

interface CustomFieldDefinition {
  id: number;
  name: string;
  field_type: string;
  options: string;
}

export const usePaymentForm = (customFields: CustomFieldDefinition[], onSuccess: () => void) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null);
  const [isProcessingInvoice, setIsProcessingInvoice] = useState(false);
  const [formData, setFormData] = useState<Record<string, string | undefined>>({
    category_id: undefined,
    description: '',
    amount: '',
    legal_entity_id: undefined,
    contractor_id: undefined,
    department_id: undefined,
    service_id: undefined,
    invoice_number: '',
    invoice_date: '',
    invoice_file_url: '',
  });

  useEffect(() => {
    const initialData: Record<string, string | undefined> = {
      category_id: undefined,
      description: '',
      amount: '',
      legal_entity_id: undefined,
      contractor_id: undefined,
      department_id: undefined,
      service_id: undefined,
      invoice_number: '',
      invoice_date: '',
      invoice_file_url: '',
    };
    customFields.forEach((field) => {
      initialData[`custom_field_${field.id}`] = undefined;
    });
    setFormData(initialData);
  }, [customFields]);

  const handleFileSelect = (file: File | null) => {
    if (!file) {
      setInvoiceFile(null);
      setInvoicePreview(null);
      return;
    }

    setInvoiceFile(file);
    
    if (file.type === 'application/pdf') {
      setInvoicePreview('preview.pdf');
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInvoicePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExtractData = async () => {
    if (!invoiceFile) return;

    setIsProcessingInvoice(true);

    try {
      // Шаг 1: Загружаем файл в S3 (если это изображение)
      let fileUrl = '';
      
      if (invoiceFile.type.startsWith('image/')) {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(invoiceFile);
        });
        
        const base64 = await base64Promise;
        
        const uploadResponse = await fetch(FUNC2URL['invoice-ocr'], {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file: base64, fileName: invoiceFile.name }),
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          fileUrl = uploadData.file_url || '';
        }
      }

      // Шаг 2: OCR через Tesseract.js (локально)
      const worker = await createWorker('rus+eng');
      const { data: { text } } = await worker.recognize(invoiceFile);
      await worker.terminate();

      // Шаг 3: Парсим данные из текста
      const extracted = parseInvoiceText(text);
      
      const updates: Record<string, string | undefined> = {};
      
      if (fileUrl) {
        updates.invoice_file_url = fileUrl;
      }
      
      if (extracted.amount) {
        updates.amount = extracted.amount.toString();
      }
      
      if (extracted.invoice_number) {
        updates.invoice_number = extracted.invoice_number;
      }
      
      if (extracted.invoice_date) {
        updates.invoice_date = extracted.invoice_date;
      }
      
      if (extracted.legal_entity && !formData.legal_entity_id) {
        updates.description = (formData.description || '') + `\nЮр. лицо: ${extracted.legal_entity}`;
      }
      
      if (extracted.contractor && !formData.contractor_id) {
        updates.description = (updates.description || formData.description || '') + `\nКонтрагент: ${extracted.contractor}`;
      }
      
      setFormData({ ...formData, ...updates });
      
      toast({
        title: 'Успешно',
        description: 'Данные из счёта распознаны локально',
      });
    } catch (err) {
      console.error('Failed to process invoice:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось распознать счёт',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingInvoice(false);
    }
  };

  const parseInvoiceText = (text: string) => {
    const data: {
      amount: number | null;
      invoice_number: string | null;
      invoice_date: string | null;
      legal_entity: string | null;
      contractor: string | null;
    } = {
      amount: null,
      invoice_number: null,
      invoice_date: null,
      legal_entity: null,
      contractor: null,
    };
    
    if (!text) return data;
    
    const textLower = text.toLowerCase();
    
    // Сумма
    const amountPatterns = [
      /итого[:\s]+(\d+[\s\d]*[.,]?\d*)/i,
      /сумма[:\s]+(\d+[\s\d]*[.,]?\d*)/i,
      /к\s+оплате[:\s]+(\d+[\s\d]*[.,]?\d*)/i,
      /всего[:\s]+(\d+[\s\d]*[.,]?\d*)/i,
    ];
    
    for (const pattern of amountPatterns) {
      const match = textLower.match(pattern);
      if (match) {
        const amountStr = match[1].replace(/\s/g, '').replace(',', '.');
        try {
          data.amount = parseFloat(amountStr);
          break;
        } catch (e) {
          // ignore
        }
      }
    }
    
    // Номер счёта
    const invoicePatterns = [
      /счет[:\s№]+(\d+)/i,
      /счёт[:\s№]+(\d+)/i,
      /invoice[:\s#]+(\d+)/i,
      /№\s*(\d+)/i,
    ];
    
    for (const pattern of invoicePatterns) {
      const match = textLower.match(pattern);
      if (match) {
        data.invoice_number = match[1];
        break;
      }
    }
    
    // Дата
    const datePatterns = [
      /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/,
      /(\d{4}[./-]\d{1,2}[./-]\d{1,2})/,
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const dateStr = match[1];
        try {
          const formats = ['%d.%m.%Y', '%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y'];
          for (const fmt of formats) {
            try {
              const parts = dateStr.split(/[./-]/);
              let year, month, day;
              
              if (fmt === '%d.%m.%Y' || fmt === '%d/%m/%Y' || fmt === '%d-%m-%Y') {
                day = parseInt(parts[0]);
                month = parseInt(parts[1]);
                year = parseInt(parts[2]);
              } else {
                year = parseInt(parts[0]);
                month = parseInt(parts[1]);
                day = parseInt(parts[2]);
              }
              
              if (year < 100) year += 2000;
              
              const date = new Date(year, month - 1, day);
              if (!isNaN(date.getTime())) {
                data.invoice_date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                break;
              }
            } catch (e) {
              // ignore
            }
          }
          if (data.invoice_date) break;
        } catch (e) {
          // ignore
        }
      }
    }
    
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id) {
      toast({
        title: 'Ошибка',
        description: 'Выберите категорию платежа',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: 'Ошибка',
        description: 'Укажите корректную сумму',
        variant: 'destructive',
      });
      return;
    }

    if (formData.invoice_date) {
      const year = new Date(formData.invoice_date).getFullYear();
      if (year < 2000 || year > 2099) {
        toast({
          title: 'Ошибка',
          description: 'Дата должна быть между 2000 и 2099 годом',
          variant: 'destructive',
        });
        return;
      }
    }
    
    try {
      const customFieldsData: Record<string, string> = {};
      customFields.forEach(field => {
        const value = formData[`custom_field_${field.id}`];
        if (value) {
          customFieldsData[field.id.toString()] = value;
        }
      });

      const response = await fetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          category_id: formData.category_id ? parseInt(formData.category_id) : 0,
          description: formData.description || '',
          amount: formData.amount ? parseFloat(formData.amount) : 0,
          legal_entity_id: formData.legal_entity_id ? parseInt(formData.legal_entity_id) : null,
          contractor_id: formData.contractor_id ? parseInt(formData.contractor_id) : null,
          department_id: formData.department_id ? parseInt(formData.department_id) : null,
          service_id: formData.service_id ? parseInt(formData.service_id) : null,
          invoice_number: formData.invoice_number || null,
          invoice_date: formData.invoice_date || null,
          invoice_file_url: formData.invoice_file_url || null,
          custom_fields: customFieldsData,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Платёж добавлен',
        });
        setDialogOpen(false);
        const resetData: Record<string, string | undefined> = {
          category_id: undefined,
          description: '',
          amount: '',
          legal_entity_id: undefined,
          contractor_id: undefined,
          department_id: undefined,
          service_id: undefined,
          invoice_number: '',
          invoice_date: '',
          invoice_file_url: '',
        };
        customFields.forEach(field => {
          resetData[`custom_field_${field.id}`] = undefined;
        });
        setFormData(resetData);
        setInvoiceFile(null);
        setInvoicePreview(null);
        onSuccess();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.error || 'Не удалось добавить платёж',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to add payment:', err);
      toast({
        title: 'Ошибка сети',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    }
  };

  return {
    dialogOpen,
    setDialogOpen,
    formData,
    setFormData,
    handleSubmit,
    invoiceFile,
    invoicePreview,
    isProcessingInvoice,
    handleFileSelect,
    handleExtractData,
  };
};