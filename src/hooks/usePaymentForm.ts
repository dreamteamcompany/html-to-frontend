import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        const response = await fetch(FUNC2URL['invoice-ocr'], {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            file: base64,
            fileName: invoiceFile.name,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          const updates: Record<string, string | undefined> = {};
          
          if (data.file_url) {
            updates.invoice_file_url = data.file_url;
          }
          
          if (data.extracted_data) {
            const extracted = data.extracted_data;
            
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
          }
          
          setFormData({ ...formData, ...updates });
          
          toast({
            title: 'Успешно',
            description: 'Данные из счёта распознаны',
          });
        } else {
          const error = await response.json();
          toast({
            title: 'Ошибка',
            description: error.error || 'Не удалось распознать счёт',
            variant: 'destructive',
          });
        }
      };
      
      reader.readAsDataURL(invoiceFile);
    } catch (err) {
      console.error('Failed to process invoice:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обработать файл',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingInvoice(false);
    }
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