import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Payment, PaymentView } from './paymentDetailsTypes';
import { API_ENDPOINTS } from '@/config/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { invalidatePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { translateFetchError } from '@/utils/api';
import UserAvatar from '@/components/ui/user-avatar';

interface Department {
  id: number;
  name: string;
}

interface PaymentDetailsInfoProps {
  payment: Payment;
  views: PaymentView[];
  isPlannedPayment?: boolean;
  onEdit?: (payment: Payment) => void;
  onDepartmentChanged?: (departmentId: number | null, departmentName: string | undefined) => void;
}

const PaymentDetailsInfo = ({ payment, views, isPlannedPayment, onEdit, onDepartmentChanged }: PaymentDetailsInfoProps) => {
  const { token, user } = useAuth();
  const { toast } = useToast();

  const isAdmin = user?.roles?.some(r => r.name === 'Администратор' || r.name === 'Admin');
  const canEditDept = isAdmin && payment.status === 'approved';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isEditingDept, setIsEditingDept] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [isSavingDept, setIsSavingDept] = useState(false);
  const [currentDeptName, setCurrentDeptName] = useState<string | undefined>(payment.department_name);

  const loadDepartments = useCallback(async () => {
    if (departments.length > 0) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=customer-departments`, {
        headers: { 'X-Auth-Token': token || '' },
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
    } catch { /* не критично */ }
  }, [departments.length, token]);

  useEffect(() => {
    if (isEditingDept) loadDepartments();
  }, [isEditingDept, loadDepartments]);

  const handleStartEditDept = () => {
    setSelectedDeptId(payment.department_id ? String(payment.department_id) : 'none');
    setIsEditingDept(true);
  };

  const handleCancelEditDept = () => {
    setIsEditingDept(false);
    setSelectedDeptId('');
  };

  const handleSaveDept = async () => {
    setIsSavingDept(true);
    try {
      const newDeptId = selectedDeptId === 'none' ? null : Number(selectedDeptId);
      const res = await fetch(API_ENDPOINTS.paymentsApi, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ payment_id: payment.id, department_id: newDeptId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Не удалось сохранить');
      }
      const result = await res.json();
      const newName: string | undefined = result.department_name ?? undefined;
      setCurrentDeptName(newName);
      setIsEditingDept(false);
      invalidatePaymentsCache();
      if (onDepartmentChanged) onDepartmentChanged(newDeptId, newName);
      toast({ title: 'Сохранено', description: 'Отдел-заказчик обновлён' });
    } catch (e) {
      toast({ title: 'Ошибка', description: translateFetchError(e), variant: 'destructive' });
    } finally {
      setIsSavingDept(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 lg:border-r border-border lg:overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-3 sm:space-y-4">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="bg-primary/20 p-2 sm:p-3 rounded-lg flex-shrink-0">
          <Icon name={payment.category_icon} size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1 break-anywhere">{payment.category_name}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-primary">{payment.amount.toLocaleString('ru-RU')} ₽</p>
        </div>
      </div>

      {views.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-1.5 w-full mb-1">
            <Icon name="Eye" size={14} className="text-primary" />
            <span className="text-xs font-semibold text-primary">Просмотрено</span>
          </div>
          {views.map((v) => (
            <div
              key={v.user_id}
              className="flex items-center gap-1.5 bg-primary/15 rounded-full px-2.5 py-1"
              title={new Date(v.viewed_at).toLocaleString('ru-RU')}
            >
              <UserAvatar photoUrl={v.photo_url} name={v.full_name} size="xs" />
              <span className="text-xs font-semibold text-foreground">{v.full_name}</span>
              <span className="text-[10px] font-medium text-foreground/70">
                {new Date(v.viewed_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}

      {payment.rejection_comment && payment.status === 'rejected' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Icon name="AlertCircle" size={20} className="text-red-600 dark:text-red-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">Причина отклонения</p>
              <p className="text-sm font-medium text-red-800 dark:text-red-300 break-anywhere">{payment.rejection_comment}</p>
              {payment.rejected_at && (
                <p className="text-xs font-medium text-red-700/80 dark:text-red-300/70 mt-2">
                  {new Date(payment.rejected_at).toLocaleString('ru-RU')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {payment.description && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Описание</p>
          <p className="font-semibold text-foreground break-anywhere">{payment.description}</p>
        </div>
      )}

      {payment.category_name && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Категория</p>
          <div className="flex items-center gap-2 font-semibold text-foreground min-w-0">
            <Icon name={payment.category_icon || 'Tag'} size={18} className="flex-shrink-0" />
            <span className="break-anywhere">{payment.category_name}</span>
          </div>
        </div>
      )}

      {payment.legal_entity_name && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Юридическое лицо</p>
          <p className="font-semibold text-foreground break-anywhere">{payment.legal_entity_name}</p>
        </div>
      )}

      {payment.contractor_name && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Контрагент</p>
          <p className="font-semibold text-foreground break-anywhere">{payment.contractor_name}</p>
        </div>
      )}

      {(currentDeptName || canEditDept) && (
        <div>
          <div className="flex items-center justify-between mb-1 gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Отдел-заказчик</p>
            {canEditDept && !isEditingDept && (
              <button
                onClick={handleStartEditDept}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex-shrink-0"
              >
                <Icon name="Pencil" size={12} />
                Изменить
              </button>
            )}
          </div>
          {isEditingDept ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select value={selectedDeptId} onValueChange={setSelectedDeptId}>
                <SelectTrigger className="flex-1 h-9 text-sm">
                  <SelectValue placeholder="Выберите отдел" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Не указан —</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2 sm:flex-shrink-0">
                <Button size="sm" className="h-9 flex-1 sm:flex-none sm:px-3" onClick={handleSaveDept} disabled={isSavingDept}>
                  {isSavingDept ? <Icon name="Loader2" size={14} className="animate-spin" /> : <Icon name="Check" size={14} />}
                </Button>
                <Button size="sm" variant="ghost" className="h-9 flex-1 sm:flex-none sm:px-2" onClick={handleCancelEditDept} disabled={isSavingDept}>
                  <Icon name="X" size={14} />
                </Button>
              </div>
            </div>
          ) : (
            <p className="font-semibold text-foreground break-anywhere">{currentDeptName || <span className="text-foreground/50 italic text-sm">Не указан</span>}</p>
          )}
        </div>
      )}

      {(isPlannedPayment || payment.is_planned) && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Запланированный платеж</p>
          <div className="flex items-center gap-2 font-semibold text-blue-700 dark:text-blue-300">
            <Icon name="CalendarClock" size={18} className="flex-shrink-0" />
            <span>{payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            }) : 'Дата не указана'}</span>
          </div>
        </div>
      )}

      {payment.service_name && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Сервис</p>
          <p className="font-semibold text-foreground break-anywhere">{payment.service_name}</p>
          {payment.service_description && (
            <p className="text-sm font-medium text-foreground/70 mt-1 break-anywhere">{payment.service_description}</p>
          )}
        </div>
      )}

      {payment.invoice_number && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Номер счёта</p>
          <p className="font-semibold text-foreground break-anywhere">{payment.invoice_number}</p>
        </div>
      )}

      {payment.created_by_name && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">Создал заявку</p>
          <p className="font-semibold text-foreground break-anywhere">{payment.created_by_name}</p>
        </div>
      )}

      {payment.custom_fields && payment.custom_fields.length > 0 && (
        <>
          {payment.custom_fields.map((field) => (
            <div key={field.id}>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60 mb-1">{field.name}</p>
              {field.field_type === 'file' && field.value ? (
                <div className="rounded-lg border border-border p-3 bg-primary/5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon name="FileText" size={16} className="text-primary flex-shrink-0" />
                      <span className="text-sm font-semibold text-foreground break-anywhere">
                        {field.value.split('/').pop()?.split('_').slice(2).join('_') || 'Файл'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={field.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <Icon name="Eye" size={14} />
                        Просмотр
                      </a>
                      <a
                        href={field.value}
                        download
                        className="flex items-center gap-1 text-xs font-semibold text-foreground/70 hover:text-foreground"
                      >
                        <Icon name="Download" size={14} />
                        Скачать
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="font-semibold text-foreground break-anywhere">{field.value}</p>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default PaymentDetailsInfo;