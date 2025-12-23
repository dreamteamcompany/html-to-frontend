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
      <div className="p-4 sm:p-6 md:p-8">
        <div 
          className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <Icon name="ArrowLeft" className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#7551e9' }} />
          <div style={{ 
            background: `linear-gradient(135deg, ${categoryInfo.color} 0%, ${categoryInfo.color}cc 100%)`,
            boxShadow: `0 0 25px ${categoryInfo.color}60`
          }} className="p-2.5 sm:p-3 rounded-xl">
            <Icon name={categoryInfo.icon} fallback="Tag" className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#fff' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mb-1 truncate">
              {categoryInfo.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#a3aed0] truncate">
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
                  className="bg-white/[0.03] p-3 sm:p-4 rounded-xl border border-white/[0.08] cursor-pointer transition-all duration-300 hover:bg-white/[0.05]"
                  style={{
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
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm sm:text-base font-semibold mb-1 truncate">
                        {payment.service}
                      </div>
                      <div className="text-[#a3aed0] text-xs sm:text-sm truncate">
                        {payment.contractor} • {payment.department}
                      </div>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                      <div style={{ color: categoryInfo.color }} className="text-base sm:text-lg font-bold">
                        {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(payment.amount)}
                      </div>
                      <div style={{
                        background: statusColors[payment.status] + '20',
                        color: statusColors[payment.status]
                      }} className="inline-block px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                        {statusLabels[payment.status] || payment.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-[#a3aed0] text-xs sm:text-sm mt-2 pt-2 border-t border-white/5 line-clamp-2">
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