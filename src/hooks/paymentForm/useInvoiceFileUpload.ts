import { useState } from 'react';
import FUNC2URL from '@/../backend/func2url.json';
import { fileToDataUrl } from './pdfUtils';

interface UseInvoiceFileUploadParams {
  token: string | null;
  onUrlReady: (fileUrl: string) => void;
  onToast: (opts: { title: string; description: string; variant?: 'destructive' }) => void;
  onAfterUpload?: (file: File) => void;
}

export const useInvoiceFileUpload = ({ token, onUrlReady, onToast, onAfterUpload }: UseInvoiceFileUploadParams) => {
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoicePreview, setInvoicePreview] = useState<string | null>(null);
  const [isUploadingInvoice, setIsUploadingInvoice] = useState(false);

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setInvoiceFile(null);
      setInvoicePreview(null);
      // НЕ сбрасываем invoice_file_url — файл уже загружен в S3
      // Пользователь может выбрать новый файл, который перезапишет URL
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

    onToast({
      title: 'Файл загружен',
      description: 'Сохраняю документ и начинаю распознавание...',
    });

    // Загружаем файл через backend (base64) — без CORS-проблем presigned PUT
    setIsUploadingInvoice(true);
    try {
      const fileBase64 = await fileToDataUrl(file);
      const uploadRes = await fetch(FUNC2URL['upload-presigned-url'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ file_name: file.name, file_type: file.type, file_data: fileBase64 }),
      });
      if (uploadRes.ok) {
        const { file_url } = await uploadRes.json();
        if (file_url) {
          onUrlReady(file_url);
          onToast({
            title: 'Файл счёта сохранён',
            description: 'Документ прикреплён к платежу',
          });
        } else {
          onToast({
            title: 'Ошибка загрузки',
            description: 'Сервер не вернул ссылку на файл. Попробуйте выбрать файл ещё раз.',
            variant: 'destructive',
          });
        }
      } else {
        let serverError = '';
        try {
          const errData = await uploadRes.json();
          serverError = (errData && (errData.error || errData.message)) || '';
        } catch {
          /* non-JSON response */
        }
        onToast({
          title: 'Не удалось сохранить файл',
          description: serverError || `Ошибка сервера (${uploadRes.status}). Попробуйте ещё раз или выберите другой файл.`,
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Direct upload failed', err);
      onToast({
        title: 'Ошибка сети',
        description: 'Не удалось загрузить файл. Проверьте подключение и попробуйте снова.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingInvoice(false);
    }

    if (onAfterUpload) {
      // Запускаем OCR для автозаполнения полей (не критично если упадёт)
      setTimeout(() => {
        onAfterUpload(file);
      }, 500);
    }
  };

  const resetFile = () => {
    setInvoiceFile(null);
    setInvoicePreview(null);
  };

  return {
    invoiceFile,
    invoicePreview,
    isUploadingInvoice,
    handleFileSelect,
    resetFile,
  };
};