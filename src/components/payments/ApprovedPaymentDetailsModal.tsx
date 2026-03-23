import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { translateApiError } from '@/utils/api';
import { invalidatePaymentsCache } from '@/contexts/PaymentsCacheContext';
import ApprovedPaymentInfo, { Payment, Department } from './ApprovedPaymentInfo';
import ApprovedPaymentSidebar from './ApprovedPaymentSidebar';
import ApprovedPaymentRevokeDialog from './ApprovedPaymentRevokeDialog';

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

  // Состояние редактирования отдела
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isEditingDept, setIsEditingDept] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [isSavingDept, setIsSavingDept] = useState(false);
  const [currentDeptName, setCurrentDeptName] = useState<string | undefined>(payment?.department_name);
  const [auditKey, setAuditKey] = useState(0);

  const isAdmin = user?.roles?.some(role => role.name === 'Администратор' || role.name === 'Admin');

  // Загрузка списка отделов (только для админа)
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

  if (!payment) return null;

  const isCreator = user?.id === payment.created_by;
  const isCEO = user?.roles?.some(role => role.name === 'CEO' || role.name === 'Генеральный директор');
  const canRevoke = isCreator || isAdmin || isCEO;

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
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({ payment_id: payment.id, department_id: newDeptId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Не удалось сохранить');
      }
      const result = await res.json();
      setCurrentDeptName(result.department_name ?? undefined);
      setIsEditingDept(false);
      setAuditKey(k => k + 1);
      invalidatePaymentsCache();
      toast({ title: 'Сохранено', description: 'Отдел-заказчик обновлён' });
    } catch (e) {
      toast({ title: 'Ошибка', description: e instanceof Error ? e.message : 'Ошибка', variant: 'destructive' });
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
          payment_id: payment.id,
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
        description: error instanceof Error ? error.message : 'Не удалось отозвать платеж',
        variant: 'destructive',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-card border border-white/10 rounded-xl w-full max-w-[1200px] max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="bg-card border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold">Детали платежа #{payment.id}</h2>
            <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-300">✓ Одобрено CEO</span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <ApprovedPaymentInfo
            payment={payment}
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
            payment={payment}
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
    </div>
  );
};

export default ApprovedPaymentDetailsModal;
