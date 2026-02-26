import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';

interface Payment {
  amount: number;
  payment_date: string;
  category_name?: string;
  service_name?: string;
  status: string;
}

interface StatsData {
  total: number;
  serverTotal: number;
  commTotal: number;
  count: number;
  prevMonthTotal: number;
  prevMonthCount: number;
}

const Dashboard2StatsCards = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await apiFetch(`${API_ENDPOINTS.main}?endpoint=payments`);
        const data = await res.json();
        if (controller.signal.aborted) return;

        const payments: Payment[] = Array.isArray(data) ? data : [];
        const approved = payments.filter(p => p.status === 'approved');

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const prevMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0);

        const thisMonth = approved.filter(p => new Date(p.payment_date) >= thisMonthStart);
        const prevMonth = approved.filter(p => {
          const d = new Date(p.payment_date);
          return d >= prevMonthStart && d <= prevMonthEnd;
        });

        const total = approved.reduce((s, p) => s + (p.amount || 0), 0);
        const serverTotal = approved
          .filter(p => ['Инфраструктура', 'Серверы', 'Хостинг'].includes(p.category_name || ''))
          .reduce((s, p) => s + (p.amount || 0), 0);
        const commTotal = approved
          .filter(p => ['Телефония', 'Мессенджеры', 'Коммуникации'].includes(p.category_name || ''))
          .reduce((s, p) => s + (p.amount || 0), 0);

        const prevMonthTotal = prevMonth.reduce((s, p) => s + (p.amount || 0), 0);

        setStats({
          total,
          serverTotal,
          commTotal,
          count: approved.length,
          prevMonthTotal,
          prevMonthCount: prevMonth.length - thisMonth.length,
        });
      } catch {
        // silent
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  const fmt = (v: number) => new Intl.NumberFormat('ru-RU').format(Math.round(v)) + ' ₽';

  const pctChange = (curr: number, prev: number) => {
    if (prev === 0) return null;
    return Math.round(((curr - prev) / prev) * 100);
  };

  const ChangeTag = ({ value, label }: { value: number | null; label?: string }) => {
    if (value === null) return (
      <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: 'rgba(200, 210, 230, 0.75)' }}>
        <Icon name="Minus" size={14} /> Нет данных
      </div>
    );
    const up = value >= 0;
    return (
      <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: up ? '#e31a1a' : '#01b574' }}>
        <Icon name={up ? 'ArrowUp' : 'ArrowDown'} size={14} />
        {up ? '+' : ''}{value}% {label || 'с прошлого месяца'}
      </div>
    );
  };

  const cardStyle = (accent: string) => ({
    background: 'hsl(var(--card))',
    border: `1px solid ${accent}40`,
    borderTop: `4px solid ${accent}`,
    boxShadow: `0 0 20px ${accent}20`,
  });

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '30px' }}>
        {[0,1,2,3].map(i => (
          <Card key={i} style={cardStyle('#7551e9')}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-8 bg-white/10 rounded w-1/2" />
                <div className="h-3 bg-white/10 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalChange = pctChange(
    stats?.total ?? 0,
    stats?.prevMonthTotal ?? 0,
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '30px' }}>

      {/* Общие IT Расходы */}
      <Card style={cardStyle('#7551e9')}>
        <CardContent className="p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Общие IT Расходы</div>
              <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>Утверждённые платежи</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(117,81,233,0.1)', color: '#7551e9', border: '1px solid rgba(117,81,233,0.2)' }}>
              <Icon name="Server" size={20} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
            {fmt(stats?.total ?? 0)}
          </div>
          <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', marginBottom: '12px' }}>Общая сумма расходов</div>
          <ChangeTag value={totalChange} />
        </CardContent>
      </Card>

      {/* Серверная Инфраструктура */}
      <Card style={cardStyle('#01b574')}>
        <CardContent className="p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Серверная Инфраструктура</div>
              <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>Расходы на серверы</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(1,181,116,0.1)', color: '#01b574', border: '1px solid rgba(1,181,116,0.2)' }}>
              <Icon name="Database" size={20} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
            {fmt(stats?.serverTotal ?? 0)}
          </div>
          <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', marginBottom: '12px' }}>
            {stats && stats.total > 0 ? Math.round((stats.serverTotal / stats.total) * 100) : 0}% от общего бюджета
          </div>
          <ChangeTag value={null} label="данные по категории" />
        </CardContent>
      </Card>

      {/* Коммуникационные Сервисы */}
      <Card style={cardStyle('#3965ff')}>
        <CardContent className="p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Коммуникационные Сервисы</div>
              <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>Телефония и мессенджеры</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(57,101,255,0.1)', color: '#3965ff', border: '1px solid rgba(57,101,255,0.2)' }}>
              <Icon name="MessageCircle" size={20} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
            {fmt(stats?.commTotal ?? 0)}
          </div>
          <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', marginBottom: '12px' }}>
            {stats && stats.total > 0 ? Math.round((stats.commTotal / stats.total) * 100) : 0}% от общего бюджета
          </div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: 'hsl(var(--muted-foreground))' }}>
            <Icon name="Minus" size={14} /> Без изменений
          </div>
        </CardContent>
      </Card>

      {/* Всего Платежей */}
      <Card style={cardStyle('#ffb547')}>
        <CardContent className="p-6">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Всего Платежей</div>
              <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>История операций</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,181,71,0.1)', color: '#ffb547', border: '1px solid rgba(255,181,71,0.2)' }}>
              <Icon name="Box" size={20} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>
            {stats?.count ?? 0}
          </div>
          <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', marginBottom: '12px' }}>платежей за всё время</div>
          <ChangeTag
            value={stats?.prevMonthCount !== undefined && stats.prevMonthCount !== 0 ? stats.prevMonthCount : null}
            label="за последний месяц"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard2StatsCards;