import { Card, CardContent } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';
import { useState, useEffect } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';

interface PaymentRecord {
  status: string;
  payment_date: string;
  amount: number;
  department_name?: string;
  [key: string]: unknown;
}

const Dashboard2TeamPerformance = () => {
  const [currentData, setCurrentData] = useState<{name: string, amount: number}[]>([]);
  const [loading, setLoading] = useState(true);
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
        const response = await apiFetch(`${API_ENDPOINTS.main}?endpoint=payments`);
        const data = await response.json();
        
        const approvedPayments = (Array.isArray(data) ? data : []).filter((p: PaymentRecord) => 
          p.status === 'approved' || p.status === 'paid'
        );
        
        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        
        const currentMonthPayments = approvedPayments.filter((p: PaymentRecord) => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate >= currentMonthStart;
        });
        
        const previousMonthPayments = approvedPayments.filter((p: PaymentRecord) => {
          const paymentDate = new Date(p.payment_date);
          return paymentDate >= previousMonthStart && paymentDate <= previousMonthEnd;
        });
        
        const aggregateByDepartment = (payments: PaymentRecord[]) => {
          const deptMap: {[key: string]: number} = {};
          payments.forEach((payment: PaymentRecord) => {
            const dept = payment.department_name || 'Без отдела';
            if (!deptMap[dept]) {
              deptMap[dept] = 0;
            }
            deptMap[dept] += payment.amount;
          });
          return Object.entries(deptMap)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);
        };
        
        setCurrentData(aggregateByDepartment(currentMonthPayments));
      } catch (error) {
        console.error('Failed to fetch department data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDepartmentData();
  }, []);

  const activeData = currentData;

  const colors = [
    'rgb(1, 181, 116)',
    'rgb(0, 155, 98)',
    'rgb(0, 207, 142)',
    'rgb(78, 205, 196)',
    'rgb(0, 230, 160)',
    'rgb(52, 168, 83)',
  ];

  return (
    <Card style={{ background: '#111c44', border: '1px solid rgba(1, 181, 116, 0.4)', boxShadow: '0 0 30px rgba(1, 181, 116, 0.2), inset 0 0 15px rgba(1, 181, 116, 0.05)' }}>
      <CardContent className="p-6">
        <div style={{ marginBottom: '16px' }}>
          <h3 className="text-base sm:text-lg" style={{ fontWeight: '700', color: '#fff' }}>Сравнение по Отделам-Заказчикам</h3>
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
          <Bar
            data={{
              labels: activeData.map(d => d.name),
              datasets: [{
                label: 'Расходы',
                data: activeData.map(d => d.amount),
                backgroundColor: activeData.map((_, i) => colors[i % colors.length]),
                borderRadius: isMobile ? 4 : 8,
                barThickness: isMobile ? 20 : 30
              }]
            }}
            options={{
              indexAxis: 'y' as const,
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                mode: 'index' as const,
                intersect: false
              },
              elements: {
                bar: {
                  hoverBackgroundColor: undefined
                }
              },
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
                x: {
                  beginAtZero: true,
                  ticks: {
                    color: '#a3aed0',
                    font: {
                      size: isMobile ? 10 : 12
                    },
                    maxTicksLimit: isMobile ? 5 : 8,
                    callback: function(value) {
                      const numValue = value as number;
                      if (isMobile && numValue >= 1000) {
                        return (numValue / 1000).toFixed(0) + 'k ₽';
                      }
                      return new Intl.NumberFormat('ru-RU').format(numValue) + ' ₽';
                    }
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                  }
                },
                y: {
                  ticks: {
                    color: '#a3aed0',
                    font: {
                      size: isMobile ? 9 : 12
                    }
                  },
                  grid: {
                    display: false
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