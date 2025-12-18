import { Card, CardContent } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api';

const MonthlyDynamicsChart = () => {
  const [monthlyData, setMonthlyData] = useState<number[]>(Array(12).fill(0));
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
    const fetchApprovedPayments = async () => {
      try {
        const response = await apiFetch('https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=payments');
        const data = await response.json();
        
        const approvedPayments = (Array.isArray(data) ? data : []).filter((p: any) => 
          p.status === 'approved' || p.status === 'paid'
        );
        
        const monthsMap: { [key: number]: number } = {};
        approvedPayments.forEach((payment: any) => {
          const date = new Date(payment.payment_date);
          const month = date.getMonth();
          if (!monthsMap[month]) {
            monthsMap[month] = 0;
          }
          monthsMap[month] += payment.amount;
        });
        
        const dataArray = Array(12).fill(0).map((_, index) => monthsMap[index] || 0);
        setMonthlyData(dataArray);
      } catch (error) {
        console.error('Failed to fetch approved payments:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApprovedPayments();
  }, []);

  return (
    <Card className="w-full" style={{ background: '#111c44', border: '1px solid rgba(117, 81, 233, 0.4)', boxShadow: '0 0 30px rgba(117, 81, 233, 0.2), inset 0 0 15px rgba(117, 81, 233, 0.05)' }}>
      <CardContent className="p-4 sm:p-6">
        <div style={{ marginBottom: '16px' }}>
          <h3 className="text-base sm:text-lg" style={{ fontWeight: '700', color: '#fff' }}>Динамика Расходов по Месяцам</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: '250px' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
        <div className="h-[250px] sm:h-[350px]" style={{ position: 'relative' }}>
          <Line
            data={{
              labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
              datasets: [{
                label: 'Расходы',
                data: monthlyData,
                borderColor: 'rgb(117, 81, 233)',
                backgroundColor: 'rgba(117, 81, 233, 0.1)',
                borderWidth: isMobile ? 2 : 3,
                fill: true,
                tension: 0.4,
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
              interaction: {
                mode: 'index' as const,
                intersect: false
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
                y: {
                  beginAtZero: false,
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
                x: {
                  ticks: {
                    color: '#a3aed0',
                    font: {
                      size: isMobile ? 9 : 12
                    },
                    maxRotation: isMobile ? 45 : 0,
                    minRotation: isMobile ? 45 : 0
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

export default MonthlyDynamicsChart;