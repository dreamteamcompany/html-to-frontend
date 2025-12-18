import { Card, CardContent } from '@/components/ui/card';
import { Radar } from 'react-chartjs-2';

const DepartmentComparisonChart = () => {
  return (
    <Card style={{ background: '#111c44', border: '1px solid rgba(1, 181, 116, 0.4)', boxShadow: '0 0 30px rgba(1, 181, 116, 0.2), inset 0 0 15px rgba(1, 181, 116, 0.05)' }}>
      <CardContent className="p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Сравнение Затрат по Отделам-Заказчикам</h3>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
            <button style={{ background: '#7551e9', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)' }}>Текущий</button>
            <button style={{ background: 'transparent', border: 'none', color: '#a3aed0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Предыдущий</button>
          </div>
        </div>
        <div style={{ height: '350px', position: 'relative' }}>
          <Radar
            data={{
              labels: ['IT-отдел', 'Маркетинг', 'Продажи', 'Финансы', 'HR', 'Разработка'],
              datasets: [{
                label: 'Расходы',
                data: [85000, 42000, 38000, 28000, 22000, 95000],
                backgroundColor: 'rgba(117, 81, 233, 0.2)',
                borderColor: 'rgb(117, 81, 233)',
                borderWidth: 3,
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
                r: {
                  beginAtZero: true,
                  ticks: {
                    color: '#a3aed0',
                    backdropColor: 'transparent',
                    callback: function(value) {
                      return new Intl.NumberFormat('ru-RU').format(value as number) + ' ₽';
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
                      size: 13
                    }
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

export default DepartmentComparisonChart;
