import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import PaymentsHeader from '@/components/payments/PaymentsHeader';
import Icon from '@/components/ui/icon';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard2 = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      setMenuOpen(false);
    }
  };

  const payments = [
    { id: 1, service: 'AWS EC2', category: 'server', description: 'Виртуальные серверы для продакшена', amount: 45000, date: '15.01.2024', status: 'paid' },
    { id: 2, service: 'DigitalOcean', category: 'server', description: 'Droplet серверы для разработки', amount: 24000, date: '10.01.2024', status: 'paid' },
    { id: 3, service: 'Google Cloud', category: 'server', description: 'Облачные вычисления', amount: 29500, date: '05.01.2024', status: 'paid' },
    { id: 4, service: 'Telegram API', category: 'communication', description: 'API для корпоративных ботов', amount: 15000, date: '03.01.2024', status: 'paid' },
    { id: 5, service: 'Slack Pro', category: 'communication', description: 'Корпоративный чат и интеграции', amount: 12000, date: '01.01.2024', status: 'paid' },
    { id: 6, service: 'Zoom Business', category: 'communication', description: 'Видеоконференции', amount: 18300, date: '28.12.2023', status: 'paid' },
    { id: 7, service: 'Доменное имя', category: 'website', description: 'Продление домена example.com', amount: 1200, date: '25.12.2023', status: 'paid' },
    { id: 8, service: 'Хостинг провайдер', category: 'website', description: 'Веб-хостинг для сайтов', amount: 8500, date: '20.12.2023', status: 'paid' },
    { id: 9, service: 'Cloudflare Pro', category: 'security', description: 'CDN и защита от DDoS', amount: 2000, date: '15.12.2023', status: 'paid' },
    { id: 10, service: 'SSL сертификаты', category: 'security', description: 'Wildcard SSL сертификаты', amount: 4500, date: '10.12.2023', status: 'paid' },
    { id: 11, service: 'GitHub Team', category: 'server', description: 'Приватные репозитории', amount: 4800, date: '05.12.2023', status: 'paid' },
    { id: 12, service: 'Figma Organization', category: 'communication', description: 'Дизайн и прототипирование', amount: 14400, date: '01.12.2023', status: 'paid' }
  ];

  const getServiceIcon = (category: string) => {
    const icons: Record<string, string> = {
      'server': 'Server',
      'communication': 'MessageCircle',
      'website': 'Globe',
      'security': 'Shield'
    };
    return icons[category] || 'Box';
  };

  const getCategoryName = (category: string) => {
    const categories: Record<string, string> = {
      'server': 'Серверы',
      'communication': 'Коммуникации',
      'website': 'Веб-сайты',
      'security': 'Безопасность'
    };
    return categories[category] || category;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';
  };

  const filteredPayments = activeFilter === 'all' 
    ? payments 
    : payments.filter(p => p.category === activeFilter);

  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #0f1535 0%, #1b254b 100%)' }}>
      <PaymentsSidebar
        menuOpen={menuOpen}
        dictionariesOpen={dictionariesOpen}
        setDictionariesOpen={setDictionariesOpen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />

      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="lg:ml-[250px] p-4 md:p-6 lg:p-[30px] min-h-screen flex-1">
        <PaymentsHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <div style={{ padding: '20px 0' }}>
          {/* Dashboard Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '30px' }}>
            {/* Общие IT Расходы */}
            <Card style={{ background: '#111c44', border: '1px solid rgba(255, 255, 255, 0.05)', borderTop: '4px solid #7551e9' }}>
              <CardContent className="p-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Общие IT Расходы</div>
                    <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>Все время</div>
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(117, 81, 233, 0.1)', color: '#7551e9', border: '1px solid rgba(117, 81, 233, 0.2)' }}>
                    <Icon name="Server" size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>184,200 ₽</div>
                <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>Общая сумма расходов</div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: '#e31a1a' }}>
                  <Icon name="ArrowUp" size={14} /> +12.5% с прошлого месяца
                </div>
              </CardContent>
            </Card>

            {/* Серверная Инфраструктура */}
            <Card style={{ background: '#111c44', border: '1px solid rgba(255, 255, 255, 0.05)', borderTop: '4px solid #7551e9' }}>
              <CardContent className="p-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Серверная Инфраструктура</div>
                    <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>Расходы на серверы</div>
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(1, 181, 116, 0.1)', color: '#01b574', border: '1px solid rgba(1, 181, 116, 0.2)' }}>
                    <Icon name="Database" size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>98,500 ₽</div>
                <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>53.4% от общего бюджета</div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: '#e31a1a' }}>
                  <Icon name="ArrowUp" size={14} /> +8.2% с прошлого месяца
                </div>
              </CardContent>
            </Card>

            {/* Коммуникационные Сервисы */}
            <Card style={{ background: '#111c44', border: '1px solid rgba(255, 255, 255, 0.05)', borderTop: '4px solid #7551e9' }}>
              <CardContent className="p-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Коммуникационные Сервисы</div>
                    <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>Телефония и мессенджеры</div>
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(57, 101, 255, 0.1)', color: '#3965ff', border: '1px solid rgba(57, 101, 255, 0.2)' }}>
                    <Icon name="MessageCircle" size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>45,300 ₽</div>
                <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>24.6% от общего бюджета</div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: '#a3aed0' }}>
                  <Icon name="Minus" size={14} /> Без изменений
                </div>
              </CardContent>
            </Card>

            {/* Всего Платежей */}
            <Card style={{ background: '#111c44', border: '1px solid rgba(255, 255, 255, 0.05)', borderTop: '4px solid #7551e9' }}>
              <CardContent className="p-6">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Всего Платежей</div>
                    <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>История операций</div>
                  </div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 181, 71, 0.1)', color: '#ffb547', border: '1px solid rgba(255, 181, 71, 0.2)' }}>
                    <Icon name="Box" size={20} />
                  </div>
                </div>
                <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>23</div>
                <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>платежей за все время</div>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: '#e31a1a' }}>
                  <Icon name="ArrowUp" size={14} /> +3 за месяц
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '30px' }}>
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
          </div>

          {/* IT Expenses Table */}
          <Card style={{ background: '#111c44', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <CardContent className="p-6">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>IT Сервисы и Расходы</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: 'Все Сервисы' },
                    { key: 'server', label: 'Серверы' },
                    { key: 'communication', label: 'Коммуникации' },
                    { key: 'website', label: 'Веб-сайты' },
                    { key: 'security', label: 'Безопасность' }
                  ].map(filter => (
                    <button
                      key={filter.key}
                      onClick={() => setActiveFilter(filter.key)}
                      style={{
                        background: activeFilter === filter.key ? '#7551e9' : 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${activeFilter === filter.key ? '#7551e9' : 'rgba(255, 255, 255, 0.1)'}`,
                        color: activeFilter === filter.key ? 'white' : '#a3aed0',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        transition: 'all 0.3s'
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#a3aed0', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Сервис</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#a3aed0', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Категория</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#a3aed0', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Описание</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#a3aed0', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Сумма (₽)</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#a3aed0', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Дата</th>
                      <th style={{ padding: '16px', textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#a3aed0', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase' }}>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map(payment => (
                      <tr key={payment.id}>
                        <td style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: '500', color: '#fff' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '8px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              background: payment.category === 'server' ? 'rgba(117, 81, 233, 0.1)' : 
                                         payment.category === 'communication' ? 'rgba(57, 101, 255, 0.1)' :
                                         payment.category === 'website' ? 'rgba(255, 181, 71, 0.1)' : 'rgba(1, 181, 116, 0.1)',
                              color: payment.category === 'server' ? '#7551e9' : 
                                    payment.category === 'communication' ? '#3965ff' :
                                    payment.category === 'website' ? '#ffb547' : '#01b574'
                            }}>
                              <Icon name={getServiceIcon(payment.category)} size={16} />
                            </div>
                            <span style={{ fontWeight: '600' }}>{payment.service}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: '500' }}>
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            display: 'inline-block',
                            background: payment.category === 'server' ? 'rgba(117, 81, 233, 0.1)' : 
                                       payment.category === 'communication' ? 'rgba(57, 101, 255, 0.1)' :
                                       payment.category === 'website' ? 'rgba(255, 181, 71, 0.1)' : 'rgba(1, 181, 116, 0.1)',
                            color: payment.category === 'server' ? '#7551e9' : 
                                  payment.category === 'communication' ? '#3965ff' :
                                  payment.category === 'website' ? '#ffb547' : '#01b574',
                            border: `1px solid ${payment.category === 'server' ? 'rgba(117, 81, 233, 0.2)' : 
                                                 payment.category === 'communication' ? 'rgba(57, 101, 255, 0.2)' :
                                                 payment.category === 'website' ? 'rgba(255, 181, 71, 0.2)' : 'rgba(1, 181, 116, 0.2)'}`
                          }}>
                            {getCategoryName(payment.category)}
                          </span>
                        </td>
                        <td style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: '500', color: '#a3aed0' }}>{payment.description}</td>
                        <td style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: '700', fontSize: '14px', color: '#fff' }}>{formatCurrency(payment.amount)}</td>
                        <td style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: '500', color: '#a3aed0' }}>{payment.date}</td>
                        <td style={{ padding: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#01b574', fontWeight: '500' }}>✓ Оплачен</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard2;