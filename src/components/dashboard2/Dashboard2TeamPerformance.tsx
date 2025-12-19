import { Card, CardContent } from '@/components/ui/card';
import { Radar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';

const Dashboard2TeamPerformance = () => {
  const [currentData, setCurrentData] = useState<{name: string, amount: number}[]>([]);
  const [previousData, setPreviousData] = useState<{name: string, amount: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'current' | 'previous'>('current');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchDepartmentData = async () => {
      try {
        const response = await apiFetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=payments');
        const data = await response.json();
        
        const approvedPayments = (Array.isArray(data) ? data : []).filter((p: any) => 
          p.status === 'approved' || p.status === 'paid'
        );
        
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        
        const currentMonthPayments = approvedPayments.filter((p: any) => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate >= currentMonthStart;
        });
        
        const previousMonthPayments = approvedPayments.filter((p: any) => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate >= previousMonthStart && paymentDate <= previousMonthEnd;
        });
        
        const aggregateByDepartment = (payments: any[]) => {
          const deptMap: {[key: string]: number} = {};
          payments.forEach((payment: any) => {
            const dept = payment.department_name || 'Без отдела';
            if (!deptMap[dept]) {
              deptMap[dept] = 0;
            }
            deptMap[dept] += payment.amount;
          });
          return Object.entries(deptMap).map(([name, amount]) => ({ name, amount }));
        };
        
        setCurrentData(aggregateByDepartment(currentMonthPayments));
        setPreviousData(aggregateByDepartment(previousMonthPayments));
      } catch (error) {
        console.error('Failed to fetch department data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepartmentData();
  }, []);

  const activeData = viewMode === 'current' ? currentData : previousData;

  return (
    <Card style={{ background: '#111c44', border: '1px solid rgba(1, 181, 116, 0.4)', boxShadow: '0 0 30px rgba(1, 181, 116, 0.2), inset 0 0 15px rgba(1, 181, 116, 0.05)' }}>
      <CardContent className="p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 className="text-base sm:text-lg" style={{ fontWeight: '700', color: '#fff' }}>Сравнение по Отделам-Заказчикам</h3>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
            <button 
              onClick={() => setViewMode('current')}
              style={{ 
                background: viewMode === 'current' ? '#7551e9' : 'transparent', 
                border: 'none', 
                color: viewMode === 'current' ? 'white' : '#a3aed0', 
                padding: isMobile ? '6px 12px' : '8px 16px', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: isMobile ? '11px' : '13px', 
                fontWeight: '600', 
                boxShadow: viewMode === 'current' ? '0 2px 8px rgba(117, 81, 233, 0.3)' : 'none'
              }}
            >
              Текущий
            </button>
            <button 
              onClick={() => setViewMode('previous')}
              style={{ 
                background: viewMode === 'previous' ? '#7551e9' : 'transparent', 
                border: 'none', 
                color: viewMode === 'previous' ? 'white' : '#a3aed0', 
                padding: isMobile ? '6px 12px' : '8px 16px', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: isMobile ? '11px' : '13px', 
                fontWeight: '600',
                boxShadow: viewMode === 'previous' ? '0 2px 8px rgba(117, 81, 233, 0.3)' : 'none'
              }}
            >
              Предыдущий
            </button>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: '250px' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        ) : activeData.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height: '250px' }}>
            <p style={{ color: '#a3aed0' }}>Нет данных за выбранный период</p>
          </div>
        ) : (
        <div className="h-[250px] sm:h-[350px]" style={{ position: 'relative' }}>
          <Radar
            data={{
              labels: activeData.map(d => d.name),
              datasets: [{
                label: 'Расходы',
                data: activeData.map(d => d.amount),
                backgroundColor: 'rgba(117, 81, 233, 0.2)',
                borderColor: 'rgb(117, 81, 233)',
                borderWidth: isMobile ? 2 : 3,
                pointBackgroundColor: 'rgb(117, 81, 233)',
                pointBorderColor: '#fff',
                pointBorderWidth: isMobile ? 1 : 2,
                pointRadius: isMobile ? 3 : 5,
                pointHoverRadius: isMobile ? 5 : 7,
                pointHoverBackgroundColor: 'rgb(117, 81, 233)',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: isMobile ? 2 : 3
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false
                },
                tooltip: {
                  enabled: !isMobile,
                  callbacks: {
                    label: function(context) {
                      return `Расходы: ${new Intl.NumberFormat('ru-RU').format(context.raw as number)} ₽`;
                    }
                  }
                }
              },
              scales: {
                r: {
                  beginAtZero: true,
                  ticks: {
                    color: '#a3aed0',
                    backdropColor: 'transparent',
                    font: {
                      size: isMobile ? 9 : 11
                    },
                    callback: function(value) {
                      const numValue = value as number;
                      if (isMobile && numValue >= 1000) {
                        return (numValue / 1000).toFixed(0) + 'k';
                      }
                      return new Intl.NumberFormat('ru-RU').format(numValue) + ' ₽';
                    }
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                  },
                  angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)'
                  },
                  pointLabels: {
                    color: '#a3aed0',
                    font: {
                      size: isMobile ? 10 : 13
                    }
                  }
                }
              }
            }}
          />
        </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard2TeamPerformance;