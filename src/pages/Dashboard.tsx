import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import PaymentsHeader from '@/components/payments/PaymentsHeader';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import ExpensesByCategoryChart from '@/components/dashboard/ExpensesByCategoryChart';
import ServicesDynamicsChart from '@/components/dashboard/ServicesDynamicsChart';
import ExpensesGrowthChart from '@/components/dashboard/ExpensesGrowthChart';
import ContractorsAndDepartments from '@/components/dashboard/ContractorsAndDepartments';

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
    { name: 'Видеоконференции', amount: 55000, trend: 10 },
    { name: 'Бухгалтерия', amount: 72000, trend: -3 },
    { name: 'Антивирус', amount: 28000, trend: 5 },
    { name: 'VPN-сервисы', amount: 42000, trend: 18 },
    { name: 'Мониторинг', amount: 38000, trend: 7 },
    { name: 'Резервное копирование', amount: 51000, trend: -2 },
    { name: 'Телефония', amount: 67000, trend: 4 },
    { name: 'Системы безопасности', amount: 89000, trend: 11 },
    { name: 'Дизайн-инструменты', amount: 44000, trend: 9 },
    { name: 'Тестирование', amount: 33000, trend: -7 },
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

        <div>
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

          <div className="mb-6">
            <ServicesDynamicsChart servicesData={servicesData} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <ExpensesGrowthChart monthlyData={monthlyData} />
            <ExpensesByCategoryChart 
              categoriesData={categoriesData} 
              totalAmount={totalExpenses.month}
            />
          </div>

          <ContractorsAndDepartments 
            contractorsData={contractorsData}
            departmentsData={departmentsData}
            indexData={indexData}
          />
        </div>
      </main>
    </div>
  );
};

const TotalExpensesCard = ({ amount, period }: { amount: number; period: string }) => (
  <Card className="border-2 border-primary/20 hover:shadow-xl transition-all">
    <CardContent className="pt-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Wallet" className="text-primary" size={28} />
        <h3 className="text-xl font-semibold">Совокупные затраты {period}</h3>
      </div>
      <p className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        {amount.toLocaleString('ru-RU')} ₽
      </p>
    </CardContent>
  </Card>
);

export default Dashboard;