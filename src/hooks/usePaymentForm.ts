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
      // Проверяем тип файла
      if (invoiceFile.type === 'application/pdf') {
        toast({
          title: 'PDF не поддерживается',
          description: 'Загрузите изображение счёта (JPG, PNG)',
          variant: 'destructive',
        });
        setIsProcessingInvoice(false);
        return;
      }

      if (!invoiceFile.type.startsWith('image/')) {
        toast({
          title: 'Неверный формат',
          description: 'Поддерживаются только изображения',
          variant: 'destructive',
        });
        setIsProcessingInvoice(false);
        return;
      }

      // Шаг 1: Создаём URL для Tesseract
      const imageUrl = URL.createObjectURL(invoiceFile);
      let fileUrl = '';

      // Шаг 2: Загружаем файл в S3 параллельно
      const uploadPromise = (async () => {
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
          return uploadData.file_url || '';
        }
        return '';
      })();

      // Шаг 3: OCR через Tesseract.js
      const worker = await createWorker('rus+eng');
      const { data: { text } } = await worker.recognize(imageUrl);
      await worker.terminate();
      
      // Освобождаем URL
      URL.revokeObjectURL(imageUrl);

      // Ждём загрузку файла
      fileUrl = await uploadPromise;

      // Шаг 4: Парсим данные из текста
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
        description: 'Данные из счёта распознаны',
      });
    } catch (err) {
      console.error('Failed to process invoice:', err);
      toast({
        title: 'Ошибка',
        description: err instanceof Error ? err.message : 'Не удалось распознать счёт',
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
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const textLower = text.toLowerCase();
    
    // Сумма: расширенные паттерны для таблиц и разных форматов
    const amountPatterns = [
      /итого\s*[:\s]*(\d+[\s\d]*[.,]?\d*)\s*(?:руб|₽|rub)?/gi,
      /сумма\s*[:\s]*(\d+[\s\d]*[.,]?\d*)\s*(?:руб|₽|rub)?/gi,
      /к\s+оплате\s*[:\s]*(\d+[\s\d]*[.,]?\d*)\s*(?:руб|₽|rub)?/gi,
      /всего\s*[:\s]*(\d+[\s\d]*[.,]?\d*)\s*(?:руб|₽|rub)?/gi,
      /total\s*[:\s]*(\d+[\s\d]*[.,]?\d*)/gi,
      /amount\s*[:\s]*(\d+[\s\d]*[.,]?\d*)/gi,
    ];
    
    const allAmounts: number[] = [];
    
    for (const pattern of amountPatterns) {
      let match;
      while ((match = pattern.exec(textLower)) !== null) {
        const amountStr = match[1].replace(/\s/g, '').replace(',', '.');
        const amount = parseFloat(amountStr);
        if (!isNaN(amount) && amount > 0) {
          allAmounts.push(amount);
        }
      }
    }
    
    // Берём максимальную сумму (обычно итоговая)
    if (allAmounts.length > 0) {
      data.amount = Math.max(...allAmounts);
    }
    
    // Номер счёта: улучшенные паттерны
    const invoicePatterns = [
      /(?:счет|счёт|invoice|inv)[:\s#№]*(\d+[-/]?\d*)/gi,
      /№\s*(\d{4,})/gi,
      /\b(\d{6,})\b/g, // 6+ цифр подряд
    ];
    
    for (const pattern of invoicePatterns) {
      const match = text.match(pattern);
      if (match) {
        const num = match[0].replace(/[^\d-/]/g, '');
        if (num.length >= 4) {
          data.invoice_number = num;
          break;
        }
      }
    }
    
    // Дата: множественные форматы
    const datePatterns = [
      /(?:от|date|дата)[:\s]*(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/gi,
      /(\d{1,2}[./-]\d{1,2}[./-]\d{2,4})/g,
      /(\d{4}[./-]\d{1,2}[./-]\d{1,2})/g,
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        for (const dateCandidate of match) {
          const dateStr = dateCandidate.replace(/(?:от|date|дата)[:\s]*/gi, '');
          const parts = dateStr.split(/[./-]/);
          
          if (parts.length === 3) {
            let year, month, day;
            
            // Определяем формат
            if (parts[0].length === 4) {
              [year, month, day] = parts.map(p => parseInt(p));
            } else {
              [day, month, year] = parts.map(p => parseInt(p));
            }
            
            if (year < 100) year += 2000;
            if (year < 2000 || year > 2100) continue;
            if (month < 1 || month > 12) continue;
            if (day < 1 || day > 31) continue;
            
            const date = new Date(year, month - 1, day);
            if (!isNaN(date.getTime())) {
              data.invoice_date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              break;
            }
          }
        }
        if (data.invoice_date) break;
      }
    }
    
    // Юридическое лицо: поиск в таблице поставщика/продавца
    const legalEntityPatterns = [
      /(?:поставщик|продавец|исполнитель|получатель)[:\s]*([^\n]{5,100})/gi,
      /(?:ооо|оао|зао|ип)\s+[«"]?([^»"\n]{3,80})[»"]?/gi,
    ];
    
    for (const pattern of legalEntityPatterns) {
      const match = text.match(pattern);
      if (match) {
        const entity = match[0]
          .replace(/(?:поставщик|продавец|исполнитель|получатель)[:\s]*/gi, '')
          .trim();
        if (entity.length > 3 && entity.length < 150) {
          data.legal_entity = entity;
          break;
        }
      }
    }
    
    // Контрагент: поиск покупателя/заказчика
    const contractorPatterns = [
      /(?:покупатель|заказчик|плательщик)[:\s]*([^\n]{5,100})/gi,
    ];
    
    for (const pattern of contractorPatterns) {
      const match = text.match(pattern);
      if (match) {
        const contractor = match[0]
          .replace(/(?:покупатель|заказчик|плательщик)[:\s]*/gi, '')
          .trim();
        if (contractor.length > 3 && contractor.length < 150) {
          data.contractor = contractor;
          break;
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