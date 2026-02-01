import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface Service {
  name: string;
  amount: number;
  trend: number;
}

const Dashboard2ServicesDynamics = () => {
  const [hoveredService, setHoveredService] = useState<number | null>(null);

  const servicesData: Service[] = [
    { name: 'Облачные сервисы', amount: 150000, trend: 12 },
    { name: 'CRM-система', amount: 85000, trend: -5 },
    { name: 'Аналитика', amount: 65000, trend: 8 },
    { name: 'Хостинг', amount: 45000, trend: 0 },
    { name: 'Email-рассылки', amount: 35000, trend: 15 },
    { name: 'Видеоконференции', amount: 55000, trend: 10 },
    { name: 'Бухгалтерия', amount: 72000, trend: -3 },
    { name: 'Антивирус', amount: 28000, trend: 5 },
    { name: 'VPN-сервисы', amount: 42000, trend: 18 },
    { name: 'Мониторинг', amount: 38000, trend: 7 },
  ];

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
      background: '#111c44',
      backdropFilter: 'blur(60px)',
      border: 'none',
      boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
      overflow: 'hidden',
      position: 'relative',
      marginBottom: '20px'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '180%',
        height: '180%',
        background: 'radial-gradient(circle, rgba(57, 101, 255, 0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
        animation: 'rotate 30s linear infinite'
      }} />
      <CardContent className="p-3 sm:p-4 md:p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 sm:mb-6">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="sm:gap-2">
            <Icon name="Activity" size={16} style={{ color: '#2CD9FF' }} className="sm:w-[18px] sm:h-[18px]" />
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }} className="sm:text-base">Динамика расходов по сервисам</h3>
          </div>
        </div>

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
                fontSize: '12px', 
                fontWeight: '900',
                marginBottom: '2px'
              }}>
                {stat.value}
              </div>
              <div style={{ color: '#a3aed0', fontSize: '7px', fontWeight: '600' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Dashboard2ServicesDynamics;