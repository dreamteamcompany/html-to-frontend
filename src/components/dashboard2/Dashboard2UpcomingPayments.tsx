import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useEffect, useState } from 'react';
import { dashboardTypography, dashboardColors } from './dashboardStyles';
import { apiFetch } from '@/utils/api';
import { API_ENDPOINTS } from '@/config/api';
import { Payment } from '@/types/payment';

interface DayGroup {
  dateKey: string;
  label: string;
  sublabel: string;
  payments: Payment[];
  total: number;
  isToday: boolean;
  isTomorrow: boolean;
  isUrgent: boolean;
}

const Dashboard2UpcomingPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const [paymentsRes, plannedRes] = await Promise.all([
          apiFetch(`${API_ENDPOINTS.main}?endpoint=payments`),
          apiFetch(`${API_ENDPOINTS.main}?endpoint=planned-payments`),
        ]);
        const paymentsData = await paymentsRes.json();
        const plannedData = await plannedRes.json();

        const now = new Date();
        const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const isUpcoming = (date: string | undefined) => {
          if (!date) return false;
          const d = new Date(date);
          return d >= now && d <= sevenDaysFromNow;
        };

        const fromPayments = (Array.isArray(paymentsData) ? paymentsData : [])
          .filter((p: Payment) => {
            if (p.status === 'paid' || p.status === 'cancelled') return false;
            return isUpcoming(p.payment_date) || isUpcoming(p.planned_date);
          })
          .map((p: Payment) => ({
            ...p,
            planned_date: p.planned_date || p.payment_date,
          }));

        const fromPlanned = (Array.isArray(plannedData) ? plannedData : [])
          .filter((p: Payment) => {
            if (p.is_active === false) return false;
            return isUpcoming(p.planned_date);
          });

        const combined = [...fromPayments, ...fromPlanned].sort((a: Payment, b: Payment) => {
          return new Date(a.planned_date!).getTime() - new Date(b.planned_date!).getTime();
        });

        setPayments(combined);
      } catch (error) {
        console.error('Failed to fetch upcoming payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getCategoryIcon = (categoryName: string = ''): string => {
    const n = categoryName.toLowerCase();
    if (n.includes('сервер') || n.includes('хостинг')) return 'Server';
    if (n.includes('облак') || n.includes('saas')) return 'Cloud';
    if (n.includes('софт') || n.includes('програм')) return 'Code';
    if (n.includes('дизайн') || n.includes('figma')) return 'Palette';
    if (n.includes('безопасн')) return 'Shield';
    if (n.includes('база') || n.includes('данн')) return 'Database';
    return 'DollarSign';
  };

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat('ru-RU').format(amount) + ' ₽';

  const groupByDay = (payments: Payment[]): DayGroup[] => {
    const map = new Map<string, Payment[]>();
    for (const p of payments) {
      const dateKey = p.planned_date!.slice(0, 10);
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(p);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const groups: DayGroup[] = [];
    for (const [dateKey, items] of map.entries()) {
      const date = new Date(dateKey);
      date.setHours(0, 0, 0, 0);
      const isToday = date.getTime() === today.getTime();
      const isTomorrow = date.getTime() === tomorrow.getTime();

      const weekdays = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
      const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

      let label = '';
      let sublabel = '';
      if (isToday) {
        label = 'Сегодня';
        sublabel = `${date.getDate()} ${months[date.getMonth()]}`;
      } else if (isTomorrow) {
        label = 'Завтра';
        sublabel = `${date.getDate()} ${months[date.getMonth()]}`;
      } else {
        label = `${date.getDate()} ${months[date.getMonth()]}`;
        sublabel = weekdays[date.getDay()];
      }

      const total = items.reduce((sum, p) => sum + (p.amount || 0), 0);
      const diffDays = (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

      groups.push({
        dateKey,
        label,
        sublabel,
        payments: items,
        total,
        isToday,
        isTomorrow,
        isUrgent: diffDays <= 1,
      });
    }

    return groups.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
  };

  const weekTotal = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const groups = groupByDay(payments);

  return (
    <Card style={{
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '30px',
    }}>
      <CardContent className="p-4 sm:p-6">
        {/* Заголовок */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between sm:mb-8">
          <div className="flex items-center gap-3">
            <div style={{
              background: 'linear-gradient(135deg, #ffb547 0%, #ff9500 100%)',
              padding: '10px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(255,181,71,0.3)',
              flexShrink: 0,
            }}>
              <Icon name="CalendarClock" size={20} style={{ color: '#fff' }} />
            </div>
            <div>
              <h3 className={dashboardTypography.cardTitle} style={{ color: 'hsl(var(--foreground))' }}>
                Предстоящие платежи
              </h3>
              <p className={`${dashboardTypography.cardSmall} mt-0.5`} style={{ color: 'hsl(var(--muted-foreground))' }}>
                Ближайшие 7 дней
              </p>
            </div>
          </div>

          {!loading && payments.length > 0 && (
            <div style={{
              background: 'rgba(255,181,71,0.12)',
              border: '1px solid rgba(255,181,71,0.3)',
              borderRadius: '10px',
              padding: '10px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: '2px',
              minWidth: '160px',
            }}>
              <span style={{ fontSize: '11px', color: dashboardColors.orange, fontWeight: 600 }}>
                Итого за 7 дней
              </span>
              <span style={{ fontSize: '18px', fontWeight: 800, color: 'hsl(var(--foreground))' }}>
                {formatAmount(weekTotal)}
              </span>
              <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
                {payments.length} {payments.length === 1 ? 'платёж' : payments.length < 5 ? 'платежа' : 'платежей'}
              </span>
            </div>
          )}
        </div>

        {/* Состояния */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="CheckCircle" size={44} style={{ color: dashboardColors.green, margin: '0 auto 14px' }} />
            <p className={dashboardTypography.cardSmall} style={{ color: 'hsl(var(--muted-foreground))' }}>
              Нет предстоящих платежей на ближайшие 7 дней
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {groups.map((group, gi) => {
              const accentColor = group.isUrgent ? dashboardColors.red : group.isTomorrow ? dashboardColors.orange : dashboardColors.green;

              return (
                <div key={group.dateKey}>
                  {/* Заголовок дня */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {/* Цветная метка */}
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: `${accentColor}18`,
                        border: `1.5px solid ${accentColor}50`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: accentColor, lineHeight: 1 }}>
                          {group.isToday || group.isTomorrow ? group.label.slice(0, 3) : group.label.split(' ')[0]}
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 600, color: accentColor, opacity: 0.8 }}>
                          {group.isToday || group.isTomorrow ? group.sublabel : group.sublabel}
                        </span>
                      </div>

                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>
                          {group.label}
                          {(group.isToday || group.isTomorrow) && (
                            <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 500, marginLeft: '6px' }}>
                              {group.sublabel}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '1px' }}>
                          {group.payments.length} {group.payments.length === 1 ? 'платёж' : group.payments.length < 5 ? 'платежа' : 'платежей'}
                        </div>
                      </div>
                    </div>

                    {/* Итог дня */}
                    <div style={{
                      background: `${accentColor}12`,
                      border: `1px solid ${accentColor}30`,
                      borderRadius: '8px',
                      padding: '6px 12px',
                      textAlign: 'right',
                    }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'hsl(var(--foreground))' }}>
                        {formatAmount(group.total)}
                      </div>
                      <div style={{ fontSize: '10px', color: accentColor, fontWeight: 600 }}>итого за день</div>
                    </div>
                  </div>

                  {/* Линия-соединитель */}
                  <div style={{
                    marginLeft: '19px',
                    borderLeft: `2px dashed ${accentColor}30`,
                    paddingLeft: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}>
                    {group.payments.map((payment) => {
                      const icon = getCategoryIcon(payment.category_name);
                      return (
                        <div key={payment.id} style={{
                          background: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '10px',
                          padding: '12px 14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          transition: 'border-color 0.2s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = accentColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'hsl(var(--border))';
                        }}>
                          {/* Иконка */}
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '9px',
                            background: `${accentColor}18`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <Icon name={icon} size={16} style={{ color: accentColor }} />
                          </div>

                          {/* Название и категория */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: '13px',
                              fontWeight: 700,
                              color: 'hsl(var(--foreground))',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}>
                              {payment.description || payment.contractor_name || payment.service_name || 'Платёж без описания'}
                            </div>
                            <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
                              {payment.category_name}
                              {payment.contractor_name && payment.description && (
                                <span> · {payment.contractor_name}</span>
                              )}
                            </div>
                          </div>

                          {/* Сумма */}
                          <div style={{
                            fontSize: '15px',
                            fontWeight: 800,
                            color: 'hsl(var(--foreground))',
                            flexShrink: 0,
                          }}>
                            {formatAmount(payment.amount)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Разделитель между днями (кроме последнего) */}
                  {gi < groups.length - 1 && (
                    <div style={{
                      height: '1px',
                      background: 'hsl(var(--border))',
                      marginTop: '20px',
                      opacity: 0.5,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard2UpcomingPayments;
