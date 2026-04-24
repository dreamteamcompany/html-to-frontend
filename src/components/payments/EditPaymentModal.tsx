import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import FUNC2URL from '@/../backend/func2url.json';
import {
  EditPayment,
  EditPaymentModalProps,
  Category,
  LegalEntity,
  Contractor,
  Department,
  Service,
  CustomFieldDef,
  PaymentDocument,
} from './editPaymentTypes';
import EditPaymentFields from './EditPaymentFields';
import EditPaymentDocuments from './EditPaymentDocuments';

const EditPaymentModal = ({ payment, onClose, onSuccess }: EditPaymentModalProps) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, string | undefined>>({
    category_id: '',
    description: '',
    amount: '',
    payment_date: '',
    legal_entity_id: '',
    service_id: '',
    contractor_id: '',
    department_id: '',
    invoice_number: '',
    invoice_date: '',
    invoice_file_url: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  useEffect(() => {
    if (payment) {
      loadDictionaries();
      populateFormData();
    }
  }, [payment]);

  const populateFormData = () => {
    if (!payment) return;

    // Извлекаем только дату (YYYY-MM-DD) из payment_date/invoice_date,
    // т.к. input type="date" требует формат YYYY-MM-DD
    const extractDate = (v: string | undefined | null): string => {
      if (!v) return '';
      return v.substring(0, 10); // YYYY-MM-DD из ISO-строки
    };

    const data: Record<string, string | undefined> = {
      category_id: payment.category_id?.toString() || '',
      description: payment.description || '',
      amount: payment.amount?.toString() || '',
      payment_date: extractDate(payment.payment_date),
      legal_entity_id: payment.legal_entity_id?.toString() || '',
      service_id: payment.service_id?.toString() || '',
      contractor_id: payment.contractor_id?.toString() || '',
      department_id: payment.department_id?.toString() || '',
      invoice_number: payment.invoice_number || '',
      invoice_date: extractDate(payment.invoice_date),
      invoice_file_url: payment.invoice_file_url || '',
    };

    if (payment.custom_fields) {
      payment.custom_fields.forEach(field => {
        data[`custom_field_${field.id}`] = field.value || '';
      });
    }

    setFormData(data);
    setUploadedFileName(null);
  };

  const loadDictionaries = async () => {
    try {
      const [categoriesRes, legalEntitiesRes, contractorsRes, departmentsRes, servicesRes, customFieldsRes] = await Promise.all([
        apiFetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=categories`),
        apiFetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=legal-entities`),
        apiFetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=contractors`),
        apiFetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=customer-departments`),
        apiFetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=services`),
        apiFetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=custom-fields`),
      ]);

      const categoriesData = await categoriesRes.json();
      const legalEntitiesData = await legalEntitiesRes.json();
      const contractorsData = await contractorsRes.json();
      const departmentsData = await departmentsRes.json();
      const servicesData = await servicesRes.json();
      const customFieldsData = await customFieldsRes.json();

      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setLegalEntities(Array.isArray(legalEntitiesData) ? legalEntitiesData : []);
      setContractors(Array.isArray(contractorsData) ? contractorsData : []);
      setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setCustomFields(Array.isArray(customFieldsData) ? customFieldsData : []);
    } catch (error) {
      console.error('Failed to load dictionaries:', error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadUrl = (FUNC2URL as Record<string, string>)['upload-presigned-url'];
    if (!uploadUrl) {
      toast({
        title: 'Сервис загрузки недоступен',
        description: 'Обновите страницу и попробуйте снова. Если ошибка повторится — обратитесь к администратору.',
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    setIsUploadingFile(true);
    try {
      const fileBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const uploadRes = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ file_name: file.name, file_type: file.type, file_data: fileBase64 }),
      });

      if (!uploadRes.ok) {
        let serverError = '';
        try {
          const errData = await uploadRes.json();
          serverError = (errData && (errData.error || errData.message)) || '';
        } catch {
          /* non-JSON response */
        }
        toast({
          title: 'Не удалось сохранить файл',
          description: serverError || `Ошибка сервера (${uploadRes.status}). Попробуйте ещё раз или выберите другой файл.`,
          variant: 'destructive',
        });
        return;
      }

      const { file_url } = await uploadRes.json();
      if (!file_url) {
        toast({
          title: 'Ошибка загрузки',
          description: 'Сервер не вернул ссылку на файл. Попробуйте ещё раз.',
          variant: 'destructive',
        });
        return;
      }

      setFormData(prev => ({ ...prev, invoice_file_url: file_url }));
      setUploadedFileName(file.name);
      toast({
        title: 'Файл счёта сохранён',
        description: 'Документ прикреплён к платежу',
      });
    } catch (err) {
      console.error('File upload failed:', err);
      toast({
        title: 'Ошибка сети',
        description: 'Не удалось загрузить файл. Проверьте подключение и попробуйте снова.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    setLoading(true);
    try {
      const customFieldsData: Record<string, string> = {};
      Object.keys(formData).forEach(key => {
        if (key.startsWith('custom_field_')) {
          const fieldId = key.replace('custom_field_', '');
          customFieldsData[fieldId] = formData[key] || '';
        }
      });

      await apiFetch(`${API_ENDPOINTS.paymentsApi}`, {
        method: 'PUT',
        body: JSON.stringify({
          payment_id: payment.id,
          category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
          description: formData.description,
          amount: formData.amount ? parseFloat(formData.amount) : undefined,
          payment_date: formData.payment_date,
          legal_entity_id: formData.legal_entity_id ? parseInt(formData.legal_entity_id) : undefined,
          service_id: formData.service_id ? parseInt(formData.service_id) : undefined,
          contractor_id: formData.contractor_id ? parseInt(formData.contractor_id) : undefined,
          department_id: formData.department_id ? parseInt(formData.department_id) : undefined,
          invoice_number: formData.invoice_number,
          invoice_date: formData.invoice_date,
          invoice_file_url: formData.invoice_file_url || null,
          custom_fields: customFieldsData,
        }),
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to update payment:', error);
      alert('Не удалось обновить платёж');
    } finally {
      setLoading(false);
    }
  };

  if (!payment) return null;

  const existingDocs: PaymentDocument[] = payment.documents && payment.documents.length > 0
    ? payment.documents
    : payment.invoice_file_url
      ? [{
          id: 0,
          payment_id: payment.id,
          file_name: payment.invoice_file_url.split('/').pop()?.split('_').slice(2).join('_') || 'Счёт',
          file_url: payment.invoice_file_url,
          document_type: 'invoice',
          uploaded_at: '',
        }]
      : [];

  const currentFileUrl = formData.invoice_file_url;
  const displayFileName = uploadedFileName
    || (currentFileUrl ? currentFileUrl.split('/').pop()?.split('_').slice(2).join('_') || currentFileUrl.split('/').pop() : null);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-white/10 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-card border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Edit" size={24} />
            <h2 className="text-xl font-semibold">Редактировать платёж #{payment.id}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <EditPaymentFields
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            legalEntities={legalEntities}
            contractors={contractors}
            departments={departments}
            services={services}
            customFields={customFields}
          />

          <EditPaymentDocuments
            existingDocs={existingDocs}
            currentFileUrl={currentFileUrl}
            uploadedFileName={uploadedFileName}
            displayFileName={displayFileName}
            isUploadingFile={isUploadingFile}
            onFileChange={handleFileChange}
            onCancelNewFile={() => {
              setFormData(prev => ({ ...prev, invoice_file_url: payment.invoice_file_url || '' }));
              setUploadedFileName(null);
            }}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg bg-white/5 text-white hover:bg-white/10 font-medium transition-colors"
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 font-medium transition-colors disabled:opacity-50"
              disabled={loading || isUploadingFile}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPaymentModal;