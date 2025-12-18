import { Card, CardContent } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';

const MonthlyDynamicsChart = () => {
  return (
    <Card style={{ background: '#111c44', border: '1px solid rgba(117, 81, 233, 0.4)', boxShadow: '0 0 30px rgba(117, 81, 233, 0.2), inset 0 0 15px rgba(117, 81, 233, 0.05)' }}>
      <CardContent className="p-6">
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Динамика Расходов по Месяцам</h3>
        </div>
        <div style={{ height: '350px', position: 'relative' }}>
          <Line
            data={{
              labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
              datasets: [{
                label: 'Расходы',
                data: [78000, 82000, 87000, 85000, 90000, 94000, 88000, 92000, 89000, 95000, 98000, 102000],
                borderColor: 'rgb(117, 81, 233)',
                backgroundColor: 'rgba(117, 81, 233, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: 'rgb(117, 81, 233)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointHoverBackgroundColor: 'rgb(117, 81, 233)',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 3
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
                    callback: function(value) {
                      return new Intl.NumberFormat('ru-RU').format(value as number) + ' ₽';
                    }
                  },
                  grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                  }
                },
                x: {
                  ticks: {
                    color: '#a3aed0'
                  },
                  grid: {
                    display: false
                  }
                }
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyDynamicsChart;
