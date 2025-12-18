import { Card, CardContent } from '@/components/ui/card';
import { Bar } from 'react-chartjs-2';

const ContractorComparisonChart = () => {
  return (
    <Card style={{ background: '#111c44', border: '1px solid rgba(57, 101, 255, 0.4)', boxShadow: '0 0 30px rgba(57, 101, 255, 0.2), inset 0 0 15px rgba(57, 101, 255, 0.05)' }}>
      <CardContent className="p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Сравнение по Контрагентам</h3>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
            <button style={{ background: '#7551e9', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)' }}>Топ-5</button>
            <button style={{ background: 'transparent', border: 'none', color: '#a3aed0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Все</button>
          </div>
        </div>
        <div style={{ height: '350px', position: 'relative' }}>
          <Bar
            data={{
              labels: ['ООО "Альфа-Софт"', 'ООО "Бета Системы"', 'ИП Соколов И.П.', 'ООО "ГаммаТех"', 'ЗАО "Дельта Плюс"'],
              datasets: [{
                label: 'Расходы',
                data: [72000, 54000, 35000, 18500, 4700],
                backgroundColor: [
                  'rgb(117, 81, 233)',
                  'rgb(57, 101, 255)',
                  'rgb(255, 181, 71)',
                  'rgb(1, 181, 116)',
                  'rgb(255, 107, 107)'
                ],
                borderRadius: 8,
                barThickness: 30
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
                    callback: function(value) {
                      return new Intl.NumberFormat('ru-RU').format(value as number) + ' ₽';
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
                      size: 12
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
      </CardContent>
    </Card>
  );
};

export default ContractorComparisonChart;
