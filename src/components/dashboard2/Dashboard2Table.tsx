import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const Dashboard2Table = () => {
  const [activeFilter, setActiveFilter] = useState('all');

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

  return (
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
  );
};

export default Dashboard2Table;
