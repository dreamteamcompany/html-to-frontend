import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import PaymentsHeader from '@/components/payments/PaymentsHeader';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const Dashboard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'custom'>('month');

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

  const totalExpenses = {
    today: 45300,
    week: 328400,
    month: 1450000,
    year: 16800000,
  };

  const categoriesData = [
    { name: 'Зарплата', amount: 850000, icon: '💰', percentage: 58.6 },
    { name: 'Аренда', amount: 250000, icon: '🏢', percentage: 17.2 },
    { name: 'Маркетинг', amount: 180000, icon: '📈', percentage: 12.4 },
    { name: 'Оборудование', amount: 120000, icon: '💻', percentage: 8.3 },
    { name: 'Прочее', amount: 50000, icon: '📦', percentage: 3.5 },
  ];

  const servicesData = [
    { name: 'Облачные сервисы', amount: 150000, trend: 12 },
    { name: 'CRM-система', amount: 85000, trend: -5 },
    { name: 'Аналитика', amount: 65000, trend: 8 },
    { name: 'Хостинг', amount: 45000, trend: 0 },
    { name: 'Email-рассылки', amount: 35000, trend: 15 },
  ];

  const monthlyData = [
    { month: 'Янв', amount: 1200000 },
    { month: 'Фев', amount: 1350000 },
    { month: 'Мар', amount: 1280000 },
    { month: 'Апр', amount: 1420000 },
    { month: 'Май', amount: 1380000 },
    { month: 'Июн', amount: 1450000 },
  ];

  const contractorsData = [
    { name: 'ООО "Техсервис"', amount: 420000, invoices: 12 },
    { name: 'ИП Иванов А.А.', amount: 280000, invoices: 8 },
    { name: 'ООО "Софтпро"', amount: 350000, invoices: 15 },
    { name: 'ЗАО "Строймонтаж"', amount: 190000, invoices: 5 },
  ];

  const departmentsData = [
    { name: 'IT-отдел', amount: 580000, percentage: 40 },
    { name: 'Отдел маркетинга', amount: 320000, percentage: 22 },
    { name: 'Отдел продаж', amount: 280000, percentage: 19 },
    { name: 'Административный', amount: 270000, percentage: 19 },
  ];

  const indexData = {
    currentMonth: 1450000,
    previousMonth: 1380000,
    growth: 5.1,
    averageCheck: 12083,
    transactionsCount: 120,
  };

  const maxMonthly = Math.max(...monthlyData.map(d => d.amount));

  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
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

        <div className="max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Дашборд
            </h1>
            <p className="text-muted-foreground">Аналитика и статистика расходов</p>
          </div>

          <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as typeof selectedPeriod)} className="mb-6">
            <TabsList className="grid w-full grid-cols-5 max-w-2xl">
              <TabsTrigger value="today">Сегодня</TabsTrigger>
              <TabsTrigger value="week">Неделя</TabsTrigger>
              <TabsTrigger value="month">Месяц</TabsTrigger>
              <TabsTrigger value="year">Год</TabsTrigger>
              <TabsTrigger value="custom">Период</TabsTrigger>
            </TabsList>

            {selectedPeriod === 'custom' && (
              <div className="flex gap-4 mt-4 flex-wrap">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <Icon name="Calendar" className="mr-2" />
                      {dateFrom ? format(dateFrom, 'PPP', { locale: ru }) : 'Дата от'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <Icon name="Calendar" className="mr-2" />
                      {dateTo ? format(dateTo, 'PPP', { locale: ru }) : 'Дата до'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <TabsContent value="today" className="space-y-6 mt-6">
              <TotalExpensesCard amount={totalExpenses.today} period="за сегодня" />
            </TabsContent>
            <TabsContent value="week" className="space-y-6 mt-6">
              <TotalExpensesCard amount={totalExpenses.week} period="за неделю" />
            </TabsContent>
            <TabsContent value="month" className="space-y-6 mt-6">
              <TotalExpensesCard amount={totalExpenses.month} period="за месяц" />
            </TabsContent>
            <TabsContent value="year" className="space-y-6 mt-6">
              <TotalExpensesCard amount={totalExpenses.year} period="за год" />
            </TabsContent>
            <TabsContent value="custom" className="space-y-6 mt-6">
              {dateFrom && dateTo ? (
                <TotalExpensesCard amount={850000} period={`с ${format(dateFrom, 'dd.MM.yyyy')} по ${format(dateTo, 'dd.MM.yyyy')}`} />
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center text-muted-foreground">
                    Выберите диапазон дат для отображения статистики
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="PieChart" className="text-blue-600" />
                  Расходы по категориям
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-8">
                  <div className="relative w-64 h-64">
                    <svg viewBox="0 0 200 200" className="transform -rotate-90">
                      {categoriesData.reduce((acc, cat, index) => {
                        const colors = [
                          '#7f00ff',
                          '#0400ff',
                          '#fa0',
                          '#00ff09',
                          '#d0f',
                          '#f00',
                        ];
                        const total = categoriesData.reduce((sum, c) => sum + c.percentage, 0);
                        const percentage = (cat.percentage / total) * 100;
                        const circumference = 2 * Math.PI * 80;
                        const offset = acc.offset;
                        const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                        
                        acc.elements.push(
                          <circle
                            key={cat.name}
                            cx="100"
                            cy="100"
                            r="80"
                            fill="none"
                            stroke={colors[index % colors.length]}
                            strokeWidth="40"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={-offset}
                            style={{ transition: 'all 0.3s ease' }}
                          />
                        );
                        
                        acc.offset += (percentage / 100) * circumference;
                        return acc;
                      }, { elements: [] as JSX.Element[], offset: 0 }).elements}
                      <circle cx="100" cy="100" r="60" fill="hsl(var(--card))" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <p className="text-3xl font-bold">{totalExpenses.month.toLocaleString('ru-RU', { notation: 'compact' })}</p>
                      <p className="text-sm text-muted-foreground">Всего</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {categoriesData.map((cat, index) => {
                      const colors = [
                        '#7f00ff',
                        '#0400ff',
                        '#fa0',
                        '#00ff09',
                        '#d0f',
                        '#f00',
                      ];
                      return (
                        <div key={cat.name} className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{cat.icon}</span>
                              <span className="font-medium">{cat.name}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {cat.amount.toLocaleString('ru-RU')} ₽ ({cat.percentage}%)
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden" style={{
              background: 'linear-gradient(127.09deg, rgba(6, 11, 40, 0.94) 19.41%, rgba(10, 14, 35, 0.49) 76.65%)',
              backdropFilter: 'blur(60px)',
              border: '2px solid rgba(86, 87, 122, 0.6)',
              boxShadow: '0px 3.5px 5.5px rgba(0, 0, 0, 0.02)',
            }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                  <Icon name="Activity" style={{ color: '#2CD9FF' }} />
                  Динамика расходов по сервисам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-80">
                  <svg viewBox="0 0 500 300" className="w-full h-full">
                    {(() => {
                      const maxAmount = Math.max(...servicesData.map(s => s.amount));
                      const barWidth = 50;
                      const spacing = 100;
                      const maxHeight = 180;
                      const startY = 230;
                      
                      const gridLines = [0, 0.25, 0.5, 0.75, 1].map(ratio => ({
                        y: startY - ratio * maxHeight,
                        value: (ratio * maxAmount / 1000).toFixed(0)
                      }));
                      
                      const points = servicesData.map((service, index) => {
                        const x = 50 + index * spacing;
                        const barHeight = (service.amount / maxAmount) * maxHeight;
                        const y = startY - barHeight;
                        return { x: x + barWidth / 2, y };
                      });
                      
                      const linePath = points.map((p, i) => 
                        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                      ).join(' ');
                      
                      return (
                        <>
                          {gridLines.map((line, idx) => (
                            <g key={idx}>
                              <line
                                x1="40"
                                y1={line.y}
                                x2="490"
                                y2={line.y}
                                stroke="#56577A"
                                strokeWidth="1"
                                strokeDasharray="5 5"
                              />
                              <text
                                x="25"
                                y={line.y + 4}
                                textAnchor="end"
                                fill="#c8cfca"
                                style={{ fontSize: '11px', fontWeight: '500' }}
                              >
                                {line.value}k
                              </text>
                            </g>
                          ))}
                          
                          {servicesData.map((service, index) => {
                            const x = 50 + index * spacing;
                            const barHeight = (service.amount / maxAmount) * maxHeight;
                            
                            return (
                              <g key={service.name}>
                                <defs>
                                  <linearGradient id={`visionBar-${index}`} x1="0%" y1="100%" x2="0%" y2="0%">
                                    <stop offset="0%" stopColor="#0075FF" stopOpacity="0.0" />
                                    <stop offset="100%" stopColor="#0075FF" stopOpacity="1" />
                                  </linearGradient>
                                </defs>
                                <rect
                                  x={x}
                                  y={startY - barHeight}
                                  width={barWidth}
                                  height={barHeight}
                                  fill={`url(#visionBar-${index})`}
                                  rx="8"
                                />
                                <text
                                  x={x + barWidth / 2}
                                  y={startY - barHeight - 8}
                                  textAnchor="middle"
                                  fill="#fff"
                                  style={{ fontSize: '12px', fontWeight: '600' }}
                                >
                                  {(service.amount / 1000).toFixed(0)}k
                                </text>
                                <text
                                  x={x + barWidth / 2}
                                  y={250}
                                  textAnchor="middle"
                                  fill="#c8cfca"
                                  style={{ fontSize: '11px' }}
                                >
                                  {service.name.length > 10 ? service.name.slice(0, 10) + '...' : service.name}
                                </text>
                                {service.trend !== 0 && (
                                  <g>
                                    <rect
                                      x={x + barWidth / 2 - 14}
                                      y={startY - barHeight - 28}
                                      width="28"
                                      height="16"
                                      rx="4"
                                      fill={service.trend > 0 ? '#01B574' : '#E31A1A'}
                                      opacity="0.9"
                                    />
                                    <text
                                      x={x + barWidth / 2}
                                      y={startY - barHeight - 17}
                                      textAnchor="middle"
                                      fill="#fff"
                                      style={{ fontSize: '10px', fontWeight: 'bold' }}
                                    >
                                      {service.trend > 0 ? '+' : ''}{service.trend}%
                                    </text>
                                  </g>
                                )}
                              </g>
                            );
                          })}
                          <defs>
                            <linearGradient id="visionLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#2CD9FF" />
                              <stop offset="100%" stopColor="#0075FF" />
                            </linearGradient>
                          </defs>
                          <path
                            d={linePath}
                            stroke="url(#visionLineGradient)"
                            strokeWidth="3"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {points.map((point, index) => (
                            <g key={index}>
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="6"
                                fill="#2CD9FF"
                                opacity="0.3"
                              />
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="4"
                                fill="#fff"
                              />
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="BarChart3" className="text-blue-600" />
                Динамика расходов по месяцам
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-4">
                {monthlyData.map((data) => (
                  <div key={data.month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg transition-all hover:opacity-80 cursor-pointer"
                        style={{ height: `${(data.amount / maxMonthly) * 200}px` }}
                      />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold whitespace-nowrap">
                        {(data.amount / 1000000).toFixed(1)}М
                      </div>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Users" className="text-green-600" />
                  Сравнение расходов по контрагентам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contractorsData.map((contractor, index) => (
                    <div key={contractor.name} className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{contractor.name}</p>
                        <p className="text-xs text-muted-foreground">{contractor.invoices} счетов</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{contractor.amount.toLocaleString('ru-RU')} ₽</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Building2" className="text-orange-600" />
                  Расходы по отделам-заказчикам
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentsData.map((dept) => (
                    <div key={dept.name}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{dept.name}</span>
                        <span className="text-sm font-semibold">{dept.amount.toLocaleString('ru-RU')} ₽</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                          style={{ width: `${dept.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="TrendingUp" className="text-purple-600" />
                Индексация расходов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                  <p className="text-sm text-muted-foreground mb-1">Текущий месяц</p>
                  <p className="text-2xl font-bold text-blue-700">{indexData.currentMonth.toLocaleString('ru-RU')} ₽</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                  <p className="text-sm text-muted-foreground mb-1">Предыдущий месяц</p>
                  <p className="text-2xl font-bold text-purple-700">{indexData.previousMonth.toLocaleString('ru-RU')} ₽</p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                  <p className="text-sm text-muted-foreground mb-1">Рост</p>
                  <p className="text-2xl font-bold text-green-700 flex items-center gap-1">
                    <Icon name="ArrowUp" size={24} />
                    {indexData.growth}%
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                  <p className="text-sm text-muted-foreground mb-1">Средний чек</p>
                  <p className="text-2xl font-bold text-orange-700">{indexData.averageCheck.toLocaleString('ru-RU')} ₽</p>
                  <p className="text-xs text-muted-foreground mt-1">{indexData.transactionsCount} операций</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

const TotalExpensesCard = ({ amount, period }: { amount: number; period: string }) => (
  <Card className="border-2 border-primary/20 hover:shadow-xl transition-all">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Icon name="Wallet" className="text-primary" size={28} />
        Совокупные затраты {period}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {amount.toLocaleString('ru-RU')} ₽
      </p>
    </CardContent>
  </Card>
);

export default Dashboard;