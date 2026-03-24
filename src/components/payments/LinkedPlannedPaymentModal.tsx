import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface PlannedPayment {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  description: string;
  amount: number;
  planned_date: string;
  legal_entity_id?: number;
  legal_entity_name?: string;
  contractor_id?: number;
  contractor_name?: string;
  department_id?: number;
  department_name?: string;
  service_id?: number;
  service_name?: string;
  invoice_number?: string;
  invoice_date?: string;
  recurrence_type?: string;
  recurrence_end_date?: string;
  converted_to_payment_id?: number;
  converted_at?: string;
  is_active?: boolean;
}

interface Category { id: number; name: string; icon: string; }
interface LegalEntity { id: number; name: string; }
interface Contractor { id: number; name: string; }
interface Department { id: number; name: string; }
interface Service { id: number; name: string; }

interface Props {
  plannedPaymentId: number | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
  onUpdated?: () => void;
}

const recurrenceLabel: Record<string, string> = {
  once: 'Однократно', daily: 'Ежедневно',
  weekly: 'Еженедельно', monthly: 'Ежемесячно', yearly: 'Ежегодно',
};

const fmt = (amount: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);

const fmtDate = (d?: string) =>
  d ? new Date(d.includes('T') ? d : d + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

// ─── Строка информации ────────────────────────────────────────────────────────

const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-white/5 last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
};

// ─── Поле выбора из справочника ───────────────────────────────────────────────

