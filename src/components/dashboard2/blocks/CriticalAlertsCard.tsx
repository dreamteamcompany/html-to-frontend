import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';

interface PaymentRecord {
  id: number;
  status: string;
  payment_date: string;
  description?: string;
  amount: number;
  [key: string]: unknown;
}

interface Alert {
  icon: string;
  text: string;
  color: string;
  urgent: boolean;
}

const CriticalAlertsCard = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await apiFetch(`${API_ENDPOINTS.main}?endpoint=payments`);
        if (controller.signal.aborted) return;
        const data = await res.json();
        const all: PaymentRecord[] = Array.isArray(data) ? data : [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const overdue = all.filter(p => {
          if (p.status !== 'pending') return false;
          const d = new Date(p.payment_date);
          return d < today;
        });

        const rejected = all.filter(p => p.status === 'rejected');

        const pending = all.filter(p => p.status === 'pending');

        const built: Alert[] = [];

        if (overdue.length > 0) {
          built.push({
            icon: 'Clock3',
            text: `Просрочено ${overdue.length} ${overdue.length === 1 ? 'платёж' : overdue.length < 5 ? 'платежа' : 'платежей'}`,
            color: '#ff6b6b',
            urgent: true,
          });
        }

        if (rejected.length > 0) {
          built.push({
            icon: 'XCircle',
            text: `${rejected.length} ${rejected.length === 1 ? 'отклонённый запрос' : rejected.length < 5 ? 'отклонённых запроса' : 'отклонённых запросов'}`,
            color: '#ffb547',
            urgent: false,
          });
        }

        if (pending.length > 0) {
          built.push({
            icon: 'AlertCircle',
            text: `${pending.length} ${pending.length === 1 ? 'платёж' : 'платежей'} ожидает согласования`,
            color: pending.length > 10 ? '#ff6b6b' : '#ffb547',
            urgent: pending.length > 10,
          });
        }

        if (built.length === 0) {
          built.push({
            icon: 'CheckCircle2',
            text: 'Всё в порядке — нет критических задач',
            color: '#01b574',
            urgent: false,
          });
        }

        setAlerts(built);
      } catch {
        // silent
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  return (
    <Card style={{
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)',
      border: '1px solid rgba(255, 107, 107, 0.3)',
      boxShadow: '0 0 30px rgba(255, 107, 107, 0.15), inset 0 0 20px rgba(255, 107, 107, 0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '150%', height: '150%',
        background: 'radial-gradient(circle, rgba(255, 107, 107, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />
      <CardContent className="p-4 sm:p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }} className="sm:gap-3 sm:mb-6">
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            padding: '8px', borderRadius: '10px',
            boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
            animation: 'pulse 2s infinite'
          }} className="sm:p-3">
            <Icon name="AlertTriangle" size={18} style={{ color: '#fff' }} className="sm:w-6 sm:h-6" />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }} className="sm:text-lg">Требуют внимания</h3>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} className="sm:gap-3.5">
            {alerts.map((alert, idx) => (
              <div key={idx} style={{
                background: alert.urgent ? 'rgba(255, 107, 107, 0.1)' : `rgba(255,255,255,0.04)`,
                padding: '10px', borderRadius: '10px',
                border: `1px solid ${alert.urgent ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', alignItems: 'center', gap: '10px',
                transition: 'all 0.3s ease', cursor: 'default'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = alert.urgent ? 'rgba(255, 107, 107, 0.15)' : 'rgba(255,255,255,0.07)';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = alert.urgent ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255,255,255,0.04)';
                e.currentTarget.style.transform = 'translateX(0)';
              }}>
                <div style={{
                  background: `${alert.color}22`, padding: '8px', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Icon name={alert.icon} size={16} style={{ color: alert.color }} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: '600' }} className="sm:text-sm">{alert.text}</span>
                </div>
                {alert.urgent && (
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#ff6b6b', boxShadow: '0 0 10px #ff6b6b',
                    animation: 'pulse 2s infinite'
                  }} />
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CriticalAlertsCard;
