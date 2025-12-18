import { Card, CardContent } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';

const CategoryExpensesChart = () => {
  return (
    <Card style={{ background: '#111c44', border: '1px solid rgba(1, 181, 116, 0.4)', boxShadow: '0 0 30px rgba(1, 181, 116, 0.2), inset 0 0 15px rgba(1, 181, 116, 0.05)' }}>
      <CardContent className="p-6">
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>IT Расходы по Категориям</h3>
        </div>
        <div style={{ height: '350px', position: 'relative' }}>
          <Bar
            data={{
              labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
              datasets: [{
                label: 'Серверы',
                data: [45000, 47000, 52000, 48000, 51000, 54000],
                backgroundColor: 'rgb(117, 81, 233)',
                borderRadius: 8
              }, {
                label: 'Коммуникации',
                data: [22000, 24000, 26000, 23000, 25000, 27000],
                backgroundColor: 'rgb(57, 101, 255)',
                borderRadius: 8
              }, {
                label: 'Веб-сайты',
                data: [8000, 8500, 9000, 8200, 8800, 9500],
                backgroundColor: 'rgb(255, 181, 71)',
                borderRadius: 8
              }, {
                label: 'Безопасность',
                data: [3000, 3500, 4000, 3200, 3800, 4200],
                backgroundColor: 'rgb(1, 181, 116)',
                borderRadius: 8
              }]
            }}
            options={{
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
                  position: 'bottom',
                  labels: {
                    padding: 20,
                    usePointStyle: true,
                    color: '#a3aed0',
                    font: {
                      family: 'Plus Jakarta Sans, sans-serif',
                      size: 13
                    }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.dataset.label}: ${new Intl.NumberFormat('ru-RU').format(context.raw as number)} ₽`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
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

export default CategoryExpensesChart;
