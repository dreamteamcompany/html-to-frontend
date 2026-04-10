import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { translateApiError, translateFetchError } from '@/utils/api';
import { invalidatePaymentsCache } from '@/contexts/PaymentsCacheContext';
import ApprovedPaymentInfo, { Payment, Department } from './ApprovedPaymentInfo';
import ApprovedPaymentSidebar from './ApprovedPaymentSidebar';
import ApprovedPaymentRevokeDialog from './ApprovedPaymentRevokeDialog';
import ApprovedPaymentEditModal from './ApprovedPaymentEditModal';

interface ApprovedPaymentDetailsModalProps {
  payment: Payment | null;
  onClose: () => void;
  onRevoked?: () => void;
}

const ApprovedPaymentDetailsModal = ({ payment, onClose, onRevoked }: ApprovedPaymentDetailsModalProps) => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [revokeComment, setRevokeComment] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Локальное состояние полей, которые могут быть изменены через редактирование
  const [localPayment, setLocalPayment] = useState<Payment | null>(payment);

  useEffect(() => {
    setLocalPayment(payment);
  }, [payment]);

  // Состояние редактирования отдела (inline, в шапке поля)
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isEditingDept, setIsEditingDept] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [isSavingDept, setIsSavingDept] = useState(false);
  const [currentDeptName, setCurrentDeptName] = useState<string | undefined>(payment?.department_name);
  const [auditKey, setAuditKey] = useState(0);

  const isAdmin = user?.roles?.some(role => role.name === 'Администратор' || role.name === 'Admin');

  // Загрузка списка отделов (только для админа, для inline-редактирования)
  const loadDepartments = useCallback(async () => {
    if (!isAdmin || departments.length > 0) return;
    try {
      const res = await fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=customer-departments`, {
        headers: { 'X-Auth-Token': token || '' },
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
    } catch {
      // не критично
    }
  }, [isAdmin, token, departments.length]);

  useEffect(() => {
    if (isEditingDept) loadDepartments();
  }, [isEditingDept, loadDepartments]);

  if (!localPayment) return null;

  const isCreator = user?.id === localPayment.created_by;
  const isCEO = user?.roles?.some(role => role.name === 'CEO' || role.name === 'Генеральный директор');
  const canRevoke = isCreator || isAdmin || isCEO;

  const handleStartEditDept = () => {
    setSelectedDeptId(localPayment.department_id ? String(localPayment.department_id) : 'none');
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
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({ payment_id: localPayment.id, department_id: newDeptId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Не удалось сохранить');
      }
      const result = await res.json();
      setCurrentDeptName(result.department_name ?? undefined);
      setLocalPayment(prev => prev ? { ...prev, department_id: result.department_id, department_name: result.department_name } : prev);
      setIsEditingDept(false);
      setAuditKey(k => k + 1);
      invalidatePaymentsCache();
      toast({ title: 'Сохранено', description: 'Отдел-заказчик обновлён' });
    } catch (e) {
      toast({ title: 'Ошибка', description: translateFetchError(e), variant: 'destructive' });
    } finally {
      setIsSavingDept(false);
    }
  };

  const handleRevokeClick = () => {
    setShowRevokeDialog(true);
  };

  const handleRevokeCancel = () => {
    setShowRevokeDialog(false);
    setRevokeComment('');
  };

  const handleRevokeConfirm = async () => {
    if (!revokeComment.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Укажите причину отзыва',
        variant: 'destructive',
      });
      return;
    }

    setIsRevoking(true);
    try {
      const response = await fetch(API_ENDPOINTS.approvalsApi, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({
          payment_id: localPayment.id,
          action: 'revoke',
          comment: revokeComment.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(translateApiError(error.error) || 'Не удалось отозвать платёж');
      }

      toast({
        title: 'Успешно',
        description: 'Платёж отозван и возвращён в черновики',
      });

      setShowRevokeDialog(false);
      setRevokeComment('');
      if (onRevoked) onRevoked();
      onClose();
    } catch (error) {
      console.error('Ошибка отзыва платежа:', error);
      toast({
        title: 'Ошибка',
        description: translateFetchError(error, 'Не удалось отозвать платёж'),
        variant: 'destructive',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleEditSaved = (updates: Partial<Payment>) => {
    setLocalPayment(prev => prev ? { ...prev, ...updates } : prev);
    if (updates.department_name !== undefined) {
      setCurrentDeptName(updates.department_name);
    }
    setAuditKey(k => k + 1);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-card border border-border rounded-xl w-full max-w-[1200px] max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Детали платежа #{localPayment.id}</h2>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-500/15 text-green-700 dark:text-green-300">✓ Одобрено CEO</span>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                title="Редактировать платёж"
              >
                <Icon name="Pencil" size={14} />
                Редактировать
              </button>
            )}
            <button
              onClick={onClose}
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <ApprovedPaymentInfo
            payment={localPayment}
            isAdmin={!!isAdmin}
            canRevoke={!!canRevoke}
            currentDeptName={currentDeptName}
            isEditingDept={isEditingDept}
            isSavingDept={isSavingDept}
            selectedDeptId={selectedDeptId}
            departments={departments}
            onStartEditDept={handleStartEditDept}
            onCancelEditDept={handleCancelEditDept}
            onSaveDept={handleSaveDept}
            onSelectDept={setSelectedDeptId}
            onRevokeClick={handleRevokeClick}
          />
          <ApprovedPaymentSidebar
            payment={localPayment}
            auditKey={auditKey}
          />
        </div>
      </div>

      <ApprovedPaymentRevokeDialog
        open={showRevokeDialog}
        isRevoking={isRevoking}
        revokeComment={revokeComment}
        onCommentChange={setRevokeComment}
        onConfirm={handleRevokeConfirm}
        onCancel={handleRevokeCancel}
      />

      {showEditModal && (
        <ApprovedPaymentEditModal
          open={showEditModal}
          payment={localPayment}
          onClose={() => setShowEditModal(false)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  );
};

export default ApprovedPaymentDetailsModal;