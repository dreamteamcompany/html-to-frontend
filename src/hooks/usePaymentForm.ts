import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import FUNC2URL from '@/../backend/func2url.json';
import { usePaymentFormState, CustomFieldDefinition } from './paymentForm/usePaymentFormState';
import { useInvoiceFileUpload } from './paymentForm/useInvoiceFileUpload';
import { useInvoiceOCR } from './paymentForm/useInvoiceOCR';
import { fileToDataUrl } from './paymentForm/pdfUtils';
import { validatePaymentForm } from './paymentForm/validators';

export const usePaymentForm = (
  customFields: CustomFieldDefinition[],
  onSuccess: () => void,
  loadContractors?: () => Promise<unknown>,
  loadLegalEntities?: () => Promise<unknown>,
) => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { formData, setFormData, resetForm } = usePaymentFormState(customFields);

  const { isProcessingInvoice, handleExtractDataFromFile } = useInvoiceOCR({
    token,
    userId: user?.id,
    onUrlReady: (file_url) => setFormData(prev => ({ ...prev, invoice_file_url: file_url })),
    onFieldsExtracted: (updates) => setFormData(prev => ({ ...prev, ...updates })),
    onToast: (opts) => toast(opts),
    loadContractors,
    loadLegalEntities,
  });

  const {
    invoiceFile,
    invoicePreview,
    isUploadingInvoice,
    handleFileSelect,
    resetFile,
    additionalFiles,
    addAdditionalFiles,
    removeAdditionalFile,
  } = useInvoiceFileUpload({
    token,
    onUrlReady: (file_url) => setFormData(prev => ({ ...prev, invoice_file_url: file_url })),
    onToast: (opts) => toast(opts),
    onAfterUpload: (file) => { handleExtractDataFromFile(file); },
  });

  const handleExtractData = async () => {
    if (!invoiceFile) return;
    await handleExtractDataFromFile(invoiceFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploadingInvoice) {
      toast({
        title: 'Подождите',
        description: 'Файл счёта ещё загружается',
      });
      return;
    }

    const validationError = validatePaymentForm(formData);
    if (validationError) {
      toast({ ...validationError, variant: 'destructive' });
      return;
    }

    try {
      const customFieldsData: Record<string, string> = {};
      customFields.forEach(field => {
        const value = formData[`custom_field_${field.id}`];
        if (value) {
          customFieldsData[field.id.toString()] = value;
        }
      });

      const response = await fetch(API_ENDPOINTS.paymentsApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          category_id: formData.category_id ? parseInt(formData.category_id) : 0,
          description: formData.description || '',
          amount: formData.amount ? parseFloat(formData.amount) : 0,
          payment_date: formData.invoice_date || '',
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
        let createdPaymentId: number | null = null;
        try {
          const data = await response.json();
          createdPaymentId = data?.id ?? null;
        } catch {
          /* ответ без тела/JSON — пропускаем догрузку */
        }

        if (createdPaymentId && additionalFiles.length > 0) {
          const uploadUrl = (FUNC2URL as Record<string, string>)['upload-presigned-url'];
          let okCount = 0;
          let failCount = 0;
          for (const file of additionalFiles) {
            try {
              const base64 = await fileToDataUrl(file);
              const upRes = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
                body: JSON.stringify({ file_name: file.name, file_type: file.type, file_data: base64 }),
              });
              if (!upRes.ok) { failCount++; continue; }
              const { file_url } = await upRes.json();
              if (!file_url) { failCount++; continue; }

              const attachRes = await fetch(`${API_ENDPOINTS.paymentsApi}?action=invoice_files`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
                body: JSON.stringify({
                  payment_id: createdPaymentId,
                  sub_action: 'upload',
                  file_url,
                  file_name: file.name,
                }),
              });
              if (attachRes.ok) okCount++; else failCount++;
            } catch {
              failCount++;
            }
          }
          if (okCount > 0) {
            toast({
              title: 'Дополнительные файлы прикреплены',
              description: `Добавлено файлов: ${okCount}${failCount ? `, не удалось: ${failCount}` : ''}`,
            });
          } else if (failCount > 0) {
            toast({
              title: 'Не все файлы прикреплены',
              description: `Не удалось загрузить: ${failCount}. Платёж создан, файлы можно добавить через редактирование.`,
              variant: 'destructive',
            });
          }
        }

        toast({
          title: 'Успешно',
          description: 'Платёж добавлен',
        });
        setDialogOpen(false);
        resetForm();
        resetFile();
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
    isUploadingInvoice,
    handleFileSelect,
    handleExtractData,
    fileName: invoiceFile?.name,
    fileType: invoiceFile?.type,
    invoiceFileUrl: formData.invoice_file_url || '',
    additionalFiles,
    addAdditionalFiles,
    removeAdditionalFile,
  };
};