import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';

interface Payment {
  id: number;
  status?: string;
  service_id?: number;
  description?: string;
  amount?: number;
  category_name?: string;
}

interface Service {
  id: number;
  intermediate_approver_id: number;
  final_approver_id: number;
}

const POLL_INTERVAL = 30_000;

export const usePendingApprovals = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const previousCountRef = useRef<number>(0);
  const isInitialLoad = useRef(true);
  const notifiedIdsRef = useRef<Set<number>>(new Set());

  const loadPendingApprovals = useCallback(async () => {
    if (!token || !user) return;
    try {
      const [paymentsRes, servicesRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.paymentsApi}?scope=all`, {
          headers: { 'X-Auth-Token': token },
        }),
        fetch(`${API_ENDPOINTS.main}?endpoint=services`, {
          headers: { 'X-Auth-Token': token },
        }),
      ]);

      if (!paymentsRes.ok || !servicesRes.ok) return;

      const paymentsData = await paymentsRes.json();
      const servicesData = await servicesRes.json();

      const allPayments = Array.isArray(paymentsData) ? paymentsData : [];
      const servicesRaw = Array.isArray(servicesData) ? servicesData : (servicesData?.services ?? []);
      const services: Service[] = Array.isArray(servicesRaw) ? servicesRaw : [];

      const myPendingPayments = allPayments.filter((payment: Payment) => {
        if (!payment.status || !payment.service_id) return false;

        const service = services.find((s: Service) => s.id === payment.service_id);
        if (!service) return false;

        if (payment.status === 'pending_tech_director' && service.intermediate_approver_id === user.id) {
          return true;
        }

        if (payment.status === 'pending_ceo' && service.final_approver_id === user.id) {
          return true;
        }

        return false;
      });

      const currentCount = myPendingPayments.length;
      setPendingCount(currentCount);
      setPendingPayments(myPendingPayments);

      if (!isInitialLoad.current && currentCount > previousCountRef.current) {
        const newPayments = myPendingPayments.filter(
          (p) => !notifiedIdsRef.current.has(p.id)
        );

        if (newPayments.length > 0) {
          const lastPayment = newPayments[0];
          newPayments.forEach((p) => notifiedIdsRef.current.add(p.id));

          toast({
            title: '🔔 Новый платёж на согласование',
            description: lastPayment?.description
              ? `${lastPayment.description} — ${lastPayment.amount?.toLocaleString('ru-RU')} ₽`
              : `${newPayments.length} ${newPayments.length === 1 ? 'новый платёж' : 'новых платежей'} ожидает согласования`,
            duration: 8000,
          });
        }
      }

      myPendingPayments.forEach((p) => notifiedIdsRef.current.add(p.id));
      previousCountRef.current = currentCount;
      isInitialLoad.current = false;
    } catch (err) {
      console.error('Failed to load pending approvals:', err);
    }
  }, [token, user, toast]);

  useEffect(() => {
    loadPendingApprovals();
    const interval = setInterval(loadPendingApprovals, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadPendingApprovals]);

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: '✅ Уведомления включены',
          description: 'Вы будете получать уведомления о новых платежах',
        });
      }
    }
  }, [toast]);

  return {
    pendingCount,
    pendingPayments,
    requestNotificationPermission,
  };
};