import { Card, CardContent } from '@/components/ui/card';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';
import Icon from '@/components/ui/icon';

const Dashboard2ChartsSection = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '30px' }}>
      {/* Динамика Расходов по Месяцам */}
      <Card style={{ 
        background: 'linear-gradient(135deg, rgba(17, 28, 68, 0.95) 0%, rgba(27, 37, 75, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(117, 81, 233, 0.2)',
        boxShadow: '0 8px 32px rgba(117, 81, 233, 0.15)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(117, 81, 233, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
              }}>
                <Icon name="TrendingUp" size={24} style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>Динамика Расходов</h3>
                <p style={{ fontSize: '13px', color: '#a3aed0', fontWeight: '500' }}>По месяцам</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(117, 81, 233, 0.1)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(117, 81, 233, 0.2)' }}>
              <button style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                border: 'none', 
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '13px', 
                fontWeight: '700', 
                boxShadow: '0 4px 12px rgba(117, 81, 233, 0.4)',
                transition: 'all 0.3s ease'
              }}>2024</button>
              <button style={{ background: 'transparent', border: 'none', color: '#a3aed0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.3s ease' }}>2023</button>
              <button style={{ background: 'transparent', border: 'none', color: '#a3aed0', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.3s ease' }}>2022</button>
            </div>
          </div>
          <div style={{ height: '350px', position: 'relative' }}>
            <Line
              data={{
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
                datasets: [{
                  label: 'Расходы',
                  data: [78000, 82000, 87000, 85000, 90000, 94000, 88000, 92000, 89000, 95000, 98000, 102000],
                  borderColor: '#667eea',
                  backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, 'rgba(102, 126, 234, 0.3)');
                    gradient.addColorStop(1, 'rgba(102, 126, 234, 0)');
                    return gradient;
                  },
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: '#667eea',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 3,
                  pointRadius: 6,
                  pointHoverRadius: 8,
                  pointHoverBackgroundColor: '#667eea',
                  pointHoverBorderColor: '#fff',
                  pointHoverBorderWidth: 4,
                  pointStyle: 'circle'
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
                    backgroundColor: 'rgba(17, 28, 68, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#a3aed0',
                    borderColor: 'rgba(117, 81, 233, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
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
                        size: 12,
                        weight: '600'
                      },
                      callback: function(value) {
                        return new Intl.NumberFormat('ru-RU', { notation: 'compact' }).format(value as number) + ' ₽';
                      }
                    },
                    grid: {
                      color: 'rgba(117, 81, 233, 0.08)',
                      drawBorder: false
                    }
                  },
                  x: {
                    ticks: {
                      color: '#a3aed0',
                      font: {
                        size: 12,
                        weight: '600'
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

      {/* IT Расходы по Категориям */}
      <Card style={{ 
        background: 'linear-gradient(135deg, rgba(17, 28, 68, 0.95) 0%, rgba(27, 37, 75, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(56, 239, 125, 0.2)',
        boxShadow: '0 8px 32px rgba(56, 239, 125, 0.15)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(56, 239, 125, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(56, 239, 125, 0.3)'
              }}>
                <Icon name="PieChart" size={24} style={{ color: '#fff' }} />
              </div>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>IT Расходы</h3>
                <p style={{ fontSize: '13px', color: '#a3aed0', fontWeight: '500' }}>По категориям</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', background: 'rgba(56, 239, 125, 0.1)', padding: '6px', borderRadius: '12px', border: '1px solid rgba(56, 239, 125, 0.2)' }}>
              <button style={{ 
                background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', 
                border: 'none', 
                color: 'white', 
                padding: '8px 16px', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                fontSize: '13px', 
                fontWeight: '700', 
                boxShadow: '0 4px 12px rgba(56, 239, 125, 0.4)',
                transition: 'all 0.3s ease'
              }}>Месяц</button>
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
                  backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, '#667eea');
                    gradient.addColorStop(1, '#764ba2');
                    return gradient;
                  },
                  borderRadius: 10,
                  borderSkipped: false
                }, {
                  label: 'Коммуникации',
                  data: [22000, 24000, 26000, 23000, 25000, 27000],
                  backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, '#4facfe');
                    gradient.addColorStop(1, '#00f2fe');
                    return gradient;
                  },
                  borderRadius: 10,
                  borderSkipped: false
                }, {
                  label: 'Веб-сайты',
                  data: [8000, 8500, 9000, 8200, 8800, 9500],
                  backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, '#fa709a');
                    gradient.addColorStop(1, '#fee140');
                    return gradient;
                  },
                  borderRadius: 10,
                  borderSkipped: false
                }, {
                  label: 'Безопасность',
                  data: [3000, 3500, 4000, 3200, 3800, 4200],
                  backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, '#11998e');
                    gradient.addColorStop(1, '#38ef7d');
                    return gradient;
                  },
                  borderRadius: 10,
                  borderSkipped: false
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
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      pointStyle: 'circle',
                      color: '#a3aed0',
                      font: {
                        family: 'Plus Jakarta Sans, sans-serif',
                        size: 13,
                        weight: '600'
                      }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(17, 28, 68, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#a3aed0',
                    borderColor: 'rgba(56, 239, 125, 0.3)',
                    borderWidth: 1,
                    padding: 12,
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
                      font: {
                        size: 12,
                        weight: '600'
                      },
                      callback: function(value) {
                        return new Intl.NumberFormat('ru-RU', { notation: 'compact' }).format(value as number) + ' ₽';
                      }
                    },
                    grid: {
                      color: 'rgba(56, 239, 125, 0.08)',
                      drawBorder: false
                    }
                  },
                  x: {
                    ticks: {
                      color: '#a3aed0',
                      font: {
                        size: 12,
                        weight: '600'
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

      {/* Сравнение по Контрагентам */}
      <Card style={{ 
        background: 'linear-gradient(135deg, rgba(17, 28, 68, 0.95) 0%, rgba(27, 37, 75, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(79, 172, 254, 0.2)',
        boxShadow: '0 8px 32px rgba(79, 172, 254, 0.15)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(79, 172, 254, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(79, 172, 254, 0.3)'
            }}>
              <Icon name="Users" size={24} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>Контрагенты</h3>
              <p style={{ fontSize: '13px', color: '#a3aed0', fontWeight: '500' }}>Сравнение расходов</p>
            </div>
          </div>
          <div style={{ height: '350px', position: 'relative' }}>
            <Radar
              data={{
                labels: ['ООО Яндекс', 'ООО Google', 'ООО Microsoft', 'ООО Amazon', 'ООО Oracle'],
                datasets: [{
                  label: 'Расходы',
                  data: [85000, 62000, 54000, 48000, 35000],
                  backgroundColor: 'rgba(79, 172, 254, 0.2)',
                  borderColor: '#4facfe',
                  borderWidth: 3,
                  pointBackgroundColor: '#4facfe',
                  pointBorderColor: '#fff',
                  pointBorderWidth: 3,
                  pointRadius: 6,
                  pointHoverRadius: 8,
                  pointHoverBackgroundColor: '#fff',
                  pointHoverBorderColor: '#4facfe',
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
                    backgroundColor: 'rgba(17, 28, 68, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#a3aed0',
                    borderColor: 'rgba(79, 172, 254, 0.3)',
                    borderWidth: 1,
                    padding: 12,
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
                        size: 11,
                        weight: '600'
                      },
                      callback: function(value) {
                        return new Intl.NumberFormat('ru-RU', { notation: 'compact' }).format(value as number);
                      }
                    },
                    grid: {
                      color: 'rgba(79, 172, 254, 0.1)'
                    },
                    pointLabels: {
                      color: '#fff',
                      font: {
                        size: 12,
                        weight: '700'
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Структура Расходов */}
      <Card style={{ 
        background: 'linear-gradient(135deg, rgba(17, 28, 68, 0.95) 0%, rgba(27, 37, 75, 0.95) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(250, 112, 154, 0.2)',
        boxShadow: '0 8px 32px rgba(250, 112, 154, 0.15)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          right: '-50px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(250, 112, 154, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'pulse 4s ease-in-out infinite'
        }} />
        <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(250, 112, 154, 0.3)'
            }}>
              <Icon name="BarChart3" size={24} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>Структура Расходов</h3>
              <p style={{ fontSize: '13px', color: '#a3aed0', fontWeight: '500' }}>По юридическим лицам</p>
            </div>
          </div>
          <div style={{ height: '350px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '80%', height: '80%' }}>
              <Doughnut
                data={{
                  labels: ['ООО Компания А', 'ООО Компания Б', 'ИП Иванов', 'ООО Компания В'],
                  datasets: [{
                    data: [120000, 85000, 45000, 34000],
                    backgroundColor: [
                      '#667eea',
                      '#11998e',
                      '#4facfe',
                      '#fa709a'
                    ],
                    borderWidth: 0,
                    hoverOffset: 15
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  cutout: '65%',
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        color: '#a3aed0',
                        font: {
                          family: 'Plus Jakarta Sans, sans-serif',
                          size: 13,
                          weight: '600'
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: 'rgba(17, 28, 68, 0.95)',
                      titleColor: '#fff',
                      bodyColor: '#a3aed0',
                      borderColor: 'rgba(250, 112, 154, 0.3)',
                      borderWidth: 1,
                      padding: 12,
                      callbacks: {
                        label: function(context) {
                          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                          const percentage = ((context.raw as number / total) * 100).toFixed(1);
                          return `${context.label}: ${new Intl.NumberFormat('ru-RU').format(context.raw as number)} ₽ (${percentage}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#fff', marginBottom: '4px' }}>284K</div>
              <div style={{ fontSize: '12px', color: '#a3aed0', fontWeight: '600' }}>Всего</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard2ChartsSection;
