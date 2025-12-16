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

    <style>{`
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.7;
        }
      }
    `}</style>
    </>
  );
};

export default Dashboard2Charts;