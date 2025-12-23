import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { apiFetch } from '@/utils/api';
import PaymentDetailsModal from '@/components/payments/PaymentDetailsModal';

interface Payment {
  id: number;
  service: string;
  amount: number;
  status: string;
  payment_date: string;
  description: string;
  contractor: string;
  legal_entity: string;
  department: string;
}

interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
  total_amount: number;
  payments_count: number;
}

const CategoryPayments = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  
  const { sidebarOpen, setSidebarOpen, handleSidebarTouch } = useSidebarTouch();

  useEffect(() => {
    if (!categoryId) return;

    apiFetch(`https://functions.poehali.dev/20167b17-c827-4e24-b1a1-2ca1571d5bab?category_id=${categoryId}`)
      .then(res => res.json())
      .then(data => {
        setCategoryInfo(data.category);
        setPayments(data.payments);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load category payments:', err);
        setLoading(false);
      });
  }, [categoryId]);

  const statusColors: Record<string, string> = {
    draft: '#6c757d',
    pending: '#ffc107',
    approved: '#28a745',
    rejected: '#dc3545',
    paid: '#17a2b8'
  };

  const statusLabels: Record<string, string> = {
    draft: 'Черновик',
    pending: 'На согласовании',
    approved: 'Одобрено',
    rejected: 'Отклонено',
    paid: 'Оплачено'
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #0f1729 0%, #1a1f37 100%)' }}>
        <PaymentsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{ flex: 1, padding: '20px', color: '#a3aed0' }}>Загрузка...</div>
      </div>
    );
  }

  if (!categoryInfo) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #0f1729 0%, #1a1f37 100%)' }}>
        <PaymentsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div style={{ flex: 1, padding: '20px', color: '#a3aed0' }}>Категория не найдена</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #0f1729 0%, #1a1f37 100%)' }}>
      <PaymentsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div 
        style={{ flex: 1, overflow: 'auto' }}
        onTouchStart={handleSidebarTouch}
      >
      <div style={{ padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px', 
          marginBottom: '30px',
          cursor: 'pointer'
        }} onClick={() => navigate('/')}>
          <Icon name="ArrowLeft" size={24} style={{ color: '#7551e9' }} />
          <div style={{ 
            background: `linear-gradient(135deg, ${categoryInfo.color} 0%, ${categoryInfo.color}cc 100%)`,
            padding: '12px',
            borderRadius: '12px',
            boxShadow: `0 0 25px ${categoryInfo.color}60`
          }}>
            <Icon name={categoryInfo.icon} fallback="Tag" size={28} style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '5px' }}>
              {categoryInfo.name}
            </h1>
            <p style={{ color: '#a3aed0', fontSize: '14px' }}>
              {categoryInfo.payments_count} платежей • {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(categoryInfo.total_amount)}
            </p>
          </div>
        </div>

        <Card style={{ 
          background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
          border: '1px solid rgba(117, 81, 233, 0.3)'
        }}>
          <CardHeader>
            <CardTitle style={{ color: '#fff' }}>Все платежи</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {payments.map(payment => (
                <div
                  key={payment.id}
                  onClick={() => setSelectedPaymentId(payment.id)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = categoryInfo.color;
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        {payment.service}
                      </div>
                      <div style={{ color: '#a3aed0', fontSize: '13px' }}>
                        {payment.contractor} • {payment.department}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: categoryInfo.color, fontSize: '18px', fontWeight: '700' }}>
                        {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(payment.amount)}
                      </div>
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: statusColors[payment.status] + '20',
                        color: statusColors[payment.status],
                        marginTop: '4px'
                      }}>
                        {statusLabels[payment.status] || payment.status}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    color: '#a3aed0', 
                    fontSize: '12px',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    {payment.description}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedPaymentId && (
        <PaymentDetailsModal
          paymentId={selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
        />
      )}
      </div>
    </div>
  );
};

export default CategoryPayments;