import { Card, CardContent } from '@/components/ui/card';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';

const Dashboard2ChartsSection = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '30px' }}>
      {/* Динамика Расходов по Месяцам */}
      <Card style={{ background: '#111c44', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <CardContent className="p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Динамика Расходов по Месяцам</h3>
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
              <button style={{ background: '#7551e9', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)' }}>2024</button>
              <button style={{ background: 'transparent', border: 'none', color: '#a3aed0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>2023</button>
              <button style={{ background: 'transparent', border: 'none', color: '#a3aed0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>2022</button>
            </div>
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

      {/* IT Расходы по Категориям */}
      <Card style={{ background: '#111c44', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <CardContent className="p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>IT Расходы по Категориям</h3>
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
              <button style={{ background: '#7551e9', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)' }}>Месяц</button>
              <button style={{ background: 'transparent', border: 'none', color: '#a3aed0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Квартал</button>
              <button style={{ background: 'transparent', border: 'none', color: '#a3aed0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Год</button>
            </div>
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

      {/* Сравнение по Контрагентам */}
      <Card style={{ background: '#111c44', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
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

      {/* Структура Расходов */}
      <Card style={{ background: '#111c44', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <CardContent className="p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Структура Расходов</h3>
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
              <button style={{ background: '#7551e9', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)' }}>Общие</button>
              <button style={{ background: 'transparent', border: 'none', color: '#a3aed0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Детали</button>
            </div>
          </div>
          <div style={{ height: '350px', position: 'relative' }}>
            <Doughnut
              data={{
                labels: ['IT', 'Маркетинг', 'HR', 'Офис', 'Прочее'],
                datasets: [{
                  data: [45, 25, 15, 10, 5],
                  backgroundColor: [
                    'rgb(117, 81, 233)',
                    'rgb(57, 101, 255)',
                    'rgb(255, 181, 71)',
                    'rgb(1, 181, 116)',
                    'rgb(255, 107, 107)'
                  ],
                  borderWidth: 0,
                  hoverOffset: 10
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'right',
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
                        return `${context.label}: ${context.parsed}%`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Сравнение по Юридическим Лицам */}
      <Card style={{ background: '#111c44', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <CardContent className="p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Сравнение по Юридическим Лицам</h3>
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
              <button style={{ background: '#7551e9', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)' }}>Все</button>
              <button style={{ background: 'transparent', border: 'none', color: '#a3aed0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Активные</button>
            </div>
          </div>
          <div style={{ height: '350px', position: 'relative' }}>
            <Bar
              data={{
                labels: ['ООО "ТехноЛаб"', 'ООО "ДиджиталКод"', 'ИП Иванов А.С.', 'ООО "СмартТех"', 'АО "ИнноваПром"'],
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

      {/* Сравнение Затрат по Отделам-Заказчикам */}
      <Card style={{ background: '#111c44', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
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
    </div>
  );
};

export default Dashboard2ChartsSection;
