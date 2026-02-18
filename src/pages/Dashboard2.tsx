import { useState } from 'react';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import Dashboard2AllCards from '@/components/dashboard2/Dashboard2AllCards';
import Dashboard2Charts from '@/components/dashboard2/Dashboard2Charts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PeriodProvider, PeriodType } from '@/contexts/PeriodContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  RadarController,
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
  RadarController,
  RadialLinearScale
);

const Dashboard2 = () => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');

  const {
    menuOpen,
    setMenuOpen,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSidebarTouch();

  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #0f1535 0%, #1b254b 100%)' }}>
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

      <main className="lg:ml-[250px] p-4 md:p-6 lg:p-[30px] min-h-screen flex-1 overflow-x-hidden max-w-full">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 text-white hover:bg-white/5 rounded-lg transition-colors mb-4"
        >
          <Icon name="Menu" size={24} />
        </button>

        <div style={{ padding: '20px 0' }}>
          <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as PeriodType)} className="mb-6">
            <TabsList className="grid w-full grid-cols-5 max-w-2xl text-xs sm:text-sm">
              <TabsTrigger value="today" className="px-2 sm:px-4">Сегодня</TabsTrigger>
              <TabsTrigger value="week" className="px-2 sm:px-4">Неделя</TabsTrigger>
              <TabsTrigger value="month" className="px-2 sm:px-4">Месяц</TabsTrigger>
              <TabsTrigger value="year" className="px-2 sm:px-4">Год</TabsTrigger>
              <TabsTrigger value="custom" className="px-2 sm:px-4">Период</TabsTrigger>
            </TabsList>

            {selectedPeriod === 'custom' && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal w-full sm:w-auto text-sm">
                      <Icon name="Calendar" className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'PPP', { locale: ru }) : 'Дата от'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal w-full sm:w-auto text-sm">
                      <Icon name="Calendar" className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'PPP', { locale: ru }) : 'Дата до'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </Tabs>

          <PeriodProvider period={selectedPeriod} dateFrom={dateFrom} dateTo={dateTo}>
            <div className="space-y-6 mt-6">
              <Dashboard2AllCards />
              <Dashboard2Charts />
            </div>
          </PeriodProvider>
        </div>
      </main>
    </div>
  );
};

export default Dashboard2;
