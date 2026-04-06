import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useMemo } from 'react';
import { usePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { parsePaymentDate } from '../dashboardUtils';

const AttentionRequiredCard = () => {
  const { payments: allPayments, loading } = usePaymentsCache();

  const { overdue, rejected } = useMemo(() => {
    const all = Array.isArray(allPayments) ? allPayments : [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      overdue: all.filter(p => p.status?.startsWith('pending_') && parsePaymentDate(p.payment_date) < today).length,
      rejected: all.filter(p => p.status === 'rejected').length,
    };
  }, [allPayments]);

  const items = [
    {
      icon: 'Clock3',
      text: loading ? '...' : overdue > 0
        ? `Просрочено ${overdue} ${overdue === 1 ? 'платёж' : overdue < 5 ? 'платежа' : 'платежей'}`
        : 'Просроченных платежей нет',
      color: overdue > 0 ? '#ff6b6b' : '#01b574',
    },
    {
      icon: 'XCircle',
      text: loading ? '...' : rejected > 0
        ? `${rejected} ${rejected === 1 ? 'отклонённый запрос' : rejected < 5 ? 'отклонённых запроса' : 'отклонённых запросов'}`
        : 'Отклонённых запросов нет',
      color: rejected > 0 ? '#ffb547' : '#01b574',
    },
  ];

  return (
    <Card style={{
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)',
      border: '1px solid rgba(255, 107, 107, 0.3)',
      boxShadow: '0 0 30px rgba(255, 107, 107, 0.15)',
      position: 'relative',
      overflow: 'hidden',
      height: '300px'
    }}>
      <CardContent className="p-4 sm:p-6" style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }} className="sm:mb-5">
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: '#fff' }} className="sm:text-lg sm:mb-2">Требуют внимания</div>
            <div style={{ color: 'rgba(200, 210, 230, 0.85)', fontSize: '12px', fontWeight: '500' }} className="sm:text-sm">Критические задачи</div>
          </div>
          <div style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', border: '1px solid rgba(255, 107, 107, 0.2)' }} className="w-8 h-8 sm:w-10 sm:h-10">
            <Icon name="AlertTriangle" size={18} className="sm:w-5 sm:h-5" />
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }} className="sm:gap-3">
          {items.map((item) => (
            <div key={item.icon} style={{
              background: 'rgba(255, 107, 107, 0.05)', padding: '10px', borderRadius: '8px',
              border: '1px solid rgba(255, 107, 107, 0.2)',
              display: 'flex', alignItems: 'center', gap: '10px'
            }} className="sm:p-3 sm:gap-3">
              <Icon name={item.icon} size={14} style={{ color: item.color, flexShrink: 0 }} className="sm:w-4 sm:h-4" />
              <span style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }} className="sm:text-sm">{item.text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttentionRequiredCard;
