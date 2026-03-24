import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import {
  PlannedPayment, Category, LegalEntity, Contractor, Department, Service,
  LinkedPlannedPaymentModalProps,
} from './PlannedPaymentTypes';
import PlannedPaymentView from './PlannedPaymentView';
import PlannedPaymentEditForm from './PlannedPaymentEditForm';

const LinkedPlannedPaymentModal = ({ plannedPaymentId, open, onClose, onDeleted, onUpdated }: LinkedPlannedPaymentModalProps) => {
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

  const [categories, setCategories]       = useState<Category[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [contractors, setContractors]     = useState<Contractor[]>([]);
  const [departments, setDepartments]     = useState<Department[]>([]);
  const [services, setServices]           = useState<Service[]>([]);
  const [dictsLoaded, setDictsLoaded]     = useState(false);

  const [editData, setEditData] = useState<PlannedPayment | null>(null);

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

          {loading && (
            <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
              <Icon name="Loader2" size={18} className="animate-spin" />
              Загрузка...
            </div>
          )}

          {!loading && notFound && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
              <Icon name="SearchX" size={36} className="opacity-40" />
              <p className="text-sm">Запланированный платёж не найден</p>
              <p className="text-xs text-center">Возможно, он был удалён или у вас нет доступа</p>
            </div>
          )}

          {!loading && !notFound && payment && !isEditing && (
            <PlannedPaymentView
              payment={payment}
              isAdmin={!!isAdmin}
              onEditStart={handleEditStart}
              onDeleteRequest={() => setConfirmDelete(true)}
            />
          )}

          {!loading && !notFound && isEditing && editData && (
            <PlannedPaymentEditForm
              editData={editData}
              setEditData={setEditData}
              categories={categories}
              legalEntities={legalEntities}
              contractors={contractors}
              departments={departments}
              services={services}
              isSaving={isSaving}
              onCancel={() => setIsEditing(false)}
              onSubmit={handleEditSave}
            />
          )}
        </DialogContent>
      </Dialog>

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
