import { Card, CardContent } from '@/components/ui/card';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import Icon from '@/components/ui/icon';

const Dashboard2Charts = () => {
  return (
    <>
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
              <button style={{ background: '#7551e9', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)' }}>Топ-10</button>
              <button style={{ background: 'transparent', border: 'none', color: '#a3aed0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Все</button>
            </div>
          </div>
          <div style={{ height: '350px', position: 'relative' }}>
            <Bar
              data={{
                labels: ['AWS', 'DigitalOcean', 'Google Cloud', 'Slack Pro', 'Zoom Business', 'Telegram API', 'Figma Org', 'Хостинг', 'GitHub Team', 'SSL'],
                datasets: [{
                  label: 'Расходы',
                  data: [45000, 24000, 29500, 12000, 18300, 15000, 14400, 8500, 4800, 4500],
                  backgroundColor: [
                    'rgb(117, 81, 233)',
                    'rgb(57, 101, 255)',
                    'rgb(44, 217, 255)',
                    'rgb(255, 181, 71)',
                    'rgb(1, 181, 116)',
                    'rgb(255, 107, 107)',
                    'rgb(123, 97, 255)',
                    'rgb(255, 140, 0)',
                    'rgb(0, 181, 180)',
                    'rgb(255, 99, 132)'
                  ],
                  borderRadius: 8,
                  barThickness: 25
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

      {/* Распределение Затрат */}
      <Card style={{ background: '#111c44', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <CardContent className="p-6">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Распределение Затрат</h3>
          </div>
          <div style={{ height: '350px', position: 'relative' }}>
            <Doughnut
              data={{
                labels: ['Серверы', 'Коммуникации', 'Веб-сайты', 'Безопасность'],
                datasets: [{
                  data: [98500, 45300, 25000, 15400],
                  backgroundColor: [
                    'rgb(117, 81, 233)',
                    'rgb(57, 101, 255)',
                    'rgb(255, 181, 71)',
                    'rgb(1, 181, 116)'
                  ],
                  borderColor: [
                    'rgb(117, 81, 233)',
                    'rgb(57, 101, 255)',
                    'rgb(255, 181, 71)',
                    'rgb(1, 181, 116)'
                  ],
                  borderWidth: 2
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                interaction: {
                  mode: 'point' as const
                },
                elements: {
                  arc: {
                    hoverBackgroundColor: undefined,
                    hoverBorderColor: undefined,
                    hoverBorderWidth: 2
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
                        const label = context.label || '';
                        const value = context.raw as number;
                        const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                        const percentage = Math.round((value / total) * 100);
                        return `${label}: ${new Intl.NumberFormat('ru-RU').format(value)} ₽ (${percentage}%)`;
                      }
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
    </div>

    {/* Новые красивые блоки с неоновыми эффектами */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '30px' }}>
      {/* Топ Платежей с неоновым свечением */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(117, 81, 233, 0.3)',
        boxShadow: '0 0 30px rgba(117, 81, 233, 0.15), inset 0 0 20px rgba(117, 81, 233, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(117, 81, 233, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(117, 81, 233, 0.5)'
            }}>
              <Icon name="TrendingUp" size={24} style={{ color: '#fff' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Топ-5 Платежей</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { name: 'AWS Hosting', amount: 45000, percent: 100, color: '#7551e9' },
              { name: 'Google Ads', amount: 38000, percent: 84, color: '#3965ff' },
              { name: 'Зарплата ИТ', amount: 32000, percent: 71, color: '#01b574' },
              { name: 'Софт лицензии', amount: 24000, percent: 53, color: '#ffb547' },
              { name: 'Обучение', amount: 18000, percent: 40, color: '#ff6b6b' }
            ].map((item, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.boxShadow = `0 0 20px ${item.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{item.name}</span>
                  <span style={{ color: item.color, fontSize: '14px', fontWeight: '700' }}>
                    {new Intl.NumberFormat('ru-RU').format(item.amount)} ₽
                  </span>
                </div>
                <div style={{ 
                  width: '100%', 
                  height: '6px', 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${item.percent}%`, 
                    height: '100%', 
                    background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}aa 100%)`,
                    borderRadius: '10px',
                    boxShadow: `0 0 10px ${item.color}`,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Статистика в реальном времени */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(1, 181, 116, 0.3)',
        boxShadow: '0 0 30px rgba(1, 181, 116, 0.15), inset 0 0 20px rgba(1, 181, 116, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(1, 181, 116, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #01b574 0%, #018c5a 100%)',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(1, 181, 116, 0.5)'
            }}>
              <Icon name="Activity" size={24} style={{ color: '#fff' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Live Метрики</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ 
              background: 'rgba(1, 181, 116, 0.1)',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(1, 181, 116, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ color: '#01b574', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Обработано сегодня
              </div>
              <div style={{ 
                color: '#fff', 
                fontSize: '36px', 
                fontWeight: '800',
                textShadow: '0 0 20px rgba(1, 181, 116, 0.5)'
              }}>
                127
              </div>
              <div style={{ color: '#a3aed0', fontSize: '13px', marginTop: '4px' }}>
                +18 за последний час
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ 
                background: 'rgba(255, 181, 71, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 181, 71, 0.2)',
                textAlign: 'center'
              }}>
                <Icon name="Clock" size={20} style={{ color: '#ffb547', marginBottom: '8px' }} />
                <div style={{ color: '#ffb547', fontSize: '24px', fontWeight: '700' }}>2.4ч</div>
                <div style={{ color: '#a3aed0', fontSize: '12px', marginTop: '4px' }}>Ср. время</div>
              </div>
              <div style={{ 
                background: 'rgba(117, 81, 233, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(117, 81, 233, 0.2)',
                textAlign: 'center'
              }}>
                <Icon name="CheckCircle2" size={20} style={{ color: '#7551e9', marginBottom: '8px' }} />
                <div style={{ color: '#7551e9', fontSize: '24px', fontWeight: '700' }}>94%</div>
                <div style={{ color: '#a3aed0', fontSize: '12px', marginTop: '4px' }}>Согласовано</div>
              </div>
            </div>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '14px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: '#a3aed0', fontSize: '13px' }}>На согласовании</span>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>23</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '6px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: '64%', 
                  height: '100%', 
                  background: 'linear-gradient(90deg, #01b574 0%, #01b574aa 100%)',
                  borderRadius: '10px',
                  boxShadow: '0 0 10px #01b574',
                  animation: 'pulse 2s infinite'
                }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Критичные уведомления */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(255, 107, 107, 0.3)',
        boxShadow: '0 0 30px rgba(255, 107, 107, 0.15), inset 0 0 20px rgba(255, 107, 107, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '150%',
          height: '150%',
          background: 'radial-gradient(circle, rgba(255, 107, 107, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
              animation: 'pulse 2s infinite'
            }}>
              <Icon name="AlertTriangle" size={24} style={{ color: '#fff' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Требуют внимания</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { icon: 'Clock3', text: 'Просрочено 4 платежа', color: '#ff6b6b', urgent: true },
              { icon: 'XCircle', text: '2 отклоненных запроса', color: '#ffb547', urgent: false },
              { icon: 'AlertCircle', text: 'Лимит приближается к 80%', color: '#ff6b6b', urgent: true },
              { icon: 'FileWarning', text: '3 документа без подписи', color: '#ffb547', urgent: false }
            ].map((alert, idx) => (
              <div key={idx} style={{ 
                background: alert.urgent ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 181, 71, 0.1)',
                padding: '16px',
                borderRadius: '12px',
                border: `1px solid ${alert.color}40`,
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = `0 0 20px ${alert.color}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}>
                <Icon name={alert.icon} size={20} style={{ color: alert.color, flexShrink: 0 }} />
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{alert.text}</span>
              </div>
            ))}
          </div>
          <div style={{ 
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(117, 81, 233, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(117, 81, 233, 0.2)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(117, 81, 233, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(117, 81, 233, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(117, 81, 233, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <span style={{ color: '#7551e9', fontSize: '14px', fontWeight: '600' }}>
              Посмотреть все уведомления
            </span>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Еще больше крутых блоков */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '30px' }}>
      {/* Тепловая карта расходов по дням недели */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(57, 101, 255, 0.3)',
        boxShadow: '0 0 30px rgba(57, 101, 255, 0.15), inset 0 0 20px rgba(57, 101, 255, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 20% 50%, rgba(57, 101, 255, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #3965ff 0%, #2d50cc 100%)',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(57, 101, 255, 0.5)'
            }}>
              <Icon name="Calendar" size={24} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Активность по дням</h3>
              <p style={{ fontSize: '13px', color: '#a3aed0', marginTop: '2px' }}>Последние 4 недели</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day, idx) => (
              <div key={idx} style={{ 
                textAlign: 'center', 
                color: '#a3aed0', 
                fontSize: '12px', 
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                {day}
              </div>
            ))}
            {Array.from({ length: 28 }).map((_, idx) => {
              const intensity = Math.random();
              const colors = [
                { bg: 'rgba(57, 101, 255, 0.1)', border: 'rgba(57, 101, 255, 0.2)', shadow: 'none' },
                { bg: 'rgba(57, 101, 255, 0.3)', border: 'rgba(57, 101, 255, 0.4)', shadow: '0 0 10px rgba(57, 101, 255, 0.3)' },
                { bg: 'rgba(57, 101, 255, 0.5)', border: 'rgba(57, 101, 255, 0.6)', shadow: '0 0 15px rgba(57, 101, 255, 0.5)' },
                { bg: 'rgba(57, 101, 255, 0.8)', border: 'rgba(57, 101, 255, 0.9)', shadow: '0 0 20px rgba(57, 101, 255, 0.7)' }
              ];
              const colorIdx = Math.floor(intensity * colors.length);
              const color = colors[colorIdx];
              return (
                <div key={idx} style={{ 
                  aspectRatio: '1',
                  background: color.bg,
                  border: `1px solid ${color.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: color.shadow
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(57, 101, 255, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = color.shadow;
                }}
                title={`${Math.floor(intensity * 50)} платежей`}
                />
              );
            })}
          </div>
          <div style={{ 
            marginTop: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '10px'
          }}>
            <span style={{ color: '#a3aed0', fontSize: '12px' }}>Меньше</span>
            {[0.1, 0.3, 0.5, 0.8].map((intensity, idx) => (
              <div key={idx} style={{
                width: '20px',
                height: '20px',
                background: `rgba(57, 101, 255, ${intensity})`,
                border: `1px solid rgba(57, 101, 255, ${intensity + 0.2})`,
                borderRadius: '4px'
              }} />
            ))}
            <span style={{ color: '#a3aed0', fontSize: '12px' }}>Больше</span>
          </div>
        </CardContent>
      </Card>

      {/* Прогноз расходов с AI */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(255, 181, 71, 0.3)',
        boxShadow: '0 0 30px rgba(255, 181, 71, 0.15), inset 0 0 20px rgba(255, 181, 71, 0.05)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 80% 80%, rgba(255, 181, 71, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #ffb547 0%, #ff9500 100%)',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(255, 181, 71, 0.5)',
              animation: 'glow 3s infinite'
            }}>
              <Icon name="Sparkles" size={24} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>AI Прогноз</h3>
              <p style={{ fontSize: '13px', color: '#a3aed0', marginTop: '2px' }}>На следующий месяц</p>
            </div>
          </div>
          <div style={{ 
            background: 'rgba(255, 181, 71, 0.1)',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 181, 71, 0.2)',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <div style={{ color: '#ffb547', fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              Ожидаемые расходы
            </div>
            <div style={{ 
              color: '#fff', 
              fontSize: '48px', 
              fontWeight: '900',
              textShadow: '0 0 30px rgba(255, 181, 71, 0.6)',
              marginBottom: '8px'
            }}>
              ₽1.2М
            </div>
            <div style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(1, 181, 116, 0.2)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(1, 181, 116, 0.3)'
            }}>
              <Icon name="TrendingDown" size={16} style={{ color: '#01b574' }} />
              <span style={{ color: '#01b574', fontSize: '14px', fontWeight: '600' }}>-8% от текущего</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Оптимизация', value: '₽120K', trend: 'down', color: '#01b574' },
              { label: 'Новые подписки', value: '₽45K', trend: 'up', color: '#ff6b6b' },
              { label: 'Экономия лицензий', value: '₽78K', trend: 'down', color: '#01b574' }
            ].map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = item.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              }}>
                <span style={{ color: '#a3aed0', fontSize: '14px' }}>{item.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon name={item.trend === 'up' ? 'ArrowUp' : 'ArrowDown'} size={16} style={{ color: item.color }} />
                  <span style={{ color: item.color, fontSize: '14px', fontWeight: '700' }}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Широкий блок - Детальная разбивка IT бюджета */}
    <Card style={{ 
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
      border: '1px solid rgba(117, 81, 233, 0.3)',
      boxShadow: '0 0 40px rgba(117, 81, 233, 0.2), inset 0 0 30px rgba(117, 81, 233, 0.08)',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '30px'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '0',
        width: '100%',
        height: '2px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(117, 81, 233, 0.5) 50%, transparent 100%)',
        pointerEvents: 'none',
        animation: 'slide 3s infinite'
      }} />
      <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
              padding: '14px',
              borderRadius: '14px',
              boxShadow: '0 0 25px rgba(117, 81, 233, 0.6)'
            }}>
              <Icon name="PieChart" size={28} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>Детальная Разбивка IT Бюджета</h3>
              <p style={{ fontSize: '14px', color: '#a3aed0', marginTop: '4px' }}>Полный анализ всех категорий расходов</p>
            </div>
          </div>
          <div style={{ 
            background: 'rgba(117, 81, 233, 0.15)',
            padding: '12px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(117, 81, 233, 0.3)'
          }}>
            <span style={{ color: '#7551e9', fontSize: '16px', fontWeight: '700' }}>Общий бюджет: ₽1.8М</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { icon: 'Server', name: 'Серверы & Хостинг', amount: 540000, percent: 30, color: '#7551e9', details: ['AWS: ₽320K', 'Azure: ₽150K', 'DigitalOcean: ₽70K'] },
            { icon: 'Cloud', name: 'SaaS Подписки', amount: 360000, percent: 20, color: '#3965ff', details: ['Microsoft 365: ₽140K', 'Slack: ₽120K', 'Adobe: ₽100K'] },
            { icon: 'Shield', name: 'Безопасность', amount: 324000, percent: 18, color: '#01b574', details: ['Антивирус: ₽150K', 'VPN: ₽100K', 'Firewall: ₽74K'] },
            { icon: 'Cpu', name: 'Оборудование', amount: 288000, percent: 16, color: '#ffb547', details: ['Ноутбуки: ₽180K', 'Мониторы: ₽68K', 'Сеть: ₽40K'] },
            { icon: 'Code', name: 'Dev Tools', amount: 180000, percent: 10, color: '#ff6b6b', details: ['GitHub: ₽80K', 'JetBrains: ₽60K', 'Postman: ₽40K'] },
            { icon: 'Database', name: 'Базы Данных', amount: 108000, percent: 6, color: '#a855f7', details: ['PostgreSQL: ₽50K', 'MongoDB: ₽38K', 'Redis: ₽20K'] }
          ].map((category, idx) => (
            <div key={idx} style={{ 
              background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}08 100%)`,
              padding: '20px',
              borderRadius: '16px',
              border: `1px solid ${category.color}30`,
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = `0 20px 40px ${category.color}40, 0 0 30px ${category.color}30`;
              e.currentTarget.style.borderColor = category.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = `${category.color}30`;
            }}>
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '150%',
                height: '150%',
                background: `radial-gradient(circle, ${category.color}20 0%, transparent 70%)`,
                pointerEvents: 'none',
                opacity: 0,
                transition: 'opacity 0.4s ease'
              }} className="hover-glow" />
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '16px',
                position: 'relative',
                zIndex: 1
              }}>
                <div style={{ 
                  background: `linear-gradient(135deg, ${category.color} 0%, ${category.color}cc 100%)`,
                  padding: '10px',
                  borderRadius: '10px',
                  boxShadow: `0 0 20px ${category.color}60`
                }}>
                  <Icon name={category.icon} size={20} style={{ color: '#fff' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {category.name}
                  </div>
                  <div style={{ color: '#a3aed0', fontSize: '12px' }}>{category.percent}% бюджета</div>
                </div>
              </div>
              <div style={{ 
                color: category.color, 
                fontSize: '24px', 
                fontWeight: '800',
                marginBottom: '12px',
                textShadow: `0 0 20px ${category.color}60`
              }}>
                {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0 }).format(category.amount)}
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                background: 'rgba(255, 255, 255, 0.08)', 
                borderRadius: '10px',
                overflow: 'hidden',
                marginBottom: '12px'
              }}>
                <div style={{ 
                  width: `${category.percent * 3.33}%`, 
                  height: '100%', 
                  background: `linear-gradient(90deg, ${category.color} 0%, ${category.color}aa 100%)`,
                  borderRadius: '10px',
                  boxShadow: `0 0 15px ${category.color}`,
                  transition: 'width 1s ease'
                }} />
              </div>
              <div style={{ fontSize: '12px', color: '#a3aed0', lineHeight: '1.6' }}>
                {category.details.map((detail, i) => (
                  <div key={i} style={{ marginBottom: '4px' }}>• {detail}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Еще один ряд крутых блоков */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '30px' }}>
      {/* Экономия за год */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(1, 181, 116, 0.3)',
        boxShadow: '0 0 30px rgba(1, 181, 116, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(1, 181, 116, 0.2) 0%, transparent 70%)',
          top: '-150px',
          left: '-150px',
          animation: 'rotate 20s linear infinite'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #01b574 0%, #018c5a 100%)',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(1, 181, 116, 0.5)',
            display: 'inline-flex',
            marginBottom: '20px'
          }}>
            <Icon name="PiggyBank" size={24} style={{ color: '#fff' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            Годовая Экономия
          </h3>
          <div style={{ 
            color: '#01b574', 
            fontSize: '42px', 
            fontWeight: '900',
            textShadow: '0 0 30px rgba(1, 181, 116, 0.6)',
            marginBottom: '12px'
          }}>
            ₽480K
          </div>
          <div style={{ color: '#a3aed0', fontSize: '14px', marginBottom: '20px' }}>
            За счет оптимизации подписок
          </div>
          <div style={{ 
            background: 'rgba(1, 181, 116, 0.1)',
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(1, 181, 116, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#a3aed0', fontSize: '13px' }}>Прогресс цели</span>
              <span style={{ color: '#01b574', fontSize: '13px', fontWeight: '700' }}>73%</span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '8px', 
              background: 'rgba(255, 255, 255, 0.05)', 
              borderRadius: '10px',
              overflow: 'hidden'
            }}>
              <div style={{ 
                width: '73%', 
                height: '100%', 
                background: 'linear-gradient(90deg, #01b574 0%, #01b574aa 100%)',
                borderRadius: '10px',
                boxShadow: '0 0 15px #01b574',
                animation: 'progress 2s ease-out'
              }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Скорость обработки */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(168, 85, 247, 0.3)',
        boxShadow: '0 0 30px rgba(168, 85, 247, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          bottom: '-100px',
          right: '-100px',
          animation: 'pulse 3s infinite'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)',
            display: 'inline-flex',
            marginBottom: '20px'
          }}>
            <Icon name="Zap" size={24} style={{ color: '#fff' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            Средняя Скорость
          </h3>
          <div style={{ 
            color: '#a855f7', 
            fontSize: '42px', 
            fontWeight: '900',
            textShadow: '0 0 30px rgba(168, 85, 247, 0.6)',
            marginBottom: '12px'
          }}>
            1.8ч
          </div>
          <div style={{ color: '#a3aed0', fontSize: '14px', marginBottom: '20px' }}>
            Обработка платежного запроса
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ 
              flex: 1,
              background: 'rgba(1, 181, 116, 0.15)',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(1, 181, 116, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ color: '#01b574', fontSize: '20px', fontWeight: '700' }}>-24%</div>
              <div style={{ color: '#a3aed0', fontSize: '11px', marginTop: '4px' }}>vs месяц назад</div>
            </div>
            <div style={{ 
              flex: 1,
              background: 'rgba(117, 81, 233, 0.15)',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(117, 81, 233, 0.3)',
              textAlign: 'center'
            }}>
              <div style={{ color: '#7551e9', fontSize: '20px', fontWeight: '700' }}>94%</div>
              <div style={{ color: '#a3aed0', fontSize: '11px', marginTop: '4px' }}>Автоматизация</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Команда */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(117, 81, 233, 0.3)',
        boxShadow: '0 0 30px rgba(117, 81, 233, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(117, 81, 233, 0.12) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'breathe 4s infinite'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(117, 81, 233, 0.5)',
            display: 'inline-flex',
            marginBottom: '20px'
          }}>
            <Icon name="Users" size={24} style={{ color: '#fff' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            Активные Пользователи
          </h3>
          <div style={{ 
            color: '#7551e9', 
            fontSize: '42px', 
            fontWeight: '900',
            textShadow: '0 0 30px rgba(117, 81, 233, 0.6)',
            marginBottom: '12px'
          }}>
            47
          </div>
          <div style={{ color: '#a3aed0', fontSize: '14px', marginBottom: '20px' }}>
            Работают с системой сейчас
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['Финансы', 'IT', 'HR', 'Продажи', 'Маркетинг'].map((dept, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(117, 81, 233, 0.15)',
                padding: '6px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(117, 81, 233, 0.3)',
                fontSize: '12px',
                color: '#7551e9',
                fontWeight: '600'
              }}>
                {dept}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Тепловая карта России и дополнительные блоки */}
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '30px' }}>
      {/* Тепловая карта России */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(255, 87, 51, 0.3)',
        boxShadow: '0 0 40px rgba(255, 87, 51, 0.2), inset 0 0 30px rgba(255, 87, 51, 0.08)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 87, 51, 0.1) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #ff5733 0%, #c70039 100%)',
                padding: '14px',
                borderRadius: '14px',
                boxShadow: '0 0 25px rgba(255, 87, 51, 0.6)',
                animation: 'glow 3s infinite'
              }}>
                <Icon name="Map" size={28} style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>География Расходов</h3>
                <p style={{ fontSize: '14px', color: '#a3aed0', marginTop: '4px' }}>Распределение по регионам РФ</p>
              </div>
            </div>
            <div style={{ 
              background: 'rgba(255, 87, 51, 0.15)',
              padding: '12px 24px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 87, 51, 0.3)'
            }}>
              <span style={{ color: '#ff5733', fontSize: '16px', fontWeight: '700' }}>Всего: ₽1.8М</span>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '16px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', maxWidth: '900px', margin: '0 auto' }}>
              {[
                { name: 'Москва', amount: 650000, percent: 36, color: '#ff0000', temp: 'hot' },
                { name: 'Санкт-Петербург', amount: 420000, percent: 23, color: '#ff5733', temp: 'warm' },
                { name: 'Казань', amount: 180000, percent: 10, color: '#ff8c42', temp: 'medium' },
                { name: 'Екатеринбург', amount: 150000, percent: 8, color: '#ffb347', temp: 'medium' },
                { name: 'Новосибирск', amount: 120000, percent: 7, color: '#ffd700', temp: 'cool' },
                { name: 'Краснодар', amount: 95000, percent: 5, color: '#90ee90', temp: 'cool' },
                { name: 'Нижний Новгород', amount: 75000, percent: 4, color: '#87ceeb', temp: 'cold' },
                { name: 'Красноярск', amount: 58000, percent: 3, color: '#6495ed', temp: 'cold' },
                { name: 'Владивосток', amount: 52000, percent: 3, color: '#4682b4', temp: 'cold' }
              ].map((region, idx) => (
                <div key={idx} style={{ 
                  background: `linear-gradient(135deg, ${region.color}20 0%, ${region.color}08 100%)`,
                  padding: '20px',
                  borderRadius: '16px',
                  border: `2px solid ${region.color}40`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)';
                  e.currentTarget.style.boxShadow = `0 20px 60px ${region.color}60, 0 0 40px ${region.color}80, inset 0 0 30px ${region.color}20`;
                  e.currentTarget.style.borderColor = region.color;
                  e.currentTarget.style.zIndex = '10';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = `${region.color}40`;
                  e.currentTarget.style.zIndex = '1';
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-100%',
                    left: '-100%',
                    width: '300%',
                    height: '300%',
                    background: `radial-gradient(circle, ${region.color}30 0%, transparent 60%)`,
                    animation: 'rotate 15s linear infinite',
                    pointerEvents: 'none'
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px'
                    }}>
                      <Icon name="MapPin" size={16} style={{ color: region.color, filter: `drop-shadow(0 0 8px ${region.color})` }} />
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '15px', 
                        fontWeight: '700',
                        textShadow: `0 0 10px ${region.color}80`
                      }}>
                        {region.name}
                      </div>
                    </div>
                    <div style={{ 
                      color: region.color, 
                      fontSize: '22px', 
                      fontWeight: '900',
                      marginBottom: '8px',
                      textShadow: `0 0 20px ${region.color}`,
                      letterSpacing: '-0.5px'
                    }}>
                      {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(region.amount)}
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '6px', 
                      background: 'rgba(0, 0, 0, 0.3)', 
                      borderRadius: '10px',
                      overflow: 'hidden',
                      marginBottom: '8px',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                    }}>
                      <div style={{ 
                        width: `${region.percent * 2.8}%`, 
                        height: '100%', 
                        background: `linear-gradient(90deg, ${region.color} 0%, ${region.color}dd 100%)`,
                        borderRadius: '10px',
                        boxShadow: `0 0 10px ${region.color}, 0 0 20px ${region.color}80`,
                        transition: 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
                      }} />
                    </div>
                    <div style={{ 
                      color: '#a3aed0', 
                      fontSize: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{region.percent}% от общего</span>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: region.color,
                        boxShadow: `0 0 12px ${region.color}`,
                        animation: 'pulse 2s infinite'
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ color: '#a3aed0', fontSize: '13px', fontWeight: '600' }}>Интенсивность:</span>
              {[
                { label: 'Холодно', color: '#4682b4' },
                { label: 'Прохладно', color: '#87ceeb' },
                { label: 'Тепло', color: '#ffd700' },
                { label: 'Жарко', color: '#ff8c42' },
                { label: 'Очень жарко', color: '#ff0000' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}cc 100%)`,
                    borderRadius: '4px',
                    border: `1px solid ${item.color}`,
                    boxShadow: `0 0 10px ${item.color}60`
                  }} />
                  <span style={{ color: '#a3aed0', fontSize: '12px' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Топ-3 региона с деталями */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(117, 81, 233, 0.3)',
        boxShadow: '0 0 30px rgba(117, 81, 233, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '0',
          right: '0',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle at 100% 100%, rgba(117, 81, 233, 0.15) 0%, transparent 50%)',
          pointerEvents: 'none'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
              padding: '12px',
              borderRadius: '12px',
              boxShadow: '0 0 20px rgba(117, 81, 233, 0.5)'
            }}>
              <Icon name="Trophy" size={24} style={{ color: '#fff' }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Топ-3 Региона</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { place: 1, name: 'Москва', amount: 650000, growth: '+12%', icon: '🥇', color: '#ffd700' },
              { place: 2, name: 'Санкт-Петербург', amount: 420000, growth: '+8%', icon: '🥈', color: '#c0c0c0' },
              { place: 3, name: 'Казань', amount: 180000, growth: '+15%', icon: '🥉', color: '#cd7f32' }
            ].map((region, idx) => (
              <div key={idx} style={{ 
                background: `linear-gradient(135deg, ${region.color}15 0%, ${region.color}05 100%)`,
                padding: '20px',
                borderRadius: '16px',
                border: `2px solid ${region.color}40`,
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)';
                e.currentTarget.style.boxShadow = `0 10px 30px ${region.color}40, 0 0 30px ${region.color}30`;
                e.currentTarget.style.borderColor = region.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = `${region.color}40`;
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-20%',
                  fontSize: '120px',
                  opacity: 0.1,
                  pointerEvents: 'none'
                }}>
                  {region.icon}
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '12px'
                  }}>
                    <div>
                      <div style={{ 
                        color: '#fff', 
                        fontSize: '17px', 
                        fontWeight: '700',
                        marginBottom: '4px'
                      }}>
                        {region.name}
                      </div>
                      <div style={{ 
                        color: region.color, 
                        fontSize: '24px', 
                        fontWeight: '900',
                        textShadow: `0 0 20px ${region.color}60`
                      }}>
                        {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(region.amount)}
                      </div>
                    </div>
                    <div style={{ 
                      background: 'rgba(1, 181, 116, 0.2)',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: '1px solid rgba(1, 181, 116, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Icon name="TrendingUp" size={14} style={{ color: '#01b574' }} />
                      <span style={{ color: '#01b574', fontSize: '13px', fontWeight: '700' }}>{region.growth}</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px' }}>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '10px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#a3aed0', fontSize: '11px', marginBottom: '4px' }}>Транзакций</div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>{Math.floor(region.amount / 5000)}</div>
                    </div>
                    <div style={{ 
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '10px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: '#a3aed0', fontSize: '11px', marginBottom: '4px' }}>Средний чек</div>
                      <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>₽{new Intl.NumberFormat('ru-RU').format(5000)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: '20px',
            padding: '16px',
            background: 'rgba(57, 101, 255, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(57, 101, 255, 0.2)',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(57, 101, 255, 0.2)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(57, 101, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(57, 101, 255, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <Icon name="BarChart3" size={20} style={{ color: '#3965ff', marginBottom: '8px' }} />
            <div style={{ color: '#3965ff', fontSize: '14px', fontWeight: '600' }}>
              Полный отчет по регионам
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Географическая карта России */}
    <Card style={{ 
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
      border: '1px solid rgba(117, 81, 233, 0.3)',
      boxShadow: '0 0 40px rgba(117, 81, 233, 0.2), inset 0 0 30px rgba(117, 81, 233, 0.08)',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '30px'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        height: '80%',
        background: 'radial-gradient(circle, rgba(117, 81, 233, 0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
        animation: 'breathe 6s infinite'
      }} />
      <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
              padding: '14px',
              borderRadius: '14px',
              boxShadow: '0 0 25px rgba(117, 81, 233, 0.6)',
              animation: 'glow 3s infinite'
            }}>
              <Icon name="Globe" size={28} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Географическая Карта Расходов</h3>
              <p style={{ fontSize: '14px', color: '#a3aed0', marginTop: '4px' }}>Интерактивная тепловая карта по регионам России</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#a3aed0', fontSize: '13px', fontWeight: '600' }}>Легенда:</span>
              {[
                { label: '< 50K', color: '#4682b4' },
                { label: '50K-100K', color: '#87ceeb' },
                { label: '100K-200K', color: '#ffd700' },
                { label: '200K-400K', color: '#ff8c42' },
                { label: '> 400K', color: '#ff0000' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    background: item.color,
                    borderRadius: '3px',
                    border: `1px solid ${item.color}`,
                    boxShadow: `0 0 8px ${item.color}60`
                  }} />
                  <span style={{ color: '#a3aed0', fontSize: '11px' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ 
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '20px',
          padding: '40px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'relative'
        }}>
          <svg viewBox="0 0 1000 600" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 0 20px rgba(117, 81, 233, 0.3))' }}>
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="heatGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#4682b4', stopOpacity: 1 }} />
                <stop offset="25%" style={{ stopColor: '#87ceeb', stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: '#ffd700', stopOpacity: 1 }} />
                <stop offset="75%" style={{ stopColor: '#ff8c42', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#ff0000', stopOpacity: 1 }} />
              </linearGradient>
            </defs>

            {/* Москва - Центр */}
            <g className="region-moscow" style={{ cursor: 'pointer' }}>
              <circle cx="380" cy="280" r="45" 
                fill="#ff0000" 
                fillOpacity="0.4"
                stroke="#ff0000" 
                strokeWidth="3"
                filter="url(#glow)"
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.setAttribute('r', '55');
                  e.currentTarget.setAttribute('fill-opacity', '0.7');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.setAttribute('r', '45');
                  e.currentTarget.setAttribute('fill-opacity', '0.4');
                }}
              />
              <text x="380" y="285" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700" style={{ pointerEvents: 'none' }}>
                Москва
              </text>
              <text x="380" y="305" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="600" style={{ pointerEvents: 'none' }}>
                ₽650K
              </text>
            </g>

            {/* Санкт-Петербург - Северо-Запад */}
            <g className="region-spb">
              <circle cx="330" cy="180" r="38" 
                fill="#ff5733" 
                fillOpacity="0.4"
                stroke="#ff5733" 
                strokeWidth="3"
                filter="url(#glow)"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.setAttribute('r', '48');
                  e.currentTarget.setAttribute('fill-opacity', '0.7');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.setAttribute('r', '38');
                  e.currentTarget.setAttribute('fill-opacity', '0.4');
                }}
              />
              <text x="330" y="183" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="700" style={{ pointerEvents: 'none' }}>
                СПб
              </text>
              <text x="330" y="200" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="600" style={{ pointerEvents: 'none' }}>
                ₽420K
              </text>
            </g>

            {/* Казань - Поволжье */}
            <g className="region-kazan">
              <circle cx="500" cy="260" r="30" 
                fill="#ff8c42" 
                fillOpacity="0.4"
                stroke="#ff8c42" 
                strokeWidth="2.5"
                filter="url(#glow)"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.setAttribute('r', '38');
                  e.currentTarget.setAttribute('fill-opacity', '0.7');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.setAttribute('r', '30');
                  e.currentTarget.setAttribute('fill-opacity', '0.4');
                }}
              />
              <text x="500" y="263" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="700" style={{ pointerEvents: 'none' }}>
                Казань
              </text>
              <text x="500" y="278" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="600" style={{ pointerEvents: 'none' }}>
                ₽180K
              </text>
            </g>

            {/* Екатеринбург - Урал */}
            <g className="region-ekb">
              <circle cx="600" cy="240" r="28" 
                fill="#ffb347" 
                fillOpacity="0.4"
                stroke="#ffb347" 
                strokeWidth="2.5"
                filter="url(#glow)"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.setAttribute('r', '36');
                  e.currentTarget.setAttribute('fill-opacity', '0.7');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.setAttribute('r', '28');
                  e.currentTarget.setAttribute('fill-opacity', '0.4');
                }}
              />
              <text x="600" y="242" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" style={{ pointerEvents: 'none' }}>
                Екатеринбург
              </text>
              <text x="600" y="256" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="600" style={{ pointerEvents: 'none' }}>
                ₽150K
              </text>
            </g>

            {/* Новосибирск - Сибирь */}
            <g className="region-nsk">
              <circle cx="720" cy="260" r="26" 
                fill="#ffd700" 
                fillOpacity="0.4"
                stroke="#ffd700" 
                strokeWidth="2.5"
                filter="url(#glow)"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.setAttribute('r', '34');
                  e.currentTarget.setAttribute('fill-opacity', '0.7');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.setAttribute('r', '26');
                  e.currentTarget.setAttribute('fill-opacity', '0.4');
                }}
              />
              <text x="720" y="262" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" style={{ pointerEvents: 'none' }}>
                Новосибирск
              </text>
              <text x="720" y="276" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="600" style={{ pointerEvents: 'none' }}>
                ₽120K
              </text>
            </g>

            {/* Краснодар - Юг */}
            <g className="region-krd">
              <circle cx="420" cy="380" r="24" 
                fill="#90ee90" 
                fillOpacity="0.4"
                stroke="#90ee90" 
                strokeWidth="2"
                filter="url(#glow)"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.setAttribute('r', '32');
                  e.currentTarget.setAttribute('fill-opacity', '0.7');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.setAttribute('r', '24');
                  e.currentTarget.setAttribute('fill-opacity', '0.4');
                }}
              />
              <text x="420" y="383" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700" style={{ pointerEvents: 'none' }}>
                Краснодар
              </text>
              <text x="420" y="396" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="600" style={{ pointerEvents: 'none' }}>
                ₽95K
              </text>
            </g>

            {/* Нижний Новгород */}
            <g className="region-nnov">
              <circle cx="450" cy="240" r="22" 
                fill="#87ceeb" 
                fillOpacity="0.4"
                stroke="#87ceeb" 
                strokeWidth="2"
                filter="url(#glow)"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.setAttribute('r', '30');
                  e.currentTarget.setAttribute('fill-opacity', '0.7');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.setAttribute('r', '22');
                  e.currentTarget.setAttribute('fill-opacity', '0.4');
                }}
              />
              <text x="450" y="242" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" style={{ pointerEvents: 'none' }}>
                Н.Новгород
              </text>
              <text x="450" y="255" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>
                ₽75K
              </text>
            </g>

            {/* Красноярск */}
            <g className="region-krsk">
              <circle cx="800" cy="230" r="20" 
                fill="#6495ed" 
                fillOpacity="0.4"
                stroke="#6495ed" 
                strokeWidth="2"
                filter="url(#glow)"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.setAttribute('r', '28');
                  e.currentTarget.setAttribute('fill-opacity', '0.7');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.setAttribute('r', '20');
                  e.currentTarget.setAttribute('fill-opacity', '0.4');
                }}
              />
              <text x="800" y="232" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" style={{ pointerEvents: 'none' }}>
                Красноярск
              </text>
              <text x="800" y="245" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>
                ₽58K
              </text>
            </g>

            {/* Владивосток - Дальний Восток */}
            <g className="region-vld">
              <circle cx="920" cy="330" r="19" 
                fill="#4682b4" 
                fillOpacity="0.4"
                stroke="#4682b4" 
                strokeWidth="2"
                filter="url(#glow)"
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.setAttribute('r', '27');
                  e.currentTarget.setAttribute('fill-opacity', '0.7');
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.setAttribute('r', '19');
                  e.currentTarget.setAttribute('fill-opacity', '0.4');
                }}
              />
              <text x="920" y="332" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="700" style={{ pointerEvents: 'none' }}>
                Владивосток
              </text>
              <text x="920" y="345" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600" style={{ pointerEvents: 'none' }}>
                ₽52K
              </text>
            </g>

            {/* Соединительные линии (тепловые потоки) */}
            <line x1="380" y1="280" x2="330" y2="180" stroke="url(#heatGradient)" strokeWidth="2" opacity="0.3" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite"/>
            </line>
            <line x1="380" y1="280" x2="500" y2="260" stroke="url(#heatGradient)" strokeWidth="2" opacity="0.3" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite"/>
            </line>
            <line x1="500" y1="260" x2="600" y2="240" stroke="url(#heatGradient)" strokeWidth="2" opacity="0.3" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite"/>
            </line>
            <line x1="600" y1="240" x2="720" y2="260" stroke="url(#heatGradient)" strokeWidth="2" opacity="0.3" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite"/>
            </line>
            <line x1="720" y1="260" x2="800" y2="230" stroke="url(#heatGradient)" strokeWidth="2" opacity="0.3" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite"/>
            </line>
            <line x1="800" y1="230" x2="920" y2="330" stroke="url(#heatGradient)" strokeWidth="2" opacity="0.3" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite"/>
            </line>

            {/* Фоновая сетка для эффекта */}
            <rect x="0" y="0" width="1000" height="600" fill="none" stroke="rgba(117, 81, 233, 0.1)" strokeWidth="1" strokeDasharray="20,20" opacity="0.3"/>
          </svg>

          {/* Tooltip placeholder */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '12px 20px',
            borderRadius: '10px',
            border: '1px solid rgba(117, 81, 233, 0.5)',
            boxShadow: '0 0 20px rgba(117, 81, 233, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Icon name="Info" size={16} style={{ color: '#7551e9' }} />
            <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
              Наведите на регион для подробной информации
            </span>
          </div>
        </div>

        {/* Статистика под картой */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(5, 1fr)', 
          gap: '16px',
          marginTop: '30px'
        }}>
          {[
            { icon: 'MapPin', label: 'Всего регионов', value: '9', color: '#7551e9' },
            { icon: 'TrendingUp', label: 'Средний рост', value: '+11%', color: '#01b574' },
            { icon: 'Target', label: 'Топ регион', value: 'Москва', color: '#ff0000' },
            { icon: 'DollarSign', label: 'Общий объем', value: '₽1.8М', color: '#ffb547' },
            { icon: 'Activity', label: 'Активность', value: 'Высокая', color: '#3965ff' }
          ].map((stat, idx) => (
            <div key={idx} style={{ 
              background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}08 100%)`,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${stat.color}30`,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 10px 30px ${stat.color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <Icon name={stat.icon} size={20} style={{ color: stat.color, marginBottom: '8px' }} />
              <div style={{ 
                color: stat.color, 
                fontSize: '20px', 
                fontWeight: '800',
                marginBottom: '4px',
                textShadow: `0 0 15px ${stat.color}60`
              }}>
                {stat.value}
              </div>
              <div style={{ color: '#a3aed0', fontSize: '11px', fontWeight: '600' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Гексагональная карта мира */}
    <Card style={{ 
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1117 100%)', 
      border: '1px solid rgba(117, 81, 233, 0.3)',
      boxShadow: '0 0 40px rgba(117, 81, 233, 0.2)',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '30px'
    }}>
      <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, #7551e9 0%, #5a3ec5 100%)',
              padding: '14px',
              borderRadius: '14px',
              boxShadow: '0 0 25px rgba(117, 81, 233, 0.6)'
            }}>
              <Icon name="Globe2" size={28} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>Глобальная География Расходов</h3>
              <p style={{ fontSize: '14px', color: '#a3aed0', marginTop: '4px' }}>Распределение пользователей по миру</p>
            </div>
          </div>
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '12px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <span style={{ color: '#a3aed0', fontSize: '13px', marginRight: '8px' }}>Всего пользователей:</span>
            <span style={{ color: '#7551e9', fontSize: '18px', fontWeight: '700' }}>22,650</span>
          </div>
        </div>

        <div style={{ 
          background: '#0a0e1a',
          borderRadius: '20px',
          padding: '40px 20px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          position: 'relative',
          minHeight: '500px'
        }}>
          <svg viewBox="0 0 1200 500" style={{ width: '100%', height: 'auto' }}>
            <defs>
              <pattern id="hexPattern" patternUnits="userSpaceOnUse" width="12" height="10.4">
                <polygon points="6,0 11.2,3 11.2,7.4 6,10.4 0.8,7.4 0.8,3" 
                  fill="none" 
                  stroke="rgba(100, 120, 200, 0.15)" 
                  strokeWidth="0.5"/>
              </pattern>
              <filter id="dotGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Гексагональная сетка континентов */}
            {/* Северная Америка */}
            <path d="M 80,120 L 150,80 L 250,90 L 280,140 L 260,200 L 200,230 L 150,220 L 100,180 Z" 
              fill="url(#hexPattern)" 
              stroke="rgba(100, 120, 200, 0.3)" 
              strokeWidth="1"
              opacity="0.6"/>
            
            {/* Южная Америка */}
            <path d="M 180,240 L 240,230 L 270,280 L 260,360 L 220,400 L 180,380 L 170,320 Z" 
              fill="url(#hexPattern)" 
              stroke="rgba(100, 120, 200, 0.3)" 
              strokeWidth="1"
              opacity="0.6"/>
            
            {/* Европа */}
            <path d="M 480,100 L 560,90 L 620,120 L 630,170 L 600,210 L 520,220 L 470,180 Z" 
              fill="url(#hexPattern)" 
              stroke="rgba(100, 120, 200, 0.3)" 
              strokeWidth="1"
              opacity="0.6"/>
            
            {/* Африка */}
            <path d="M 500,230 L 580,220 L 650,250 L 670,320 L 650,390 L 580,420 L 520,400 L 490,330 Z" 
              fill="url(#hexPattern)" 
              stroke="rgba(100, 120, 200, 0.3)" 
              strokeWidth="1"
              opacity="0.6"/>
            
            {/* Азия */}
            <path d="M 650,80 L 850,70 L 980,100 L 1020,180 L 980,250 L 880,270 L 720,250 L 660,180 Z" 
              fill="url(#hexPattern)" 
              stroke="rgba(100, 120, 200, 0.3)" 
              strokeWidth="1"
              opacity="0.6"/>
            
            {/* Австралия */}
            <path d="M 900,340 L 1000,330 L 1050,380 L 1040,430 L 980,460 L 910,450 L 880,400 Z" 
              fill="url(#hexPattern)" 
              stroke="rgba(100, 120, 200, 0.3)" 
              strokeWidth="1"
              opacity="0.6"/>

            {/* Точки пользователей - Европа (синие) */}
            {Array.from({ length: 40 }).map((_, i) => {
              const angle = (i / 40) * Math.PI * 2;
              const radius = 30 + Math.random() * 60;
              const cx = 550 + Math.cos(angle) * radius;
              const cy = 150 + Math.sin(angle) * radius;
              return (
                <circle key={`eu-${i}`} cx={cx} cy={cy} r="2.5" 
                  fill="#3b82f6" 
                  opacity={0.7 + Math.random() * 0.3}
                  filter="url(#dotGlow)">
                  <animate attributeName="opacity" 
                    values="0.7;1;0.7" 
                    dur={`${2 + Math.random() * 2}s`} 
                    repeatCount="indefinite"/>
                </circle>
              );
            })}

            {/* Точки пользователей - Северная Америка (оранжевые) */}
            {Array.from({ length: 35 }).map((_, i) => {
              const angle = (i / 35) * Math.PI * 2;
              const radius = 30 + Math.random() * 50;
              const cx = 180 + Math.cos(angle) * radius;
              const cy = 150 + Math.sin(angle) * radius;
              return (
                <circle key={`na-${i}`} cx={cx} cy={cy} r="2.5" 
                  fill="#f59e0b" 
                  opacity={0.7 + Math.random() * 0.3}
                  filter="url(#dotGlow)">
                  <animate attributeName="opacity" 
                    values="0.7;1;0.7" 
                    dur={`${2 + Math.random() * 2}s`} 
                    repeatCount="indefinite"/>
                </circle>
              );
            })}

            {/* Точки пользователей - Азия (красные и синие) */}
            {Array.from({ length: 80 }).map((_, i) => {
              const angle = (i / 80) * Math.PI * 2;
              const radius = 40 + Math.random() * 100;
              const cx = 850 + Math.cos(angle) * radius;
              const cy = 170 + Math.sin(angle) * radius;
              const isRed = i < 50;
              return (
                <circle key={`as-${i}`} cx={cx} cy={cy} r="2.5" 
                  fill={isRed ? "#ef4444" : "#3b82f6"} 
                  opacity={0.7 + Math.random() * 0.3}
                  filter="url(#dotGlow)">
                  <animate attributeName="opacity" 
                    values="0.7;1;0.7" 
                    dur={`${2 + Math.random() * 2}s`} 
                    repeatCount="indefinite"/>
                </circle>
              );
            })}

            {/* Точки пользователей - Африка (красные) */}
            {Array.from({ length: 30 }).map((_, i) => {
              const angle = (i / 30) * Math.PI * 2;
              const radius = 30 + Math.random() * 60;
              const cx = 580 + Math.cos(angle) * radius;
              const cy = 320 + Math.sin(angle) * radius;
              return (
                <circle key={`af-${i}`} cx={cx} cy={cy} r="2.5" 
                  fill="#ef4444" 
                  opacity={0.7 + Math.random() * 0.3}
                  filter="url(#dotGlow)">
                  <animate attributeName="opacity" 
                    values="0.7;1;0.7" 
                    dur={`${2 + Math.random() * 2}s`} 
                    repeatCount="indefinite"/>
                </circle>
              );
            })}

            {/* Точки пользователей - Южная Америка (фиолетовые) */}
            {Array.from({ length: 25 }).map((_, i) => {
              const angle = (i / 25) * Math.PI * 2;
              const radius = 25 + Math.random() * 45;
              const cx = 220 + Math.cos(angle) * radius;
              const cy = 310 + Math.sin(angle) * radius;
              return (
                <circle key={`sa-${i}`} cx={cx} cy={cy} r="2.5" 
                  fill="#a855f7" 
                  opacity={0.7 + Math.random() * 0.3}
                  filter="url(#dotGlow)">
                  <animate attributeName="opacity" 
                    values="0.7;1;0.7" 
                    dur={`${2 + Math.random() * 2}s`} 
                    repeatCount="indefinite"/>
                </circle>
              );
            })}

            {/* Точки пользователей - Австралия (зеленые) */}
            {Array.from({ length: 20 }).map((_, i) => {
              const angle = (i / 20) * Math.PI * 2;
              const radius = 20 + Math.random() * 40;
              const cx = 970 + Math.cos(angle) * radius;
              const cy = 390 + Math.sin(angle) * radius;
              return (
                <circle key={`au-${i}`} cx={cx} cy={cy} r="2.5" 
                  fill="#10b981" 
                  opacity={0.7 + Math.random() * 0.3}
                  filter="url(#dotGlow)">
                  <animate attributeName="opacity" 
                    values="0.7;1;0.7" 
                    dur={`${2 + Math.random() * 2}s`} 
                    repeatCount="indefinite"/>
                </circle>
              );
            })}

            {/* Метки с данными - Северная Америка */}
            <g>
              <rect x="130" y="100" width="120" height="50" rx="8" 
                fill="rgba(245, 158, 11, 0.15)" 
                stroke="#f59e0b" 
                strokeWidth="2"
                filter="url(#dotGlow)"/>
              <text x="145" y="120" fill="#f59e0b" fontSize="11" fontWeight="600">USA</text>
              <text x="145" y="138" fill="#fff" fontSize="16" fontWeight="800">12,328,300</text>
            </g>

            {/* Метки с данными - Европа */}
            <g>
              <rect x="510" y="60" width="120" height="50" rx="8" 
                fill="rgba(59, 130, 246, 0.15)" 
                stroke="#3b82f6" 
                strokeWidth="2"
                filter="url(#dotGlow)"/>
              <text x="525" y="80" fill="#3b82f6" fontSize="11" fontWeight="600">Europe</text>
              <text x="525" y="98" fill="#fff" fontSize="16" fontWeight="800">76,541,106</text>
            </g>

            {/* Метки с данными - Азия */}
            <g>
              <rect x="910" y="100" width="130" height="50" rx="8" 
                fill="rgba(239, 68, 68, 0.15)" 
                stroke="#ef4444" 
                strokeWidth="2"
                filter="url(#dotGlow)"/>
              <text x="925" y="120" fill="#ef4444" fontSize="11" fontWeight="600">Asia</text>
              <text x="925" y="138" fill="#fff" fontSize="16" fontWeight="800">239,570,110</text>
            </g>

            {/* Метки с данными - Африка */}
            <g>
              <rect x="540" y="270" width="120" height="50" rx="8" 
                fill="rgba(239, 68, 68, 0.15)" 
                stroke="#ef4444" 
                strokeWidth="2"
                filter="url(#dotGlow)"/>
              <text x="555" y="290" fill="#ef4444" fontSize="11" fontWeight="600">Africa</text>
              <text x="555" y="308" fill="#fff" fontSize="16" fontWeight="800">10,547,380</text>
            </g>

            {/* Метки с данными - Южная Америка */}
            <g>
              <rect x="160" y="260" width="120" height="50" rx="8" 
                fill="rgba(168, 85, 247, 0.15)" 
                stroke="#a855f7" 
                strokeWidth="2"
                filter="url(#dotGlow)"/>
              <text x="175" y="280" fill="#a855f7" fontSize="11" fontWeight="600">S. America</text>
              <text x="175" y="298" fill="#fff" fontSize="16" fontWeight="800">9,320,300</text>
            </g>

            {/* Метки с данными - Австралия */}
            <g>
              <rect x="930" y="360" width="120" height="50" rx="8" 
                fill="rgba(16, 185, 129, 0.15)" 
                stroke="#10b981" 
                strokeWidth="2"
                filter="url(#dotGlow)"/>
              <text x="945" y="380" fill="#10b981" fontSize="11" fontWeight="600">Oceania</text>
              <text x="945" y="398" fill="#fff" fontSize="16" fontWeight="800">6,097,321</text>
            </g>
          </svg>

          {/* Легенда внизу слева */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            background: 'rgba(0, 0, 0, 0.7)',
            padding: '12px 16px',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ color: '#a3aed0', fontSize: '11px', fontWeight: '600', marginBottom: '8px' }}>
              Новых пользователей
            </div>
            <div style={{ color: '#fff', fontSize: '20px', fontWeight: '800' }}>
              22,650
            </div>
          </div>
        </div>

        {/* Статистика по регионам */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, 1fr)', 
          gap: '16px',
          marginTop: '24px'
        }}>
          {[
            { region: 'Азия', users: '239M', color: '#ef4444', growth: '+18%' },
            { region: 'Европа', users: '76M', color: '#3b82f6', growth: '+12%' },
            { region: 'США', users: '12M', color: '#f59e0b', growth: '+8%' },
            { region: 'Африка', users: '10M', color: '#ef4444', growth: '+25%' },
            { region: 'Ю. Америка', users: '9M', color: '#a855f7', growth: '+15%' },
            { region: 'Океания', users: '6M', color: '#10b981', growth: '+10%' }
          ].map((stat, idx) => (
            <div key={idx} style={{ 
              background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}08 100%)`,
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${stat.color}30`,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 10px 30px ${stat.color}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={{ 
                width: '8px',
                height: '8px',
                background: stat.color,
                borderRadius: '50%',
                margin: '0 auto 8px',
                boxShadow: `0 0 12px ${stat.color}`
              }} />
              <div style={{ color: '#a3aed0', fontSize: '12px', marginBottom: '4px' }}>
                {stat.region}
              </div>
              <div style={{ 
                color: stat.color, 
                fontSize: '18px', 
                fontWeight: '800',
                marginBottom: '4px',
                textShadow: `0 0 15px ${stat.color}60`
              }}>
                {stat.users}
              </div>
              <div style={{ 
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                background: 'rgba(16, 185, 129, 0.2)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '11px'
              }}>
                <Icon name="TrendingUp" size={10} style={{ color: '#10b981' }} />
                <span style={{ color: '#10b981', fontWeight: '700' }}>{stat.growth}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Еще дополнительные блоки */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '30px' }}>
      {/* Средняя сумма платежа */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(57, 101, 255, 0.3)',
        boxShadow: '0 0 30px rgba(57, 101, 255, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(57, 101, 255, 0.2) 0%, transparent 70%)',
          top: '-75px',
          right: '-75px',
          animation: 'rotate 10s linear infinite'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #3965ff 0%, #2d50cc 100%)',
            padding: '10px',
            borderRadius: '10px',
            boxShadow: '0 0 20px rgba(57, 101, 255, 0.5)',
            display: 'inline-flex',
            marginBottom: '16px'
          }}>
            <Icon name="DollarSign" size={20} style={{ color: '#fff' }} />
          </div>
          <div style={{ color: '#a3aed0', fontSize: '13px', marginBottom: '8px' }}>
            Средний чек
          </div>
          <div style={{ 
            color: '#3965ff', 
            fontSize: '32px', 
            fontWeight: '900',
            textShadow: '0 0 20px rgba(57, 101, 255, 0.6)'
          }}>
            ₽14.2K
          </div>
        </CardContent>
      </Card>

      {/* Самый дорогой платеж */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(255, 107, 107, 0.3)',
        boxShadow: '0 0 30px rgba(255, 107, 107, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(255, 107, 107, 0.2) 0%, transparent 70%)',
          bottom: '-75px',
          left: '-75px',
          animation: 'pulse 3s infinite'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            padding: '10px',
            borderRadius: '10px',
            boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
            display: 'inline-flex',
            marginBottom: '16px'
          }}>
            <Icon name="Flame" size={20} style={{ color: '#fff' }} />
          </div>
          <div style={{ color: '#a3aed0', fontSize: '13px', marginBottom: '8px' }}>
            Макс. платеж
          </div>
          <div style={{ 
            color: '#ff6b6b', 
            fontSize: '32px', 
            fontWeight: '900',
            textShadow: '0 0 20px rgba(255, 107, 107, 0.6)'
          }}>
            ₽850K
          </div>
        </CardContent>
      </Card>

      {/* Количество отделов */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(1, 181, 116, 0.3)',
        boxShadow: '0 0 30px rgba(1, 181, 116, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(1, 181, 116, 0.2) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'breathe 4s infinite'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #01b574 0%, #018c5a 100%)',
            padding: '10px',
            borderRadius: '10px',
            boxShadow: '0 0 20px rgba(1, 181, 116, 0.5)',
            display: 'inline-flex',
            marginBottom: '16px'
          }}>
            <Icon name="Building2" size={20} style={{ color: '#fff' }} />
          </div>
          <div style={{ color: '#a3aed0', fontSize: '13px', marginBottom: '8px' }}>
            Активных отделов
          </div>
          <div style={{ 
            color: '#01b574', 
            fontSize: '32px', 
            fontWeight: '900',
            textShadow: '0 0 20px rgba(1, 181, 116, 0.6)'
          }}>
            24
          </div>
        </CardContent>
      </Card>

      {/* Время пиковой нагрузки */}
      <Card style={{ 
        background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
        border: '1px solid rgba(255, 181, 71, 0.3)',
        boxShadow: '0 0 30px rgba(255, 181, 71, 0.15)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(255, 181, 71, 0.2) 0%, transparent 70%)',
          bottom: '-75px',
          right: '-75px',
          animation: 'glow 3s infinite'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #ffb547 0%, #ff9500 100%)',
            padding: '10px',
            borderRadius: '10px',
            boxShadow: '0 0 20px rgba(255, 181, 71, 0.5)',
            display: 'inline-flex',
            marginBottom: '16px'
          }}>
            <Icon name="Clock" size={20} style={{ color: '#fff' }} />
          </div>
          <div style={{ color: '#a3aed0', fontSize: '13px', marginBottom: '8px' }}>
            Пик активности
          </div>
          <div style={{ 
            color: '#ffb547', 
            fontSize: '32px', 
            fontWeight: '900',
            textShadow: '0 0 20px rgba(255, 181, 71, 0.6)'
          }}>
            14:00
          </div>
        </CardContent>
      </Card>
    </div>

    <style>{`
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }
      @keyframes glow {
        0%, 100% {
          box-shadow: 0 0 20px rgba(255, 181, 71, 0.5);
        }
        50% {
          box-shadow: 0 0 40px rgba(255, 181, 71, 0.8);
        }
      }
      @keyframes slide {
        0% {
          transform: translateX(-100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
      @keyframes rotate {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
      @keyframes breathe {
        0%, 100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.1);
          opacity: 0.8;
        }
      }
      @keyframes progress {
        from {
          width: 0;
        }
      }
    `}</style>
    </>
  );
};

export default Dashboard2Charts;