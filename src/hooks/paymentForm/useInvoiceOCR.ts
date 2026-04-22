import { useState } from 'react';
import FUNC2URL from '@/../backend/func2url.json';
import { translateFetchError } from '@/utils/api';
import { convertPdfToImage, fileToDataUrl } from './pdfUtils';

interface UseInvoiceOCRParams {
  token: string | null;
  userId: number | null | undefined;
  onUrlReady: (fileUrl: string) => void;
  onFieldsExtracted: (updates: Record<string, string | undefined>) => void;
  onToast: (opts: { title: string; description: string; variant?: 'destructive' }) => void;
  loadContractors?: () => Promise<unknown>;
  loadLegalEntities?: () => Promise<unknown>;
}

export const useInvoiceOCR = ({
  token,
  userId,
  onUrlReady,
  onFieldsExtracted,
  onToast,
  loadContractors,
  loadLegalEntities,
}: UseInvoiceOCRParams) => {
  const [isProcessingInvoice, setIsProcessingInvoice] = useState(false);

  const handleExtractDataFromFile = async (file: File) => {
    setIsProcessingInvoice(true);

    try {
      const isPdf = file.type === 'application/pdf';

      if (!isPdf && !file.type.startsWith('image/')) {
        onToast({
          title: 'Неверный формат',
          description: 'Поддерживаются PDF и изображения (JPG, PNG)',
          variant: 'destructive',
        });
        setIsProcessingInvoice(false);
        return;
      }

      onToast({
        title: 'Шаг 1: Загрузка файла',
        description: 'Сохраняю документ на сервер...',
      });

      const base64: string = isPdf ? await convertPdfToImage(file) : await fileToDataUrl(file);

      onToast({
        title: 'Шаг 2: Анализ документа',
        description: 'Отправляю в Yandex GPT для распознавания...',
      });

      const ocrResponse = await fetch(FUNC2URL['invoice-ocr'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: base64,
          fileName: file.name,
          user_id: userId || null,
        }),
      });

      let ocrData: Record<string, unknown> = {};
      if (!ocrResponse.ok) {
        const errorData = await ocrResponse.json().catch(() => ({}));
        if (errorData.file_url) {
          onUrlReady(errorData.file_url as string);
          onToast({
            title: 'Файл прикреплён',
            description: 'Документ сохранён, но распознавание данных не удалось',
          });
          return;
        }
        throw new Error((errorData as { error?: string }).error || 'Ошибка при обработке документа');
      }

      ocrData = await ocrResponse.json();
      const extracted = (ocrData.extracted_data as Record<string, unknown>) || {};

      const updates: Record<string, string | undefined> = {};

      if (ocrData.warning && !ocrData.extracted_data) {
        onToast({
          title: 'Файл загружен',
          description: ocrData.warning as string,
          variant: 'destructive',
        });
        onFieldsExtracted(updates);
        return;
      }

      if (extracted.amount) {
        const cleaned = (extracted.amount as string | number).toString().replace(/\s/g, '').replace(',', '.');
        updates.amount = cleaned;
      }

      if (extracted.invoice_number) {
        updates.invoice_number = extracted.invoice_number as string;
      }

      if (extracted.invoice_date) {
        updates.invoice_date = extracted.invoice_date as string;
      }

      if (extracted.description) updates.description = extracted.description as string;
      if (extracted.service_id) updates.service_id = (extracted.service_id as number).toString();
      if (extracted.category_id) updates.category_id = (extracted.category_id as number).toString();
      if (extracted.department_id) updates.department_id = (extracted.department_id as number).toString();
      if (extracted.legal_entity_id) {
        updates.legal_entity_id = (extracted.legal_entity_id as number).toString();
      }

      if (extracted.contractor_id) {
        updates.contractor_id = (extracted.contractor_id as number).toString();
      } else if (extracted.contractor_name) {
        try {
          const res = await fetch(`${FUNC2URL['main']}?endpoint=contractors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
            body: JSON.stringify({ name: extracted.contractor_name, inn: extracted.contractor_inn || '' }),
          });
          if (res.ok) {
            const nc = await res.json();
            updates.contractor_id = nc.id?.toString();
            if (loadContractors) await loadContractors();
          }
        } catch (err) {
          console.error('Auto-create contractor failed:', err);
        }
      }

      if (!extracted.legal_entity_id && extracted.legal_entity_name) {
        try {
          const res = await fetch(`${FUNC2URL['main']}?endpoint=legal-entities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
            body: JSON.stringify({ name: extracted.legal_entity_name, inn: extracted.legal_entity_inn || '' }),
          });
          if (res.ok) {
            const nle = await res.json();
            updates.legal_entity_id = nle.id?.toString();
            if (loadLegalEntities) await loadLegalEntities();
          }
        } catch (err) {
          console.error('Auto-create legal entity failed:', err);
        }
      }

      onFieldsExtracted(updates);

      onToast({
        title: 'Шаг 3: Данные сохранены',
        description: 'Все поля автоматически заполнены из счёта',
      });
    } catch (err) {
      console.error('Failed to process invoice:', err);
      onToast({
        title: 'Ошибка',
        description: translateFetchError(err, 'Не удалось распознать счёт'),
        variant: 'destructive',
      });
    } finally {
      setIsProcessingInvoice(false);
    }
  };

  return { isProcessingInvoice, handleExtractDataFromFile };
};
