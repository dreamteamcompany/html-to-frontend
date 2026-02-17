import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { Payment, CustomField } from '@/types/payment';

interface Service {
  id: number;
  name: string;
  intermediate_approver_id: number;
  final_approver_id: number;
}

export const usePendingApprovalsData = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!token || !user) return;

    setLoading(true);
    try {
      const [paymentsRes, servicesRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.main}?endpoint=payments`, {
          headers: { 'X-Auth-Token': token },
        }),
        fetch(`${API_ENDPOINTS.main}?endpoint=services`, {
          headers: { 'X-Auth-Token': token },
        }),
      ]);

      const paymentsData = await paymentsRes.json();
      const servicesData = await servicesRes.json();

      const servicesList = Array.isArray(servicesData) ? servicesData : (servicesData.services || []);
      setServices(servicesList);
      
      const allPaymentsData = Array.isArray(paymentsData) ? paymentsData : [];
      setAllPayments(allPaymentsData);
    } catch (err) {
      console.error('Failed to load data:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить платежи',
        variant: 'destructive',
      });
      setAllPayments([]);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [token, user, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Memoize filtered payments to avoid recalculation on every render
  const payments = useMemo(() => {
    if (!user) return [];

    return allPayments.filter((payment: Payment) => {
      if (!payment.status || !payment.service_id) {
        return false;
      }
      
      const service = services.find((s: Service) => s.id === payment.service_id);
      if (!service) {
        return false;
      }
      
      if (payment.status === 'pending_ceo' && service.final_approver_id === user.id) {
        return true;
      }
      
      return false;
    });
  }, [allPayments, services, user]);

  const handleApprove = useCallback(async (paymentId: number, approveComment?: string) => {
    console.log('[handleApprove] Called with paymentId:', paymentId, 'comment:', approveComment);
    try {
      const response = await fetch(`${API_ENDPOINTS.main}?endpoint=approvals`, {
        method: 'PUT',
        headers: {
          'X-Auth-Token': token!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          action: 'approve',
          comment: approveComment || '',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Платёж согласован',
        });
        setAllPayments(prevPayments => prevPayments.filter(p => p.id !== paymentId));
      } else {
        const errorData = await response.json();
        toast({
          title: 'Ошибка',
          description: errorData.error || 'Не удалось согласовать платёж',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Approve error:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось согласовать платёж',
        variant: 'destructive',
      });
    }
  }, [token, toast]);

  const handleReject = useCallback(async (paymentId: number, rejectComment?: string) => {
    console.log('[handleReject] Called with paymentId:', paymentId, 'comment:', rejectComment);
    try {
      const response = await fetch(`${API_ENDPOINTS.main}?endpoint=approvals`, {
        method: 'PUT',
        headers: {
          'X-Auth-Token': token!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_id: paymentId,
          action: 'reject',
          comment: rejectComment || '',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Платёж отклонён',
        });
        setAllPayments(prevPayments => prevPayments.filter(p => p.id !== paymentId));
      } else {
        const errorData = await response.json();
        toast({
          title: 'Ошибка',
          description: errorData.error || 'Не удалось отклонить платёж',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Reject error:', err);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить платёж',
        variant: 'destructive',
      });
    }
  }, [token, toast]);

  return {
    payments,
    services,
    loading,
    handleApprove,
    handleReject,
  };
};