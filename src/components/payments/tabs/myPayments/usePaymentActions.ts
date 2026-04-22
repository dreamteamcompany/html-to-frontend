import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { API_ENDPOINTS } from '@/config/api';
import { translateApiError } from '@/utils/api';
import { refreshPaymentsCacheStore } from '@/contexts/paymentsCacheStore';

interface UsePaymentActionsParams {
  loadPayments: () => void;
  onAfterSubmitForApproval?: () => void;
}

/**
 * Действия над платежом-черновиком: одобрение/отклонение (для самопроверки),
 * отправка на согласование, удаление.
 * Каждый метод сам показывает toast и перезагружает список.
 */
export const usePaymentActions = ({ loadPayments, onAfterSubmitForApproval }: UsePaymentActionsParams) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const { refresh: refreshNotifications } = useNotifications();

  const handleApprove = async (paymentId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.approvalsApi, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({ payment_id: paymentId, action: 'approve', comment: '' }),
      });
      if (response.ok) {
        toast({ title: 'Успешно', description: 'Платёж одобрен' });
        loadPayments();
        refreshPaymentsCacheStore();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: translateApiError(error.error) || 'Не удалось одобрить', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', description: 'Проверьте подключение к интернету', variant: 'destructive' });
    }
  };

  const handleReject = async (paymentId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.approvalsApi, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({ payment_id: paymentId, action: 'reject', comment: '' }),
      });
      if (response.ok) {
        toast({ title: 'Успешно', description: 'Платёж отклонён' });
        loadPayments();
        refreshPaymentsCacheStore();
      } else {
        const error = await response.json();
        toast({ title: 'Ошибка', description: translateApiError(error.error) || 'Не удалось отклонить', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка сети', description: 'Проверьте подключение к интернету', variant: 'destructive' });
    }
  };

  const handleSubmitForApproval = async (paymentId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.approvalsApi, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify({ payment_id: paymentId, action: 'submit' }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Платёж отправлен на согласование',
        });
        loadPayments();
        refreshPaymentsCacheStore();
        setTimeout(refreshNotifications, 1500);
        onAfterSubmitForApproval?.();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: translateApiError(error.error) || 'Не удалось отправить на согласование',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to submit for approval:', err);
      toast({
        title: 'Ошибка сети',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (paymentId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот черновик?')) {
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.main}?endpoint=payments&id=${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Черновик платежа удалён',
        });
        loadPayments();
        refreshPaymentsCacheStore();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: translateApiError(error.error) || 'Не удалось удалить платёж',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to delete payment:', err);
      toast({
        title: 'Ошибка сети',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    }
  };

  return { handleApprove, handleReject, handleSubmitForApproval, handleDelete };
};