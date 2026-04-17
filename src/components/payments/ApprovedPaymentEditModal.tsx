import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { invalidatePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { translateFetchError } from '@/utils/api';
import { Payment, PaymentDocument } from './ApprovedPaymentInfo';
import InvoiceFilesManager, { MAX_INVOICE_FILES } from './InvoiceFilesManager';

interface LegalEntity {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface ApprovedPaymentEditModalProps {
  open: boolean;
  payment: Payment;
  onClose: () => void;
  onSaved: (updates: Partial<Payment>) => void;
}

const ApprovedPaymentEditModal = ({ open, payment, onClose, onSaved }: ApprovedPaymentEditModalProps) => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [isLoadingDicts, setIsLoadingDicts] = useState(false);

  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedLeId, setSelectedLeId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [documents, setDocuments] = useState<PaymentDocument[]>([]);
  const [isFilesBusy, setIsFilesBusy] = useState(false);
  const [busyDocumentId, setBusyDocumentId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedDeptId(payment.department_id ? String(payment.department_id) : 'none');
    setSelectedLeId(payment.legal_entity_id ? String(payment.legal_entity_id) : 'none');
    setInvoiceNumber(payment.invoice_number || '');
    setDocuments(Array.isArray(payment.documents) ? payment.documents : []);
    setIsFilesBusy(false);
    setBusyDocumentId(null);
    loadDictionaries();
  }, [open]);

  const loadDictionaries = async () => {
    setIsLoadingDicts(true);
    try {
      const [deptRes, leRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=customer-departments`, {
          headers: { 'X-Auth-Token': token || '' },
        }),
        fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=legal-entities`, {
          headers: { 'X-Auth-Token': token || '' },
        }),
      ]);
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
      if (leRes.ok) {
        const data = await leRes.json();
        setLegalEntities(Array.isArray(data) ? data : []);
      }
    } catch {
      // не критично
    } finally {
      setIsLoadingDicts(false);
    }
  };

  const readFileAsBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Не удалось прочитать файл'));
      reader.readAsDataURL(file);
    });

  const uploadToStorage = async (file: File): Promise<string> => {
    const base64 = await readFileAsBase64(file);
    const resp = await fetch(API_ENDPOINTS.invoiceOcr, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: base64, fileName: file.name, upload_only: true }),
    });
    if (!resp.ok) throw new Error('Ошибка загрузки файла');
    const data = await resp.json();
    if (!data.file_url) throw new Error('Сервер не вернул ссылку на файл');
    return data.file_url as string;
  };

  const callInvoiceFiles = async (body: Record<string, unknown>) => {
    const res = await fetch(`${API_ENDPOINTS.paymentsApi}?action=invoice_files`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify({ payment_id: payment.id, ...body }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Ошибка операции с файлом');
    }
    return res.json();
  };

  const handleAddFile = async (file: File) => {
    if (documents.length >= MAX_INVOICE_FILES) {
      toast({
        title: 'Лимит',
        description: `Достигнут лимит ${MAX_INVOICE_FILES} файлов на платёж`,
        variant: 'destructive',
      });
      return;
    }
    setIsFilesBusy(true);
    try {
      const fileUrl = await uploadToStorage(file);
      const data = await callInvoiceFiles({
        sub_action: 'upload',
        file_url: fileUrl,
        file_name: file.name,
      });
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
      invalidatePaymentsCache();
      toast({ title: 'Файл добавлен', description: `«${file.name}» сохранён в платеже` });
    } catch (e) {
      toast({
        title: 'Ошибка загрузки',
        description: translateFetchError(e, 'Не удалось загрузить файл'),
        variant: 'destructive',
      });
    } finally {
      setIsFilesBusy(false);
    }
  };

  const handleReplaceFile = async (documentId: number, file: File) => {
    setIsFilesBusy(true);
    setBusyDocumentId(documentId);
    try {
      const fileUrl = await uploadToStorage(file);
      const data = await callInvoiceFiles({
        sub_action: 'replace',
        document_id: documentId,
        file_url: fileUrl,
        file_name: file.name,
      });
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
      invalidatePaymentsCache();
      toast({ title: 'Файл заменён', description: `Новый файл: «${file.name}»` });
    } catch (e) {
      toast({
        title: 'Ошибка замены',
        description: translateFetchError(e, 'Не удалось заменить файл'),
        variant: 'destructive',
      });
    } finally {
      setIsFilesBusy(false);
      setBusyDocumentId(null);
    }
  };

  const handleDeleteFile = async (documentId: number) => {
    setIsFilesBusy(true);
    setBusyDocumentId(documentId);
    try {
      const data = await callInvoiceFiles({
        sub_action: 'delete',
        document_id: documentId,
      });
      setDocuments(Array.isArray(data.documents) ? data.documents : []);
      invalidatePaymentsCache();
      toast({ title: 'Файл удалён' });
    } catch (e) {
      toast({
        title: 'Ошибка удаления',
        description: translateFetchError(e, 'Не удалось удалить файл'),
        variant: 'destructive',
      });
    } finally {
      setIsFilesBusy(false);
      setBusyDocumentId(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const body: Record<string, unknown> = {
        payment_id: payment.id,
        department_id: selectedDeptId === 'none' ? null : Number(selectedDeptId),
        legal_entity_id: selectedLeId === 'none' ? null : Number(selectedLeId),
        invoice_number: invoiceNumber.trim() || null,
      };

      const res = await fetch(API_ENDPOINTS.paymentsApi, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Не удалось сохранить изменения');
      }

      const result = await res.json();

      invalidatePaymentsCache();

      toast({ title: 'Сохранено', description: 'Изменения в платеже зафиксированы в журнале аудита' });

      onSaved({
        department_id: result.department_id,
        department_name: result.department_name ?? undefined,
        legal_entity_id: result.legal_entity_id,
        legal_entity_name: result.legal_entity_name ?? undefined,
        invoice_number: result.invoice_number ?? undefined,
        invoice_file_url: result.invoice_file_url ?? undefined,
        invoice_file_uploaded_at: result.invoice_file_uploaded_at ?? undefined,
        documents,
      });

      onClose();
    } catch (e) {
      toast({
        title: 'Ошибка',
        description: translateFetchError(e, 'Ошибка сохранения'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isSaving && !isFilesBusy) onClose(); }}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать платёж #{payment.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Отдел-заказчик</Label>
            <Select value={selectedDeptId} onValueChange={setSelectedDeptId} disabled={isLoadingDicts}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingDicts ? 'Загрузка...' : 'Не указан'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не указан</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Юридическое лицо</Label>
            <Select value={selectedLeId} onValueChange={setSelectedLeId} disabled={isLoadingDicts}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingDicts ? 'Загрузка...' : 'Не указано'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не указано</SelectItem>
                {legalEntities.map((le) => (
                  <SelectItem key={le.id} value={String(le.id)}>{le.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Номер счёта</Label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Введите номер счёта"
            />
          </div>

          {(() => {
            const selectedLe = legalEntities.find(le => String(le.id) === selectedLeId);
            const leName = (selectedLe?.name || payment.legal_entity_name || '').trim().toLowerCase();
            const isCashLegalEntity = leName === 'наличные';
            return (
              <InvoiceFilesManager
                documents={documents}
                isBusy={isFilesBusy}
                busyDocumentId={busyDocumentId}
                onUpload={handleAddFile}
                onReplace={handleReplaceFile}
                onDelete={handleDeleteFile}
                onError={(message) => toast({ title: 'Ошибка', description: message, variant: 'destructive' })}
                label={isCashLegalEntity ? 'Загрузка чека' : 'Загрузка счёта'}
                dropzoneText={isCashLegalEntity ? 'Перетащите файлы чеков сюда' : 'Перетащите файлы счёта сюда'}
              />
            );
          })()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving || isFilesBusy}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoadingDicts || isFilesBusy}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovedPaymentEditModal;