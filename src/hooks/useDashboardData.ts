import { useState, useEffect } from 'react';
import { DashboardData, DashboardDataState } from '@/types/dashboard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const generateMockActivity = () => {
  const data = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.floor(Math.random() * 50) + 10,
    });
  }
  return data;
};

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData>({
    state: 'loading' as DashboardDataState,
    kpis: [],
    systemStatus: { status: 'healthy', message: '', alerts: [] },
    activity: [],
    recentEvents: [],
    quickActions: [],
  });
  
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockData: DashboardData = {
          state: 'ready',
          kpis: [
            {
              id: 'sources',
              title: 'Активные источники',
              value: 12,
              trend: { value: 15, direction: 'up' },
              icon: 'Database',
            },
            {
              id: 'operations',
              title: 'Операций за период',
              value: 1247,
              trend: { value: 8, direction: 'up' },
              icon: 'Activity',
            },
            {
              id: 'invoices',
              title: 'Счетов за период',
              value: 89,
              trend: { value: 3, direction: 'down' },
              icon: 'FileText',
            },
            {
              id: 'errors',
              title: 'Ошибки / Предупр.',
              value: '2 / 5',
              trend: { value: 0, direction: 'neutral' },
              icon: 'AlertTriangle',
            },
          ],
          systemStatus: {
            status: 'warning',
            message: 'Система работает в штатном режиме',
            alerts: [
              {
                id: '1',
                type: 'warning',
                title: 'Требуется обновление данных источника "1C"',
                description: 'Последнее обновление было более 6 часов назад',
                timestamp: new Date(Date.now() - 3600000),
                action: {
                  label: 'Обновить сейчас',
                  onClick: () => console.log('Updating source'),
                },
              },
              {
                id: '2',
                type: 'info',
                title: '5 счетов ожидают согласования',
                description: 'Проверьте раздел "Ожидают согласования"',
                timestamp: new Date(Date.now() - 7200000),
                action: {
                  label: 'Перейти',
                  onClick: () => navigate('/pending-approvals'),
                },
              },
            ],
          },
          activity: generateMockActivity(),
          recentEvents: [
            {
              id: '1',
              type: 'payment',
              title: 'Создан новый счёт #12345',
              description: '250 000 ₽ для ООО "Ромашка"',
              timestamp: new Date(Date.now() - 600000),
              detailsLink: '/payments',
            },
            {
              id: '2',
              type: 'approval',
              title: 'Счёт #12344 согласован',
              description: 'Утверждён Ивановым А.П.',
              timestamp: new Date(Date.now() - 1800000),
              detailsLink: '/approved-payments',
            },
            {
              id: '3',
              type: 'user',
              title: 'Новый пользователь добавлен',
              description: 'Петров П.П. (Бухгалтер)',
              timestamp: new Date(Date.now() - 3600000),
              detailsLink: '/users',
            },
            {
              id: '4',
              type: 'system',
              title: 'Обновлены настройки интеграции',
              description: 'Источник "1C" переконфигурирован',
              timestamp: new Date(Date.now() - 7200000),
            },
          ],
          quickActions: [
            {
              id: 'create-payment',
              label: 'Создать счёт',
              icon: 'Plus',
              onClick: () => navigate('/payments'),
              disabled: !hasPermission('payments', 'create'),
              disabledReason: !hasPermission('payments', 'create') ? 'Нет прав доступа' : undefined,
            },
            {
              id: 'add-source',
              label: 'Добавить источник',
              icon: 'Database',
              onClick: () => console.log('Add source'),
              disabled: !hasPermission('categories', 'create'),
              disabledReason: !hasPermission('categories', 'create') ? 'Нет прав доступа' : undefined,
            },
            {
              id: 'monitoring',
              label: 'Мониторинг',
              icon: 'BarChart3',
              onClick: () => navigate('/monitoring'),
            },
            {
              id: 'settings',
              label: 'Настройки',
              icon: 'Settings',
              onClick: () => navigate('/settings'),
            },
          ],
          lastUpdate: new Date(),
        };

        setData(mockData);
      } catch (error) {
        setData({
          state: 'error',
          kpis: [],
          systemStatus: { status: 'critical', message: '', alerts: [] },
          activity: [],
          recentEvents: [],
          quickActions: [],
          errorMessage: 'Не удалось загрузить данные дашборда',
        });
      }
    };

    loadData();
  }, [hasPermission, navigate]);

  const retry = () => {
    setData(prev => ({ ...prev, state: 'loading' }));
    window.location.reload();
  };

  return { data, retry };
};