const SelectField = ({
  label, value, onChange, options, placeholder = 'Не выбрано', required = false,
}: {
  label: string;
  value: number | string | undefined;
  onChange: (val: number | undefined) => void;
  options: { id: number; name: string }[];
  placeholder?: string;
  required?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium">{label}{required ? ' *' : ''}</label>
    <select
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      value={value ?? ''}
      onChange={(ev) => onChange(ev.target.value ? Number(ev.target.value) : undefined)}
      required={required}
    >
      {!required && <option value="">{placeholder}</option>}
      {required && <option value="">Выберите...</option>}
      {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  </div>
);

// ─── Компонент ────────────────────────────────────────────────────────────────

const LinkedPlannedPaymentModal = ({ plannedPaymentId, open, onClose, onDeleted, onUpdated }: Props) => {
  const { token, user } = useAuth();
  const { toast } = useToast();

  const isAdmin = user?.roles?.some(r => r.name === 'Администратор' || r.name === 'Admin');

  const [payment, setPayment]             = useState<PlannedPayment | null>(null);
  const [loading, setLoading]             = useState(false);
  const [notFound, setNotFound]           = useState(false);
  const [isEditing, setIsEditing]         = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting]       = useState(false);

  // Справочники для формы
  const [categories, setCategories]     = useState<Category[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [contractors, setContractors]   = useState<Contractor[]>([]);
  const [departments, setDepartments]   = useState<Department[]>([]);
  const [services, setServices]         = useState<Service[]>([]);
  const [dictsLoaded, setDictsLoaded]   = useState(false);

  const [editData, setEditData] = useState<PlannedPayment | null>(null);

  // Загрузка запланированного платежа
  useEffect(() => {
    if (!open || !plannedPaymentId || !token) return;
    setLoading(true);
    setNotFound(false);
    setPayment(null);
    setIsEditing(false);

    fetch(`${API_ENDPOINTS.main}?endpoint=planned-payments`, {
      headers: { 'X-Auth-Token': token },
    })
      .then(r => r.ok ? r.json() : [])
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data as PlannedPayment[] : [];
        const found = list.find(p => p.id === plannedPaymentId) ?? null;
        if (found) {
          setPayment(found);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [open, plannedPaymentId, token]);

  // Загрузка всех справочников при входе в режим редактирования
  const loadDicts = async () => {
    if (!token || dictsLoaded) return;
    const [catRes, leRes, contrRes, deptRes, svcRes] = await Promise.all([
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=categories`, { headers: { 'X-Auth-Token': token } }),
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=legal-entities`, { headers: { 'X-Auth-Token': token } }),
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=contractors`, { headers: { 'X-Auth-Token': token } }),
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=customer-departments`, { headers: { 'X-Auth-Token': token } }),
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=services`, { headers: { 'X-Auth-Token': token } }),
    ]);
    if (catRes.ok)   setCategories(await catRes.json());
    if (leRes.ok)    setLegalEntities(await leRes.json());
    if (contrRes.ok) setContractors(await contrRes.json());
    if (deptRes.ok)  setDepartments(await deptRes.json());
    if (svcRes.ok)   setServices(await svcRes.json());
    setDictsLoaded(true);
  };

  const handleEditStart = async () => {
    await loadDicts();
    setEditData(payment ? { ...payment } : null);
    setIsEditing(true);
  };

  const handleEditSave = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!editData || !token) return;
    setIsSaving(true);
    try {
      const body = {
        id:                  editData.id,
        category_id:         editData.category_id,
        amount:              editData.amount,
        description:         editData.description,
        planned_date:        editData.planned_date,
        legal_entity_id:     editData.legal_entity_id || null,
        contractor_id:       editData.contractor_id || null,
        department_id:       editData.department_id || null,
        service_id:          editData.service_id || null,
        invoice_number:      editData.invoice_number || null,
        invoice_date:        editData.invoice_date || null,
        recurrence_type:     editData.recurrence_type || 'once',
        recurrence_end_date: editData.recurrence_end_date || null,
      };
      const res = await fetch(
        `${API_ENDPOINTS.main}?endpoint=planned-payments&id=${editData.id}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token }, body: JSON.stringify(body) }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Не удалось сохранить');
      }
      // Обновляем названия из справочников
      const updatedPayment: PlannedPayment = {
        ...editData,
        category_name:     categories.find(c => c.id === editData.category_id)?.name || editData.category_name,
        category_icon:     categories.find(c => c.id === editData.category_id)?.icon || editData.category_icon,
        legal_entity_name: editData.legal_entity_id ? legalEntities.find(le => le.id === editData.legal_entity_id)?.name : undefined,
        contractor_name:   editData.contractor_id ? contractors.find(c => c.id === editData.contractor_id)?.name : undefined,
        department_name:   editData.department_id ? departments.find(d => d.id === editData.department_id)?.name : undefined,
        service_name:      editData.service_id ? services.find(s => s.id === editData.service_id)?.name : undefined,
      };
      toast({ title: 'Сохранено', description: 'Запланированный платёж обновлён' });
      setPayment(updatedPayment);
      setIsEditing(false);
      onUpdated?.();
    } catch (e: unknown) {
      toast({ title: 'Ошибка', description: e instanceof Error ? e.message : 'Ошибка сохранения', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!payment || !token) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `${API_ENDPOINTS.main}?endpoint=planned-payments&id=${payment.id}`,
        { method: 'DELETE', headers: { 'X-Auth-Token': token } }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Не удалось удалить');
      }
      toast({ title: 'Удалено', description: 'Запланированный платёж удалён' });
      setConfirmDelete(false);
      onClose();
      onDeleted?.();
    } catch (e: unknown) {
      toast({ title: 'Ошибка', description: e instanceof Error ? e.message : 'Ошибка удаления', variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const e = editData;

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) { setIsEditing(false); onClose(); } }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex-row items-center justify-between space-y-0 pb-2 pr-8">
            <DialogTitle className="flex items-center gap-2 leading-normal">
              <Icon name="CalendarClock" size={18} />
              {isEditing ? 'Редактировать запланированный платёж' : 'Запланированный платёж'}
            </DialogTitle>
          </DialogHeader>

          {/* Загрузка */}
          {loading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Icon name="Loader2" size={18} className="animate-spin" />
              Загрузка...
            </div>
          )}

          {/* Не найден */}
          {!loading && notFound && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <Icon name="SearchX" size={36} className="opacity-40" />
              <p className="text-sm">Запланированный платёж не найден</p>
              <p className="text-xs text-center">Возможно, он был удалён или у вас нет доступа</p>
            </div>
          )}

          {/* ── Просмотр ──────────────────────────────────────────────────── */}
          {!loading && !notFound && payment && !isEditing && (
            <div className="space-y-4 mt-1">
              {/* Шапка с суммой */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Icon name={payment.category_icon || 'Calendar'} size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{payment.description || '—'}</p>
                  <p className="text-xs text-muted-foreground">{payment.category_name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-primary">{fmt(payment.amount)}</p>
                  {payment.recurrence_type && payment.recurrence_type !== 'once' && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">
                      {recurrenceLabel[payment.recurrence_type] ?? payment.recurrence_type}
                    </span>
                  )}
                </div>
              </div>

              {/* Детали */}
              <div className="px-1">
                <InfoRow label="Дата платежа"     value={fmtDate(payment.planned_date)} />
                <InfoRow label="Юридическое лицо" value={payment.legal_entity_name} />
                <InfoRow label="Контрагент"        value={payment.contractor_name} />
                <InfoRow label="Отдел-заказчик"   value={payment.department_name} />
                <InfoRow label="Сервис"            value={payment.service_name} />
                <InfoRow label="Номер счёта"       value={payment.invoice_number} />
                <InfoRow label="Дата счёта"        value={payment.invoice_date ? fmtDate(payment.invoice_date) : undefined} />
                {payment.recurrence_end_date && (
                  <InfoRow label="Повторять до"    value={fmtDate(payment.recurrence_end_date)} />
                )}
                {payment.converted_at && (
                  <InfoRow label="Создан платёж"  value={fmtDate(payment.converted_at)} />
                )}
              </div>

              {/* Действия */}
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleEditStart}
                >
                  <Icon name="Pencil" size={15} />
                  Редактировать
                </Button>
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="gap-2 text-red-400 border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
                    onClick={() => setConfirmDelete(true)}
                  >
                    <Icon name="Trash2" size={15} />
                    Удалить
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* ── Форма редактирования ───────────────────────────────────────── */}
          {!loading && !notFound && isEditing && e && (
            <form onSubmit={handleEditSave} className="space-y-4 mt-1">

              {/* Категория + Сумма */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Категория"
                  required
                  value={e.category_id}
                  onChange={(val) => setEditData({ ...e, category_id: val ?? e.category_id })}
                  options={categories}
                />
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Сумма (₽) *</label>
                  <input
                    type="number" step="0.01" required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={e.amount}
                    onChange={(ev) => setEditData({ ...e, amount: Number(ev.target.value) })}
                  />
                </div>
              </div>

              {/* Назначение */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Назначение *</label>
                <input
                  type="text" required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={e.description}
                  onChange={(ev) => setEditData({ ...e, description: ev.target.value })}
                />
              </div>

              {/* Дата + Юр. лицо */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Дата платежа *</label>
                  <input
                    type="date" required
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={e.planned_date?.slice(0, 10) || ''}
                    onChange={(ev) => setEditData({ ...e, planned_date: ev.target.value })}
                  />
                </div>
                <SelectField
                  label="Юридическое лицо"
                  value={e.legal_entity_id}
                  onChange={(val) => setEditData({ ...e, legal_entity_id: val })}
                  options={legalEntities}
                />
              </div>

              {/* Контрагент + Отдел */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Контрагент"
                  value={e.contractor_id}
                  onChange={(val) => setEditData({ ...e, contractor_id: val })}
                  options={contractors}
                />
                <SelectField
                  label="Отдел-заказчик"
                  value={e.department_id}
                  onChange={(val) => setEditData({ ...e, department_id: val })}
                  options={departments}
                />
              </div>

              {/* Сервис */}
              <SelectField
                label="Сервис"
                value={e.service_id}
                onChange={(val) => setEditData({ ...e, service_id: val })}
                options={services}
              />

              {/* Номер счёта + Дата счёта */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Номер счёта</label>
                  <input
                    type="text"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={e.invoice_number || ''}
                    onChange={(ev) => setEditData({ ...e, invoice_number: ev.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Дата счёта</label>
                  <input
                    type="date"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={e.invoice_date?.slice(0, 10) || ''}
                    onChange={(ev) => setEditData({ ...e, invoice_date: ev.target.value })}
                  />
                </div>
              </div>

              {/* Настройки повторения */}
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Icon name="Repeat" size={15} className="text-blue-400" />
                  <span className="text-sm text-blue-200 font-medium">Настройки повторения</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Тип повторения</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={e.recurrence_type || 'once'}
                      onChange={(ev) => setEditData({
                        ...e,
                        recurrence_type: ev.target.value,
                        recurrence_end_date: ev.target.value === 'once' ? undefined : e.recurrence_end_date,
                      })}
                    >
                      <option value="once">Однократно</option>
                      <option value="weekly">Еженедельно</option>
                      <option value="monthly">Ежемесячно</option>
                      <option value="yearly">Ежегодно</option>
                    </select>
                  </div>
                  {e.recurrence_type && e.recurrence_type !== 'once' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">Дата окончания</label>
                      <input
                        type="date"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={e.recurrence_end_date?.slice(0, 10) || ''}
                        onChange={(ev) => setEditData({ ...e, recurrence_end_date: ev.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex gap-3 justify-end pt-1">
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Отмена
                </Button>
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 gap-2" disabled={isSaving}>
                  {isSaving && <Icon name="Loader2" size={14} className="animate-spin" />}
                  Сохранить
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Подтверждение удаления */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить запланированный платёж?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Запланированный платёж будет удалён безвозвратно.
              Связанный фактический платёж останется без изменений.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              {isDeleting ? <Icon name="Loader2" size={14} className="animate-spin mr-1" /> : null}
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LinkedPlannedPaymentModal;
