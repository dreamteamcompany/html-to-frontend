import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { dashboardTypography } from './dashboardStyles';

interface Service {
  name: string;
  amount: number;
  trend: number;
}

interface Payment {
  amount: number;
  payment_date: string;
  service_name?: string;
  status: string;
}

const Dashboard2ServicesDynamics = () => {
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const [servicesData, setServicesData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServicesData();
  }, []);

  const loadServicesData = async () => {
    try {
      const response = await apiFetch(`${API_ENDPOINTS.main}?endpoint=payments`);
      const data = await response.json();
      
      const approvedPayments = (Array.isArray(data) ? data : []).filter((p: Payment) => 
        p.status === 'approved'
      );

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Платежи текущего месяца
      const currentMonthPayments = approvedPayments.filter((p: Payment) => {
        const paymentDate = new Date(p.payment_date);
        return paymentDate >= currentMonthStart;
      });

      // Платежи предыдущего месяца
      const previousMonthPayments = approvedPayments.filter((p: Payment) => {
        const paymentDate = new Date(p.payment_date);
        return paymentDate >= previousMonthStart && paymentDate <= previousMonthEnd;
      });

      // Группируем по сервисам для текущего месяца
      const currentByService: {[key: string]: number} = {};
      currentMonthPayments.forEach((p: Payment) => {
        const serviceName = p.service_name || 'Без сервиса';
        currentByService[serviceName] = (currentByService[serviceName] || 0) + p.amount;
      });

      // Группируем по сервисам для предыдущего месяца
      const previousByService: {[key: string]: number} = {};
      previousMonthPayments.forEach((p: Payment) => {
        const serviceName = p.service_name || 'Без сервиса';
        previousByService[serviceName] = (previousByService[serviceName] || 0) + p.amount;
      });

      // Формируем данные с трендами
      const services: Service[] = Object.keys(currentByService).map(serviceName => {
        const currentAmount = currentByService[serviceName];
        const previousAmount = previousByService[serviceName] || 0;
        
        let trend = 0;
        if (previousAmount > 0) {
          trend = Math.round(((currentAmount - previousAmount) / previousAmount) * 100);
        } else if (currentAmount > 0) {
          trend = 100; // Новый сервис
        }

        return {
          name: serviceName,
          amount: currentAmount,
          trend: trend
        };
      });

      setServicesData(services);
    } catch (error) {
      console.error('Failed to load services data:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedData = [...servicesData].sort((a, b) => b.amount - a.amount);
  const maxAmount = Math.max(...sortedData.map(s => s.amount));
  const totalAmount = sortedData.reduce((sum, s) => sum + s.amount, 0);
  const avgTrend = Math.round(sortedData.reduce((sum, s) => sum + s.trend, 0) / sortedData.length);

  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₽';
  };

  const barColors = ['#3965ff', '#2CD9FF', '#01B574', '#7551e9', '#ffb547'];

  return (
    <Card className="w-full max-w-full" style={{ 
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      overflow: 'hidden',
      position: 'relative',
      marginBottom: '20px'
    }}>
      <CardContent className="p-3 sm:p-4 md:p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="sm:gap-2">
            <Icon name="Activity" size={16} style={{ color: '#2CD9FF' }} className="sm:w-[18px] sm:h-[18px]" />
            <h3 className={`${dashboardTypography.cardTitle}`} style={{ color: 'hsl(var(--foreground))' }}>Динамика расходов по сервисам</h3>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center" style={{ height: '200px' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedData.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height: '200px', color: '#a3aed0' }}>
            Нет данных о платежах
          </div>
        ) : (
          <>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {sortedData.map((service, index) => {
            const barWidthPercent = (service.amount / maxAmount) * 100;
            const color = barColors[index % barColors.length];
            
            return (
              <div key={`service-${index}`} style={{
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '10px',
                padding: '10px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = color + '40';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span style={{ 
                    color: '#c8cfca', 
                    fontSize: '13px',
                    fontWeight: '500'
                  }} className="sm:text-sm">
                    {service.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span style={{ 
                      color: '#fff', 
                      fontSize: '13px', 
                      fontWeight: '600'
                    }} className="sm:text-sm">
                      {formatAmount(service.amount)}
                    </span>
                    {service.trend !== 0 && (
                      <div style={{
                        background: service.trend > 0 ? '#01B574' : '#E31A1A',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#fff'
                      }} className="sm:text-xs">
                        {service.trend > 0 ? '+' : ''}{service.trend}%
                      </div>
                    )}
                  </div>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${barWidthPercent}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${color}60 0%, ${color} 100%)`,
                    borderRadius: '3px',
                    transition: 'width 0.5s ease',
                    boxShadow: `0 0 10px ${color}60`
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '6px'
        }}>
          {[
            { 
              icon: 'Layers', 
              label: 'Всего сервисов', 
              value: sortedData.length.toString(), 
              color: '#3965ff',
              bgGradient: 'rgba(57, 101, 255, 0.15)'
            },
            { 
              icon: 'TrendingUp', 
              label: 'Растущих', 
              value: sortedData.filter(s => s.trend > 0).length.toString(), 
              color: '#01B574',
              bgGradient: 'rgba(1, 181, 116, 0.15)'
            },
            { 
              icon: 'TrendingDown', 
              label: 'Снижающихся', 
              value: sortedData.filter(s => s.trend < 0).length.toString(), 
              color: '#ff6b6b',
              bgGradient: 'rgba(255, 107, 107, 0.15)'
            }
          ].map((stat, idx) => (
            <div key={idx} style={{ 
              background: `linear-gradient(135deg, ${stat.bgGradient} 0%, ${stat.bgGradient}80 100%)`,
              padding: '6px',
              borderRadius: '6px',
              border: `1px solid ${stat.color}30`,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.borderColor = stat.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = `${stat.color}30`;
            }}>
              <Icon name={stat.icon} size={10} style={{ color: stat.color, marginBottom: '3px' }} />
              <div style={{ 
                color: stat.color, 
                fontSize: '20px', 
                fontWeight: '900',
                marginBottom: '2px'
              }}>
                {stat.value}
              </div>
              <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '15px', fontWeight: '600' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        </>
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard2ServicesDynamics;