import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface Category {
  id: number;
  name: string;
  icon: string;
  total: number;
}

interface Stats {
  total: number;
  payment_count: number;
  categories: Category[];
}

const Index = () => {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const doughnutChartRef = useRef<HTMLCanvasElement>(null);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    payment_count: 0,
    categories: []
  });
  const [loading, setLoading] = useState(true);
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

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

  useEffect(() => {
    fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load stats:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!barChartRef.current || !doughnutChartRef.current || loading || stats.categories.length === 0) return;

    const barCtx = barChartRef.current.getContext('2d');
    const doughnutCtx = doughnutChartRef.current.getContext('2d');

    if (!barCtx || !doughnutCtx) return;

    const categoryData = stats.categories.map(c => c.total);
    const categoryLabels = stats.categories.map(c => c.name);

    const barChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: categoryLabels,
        datasets: [{
          label: 'Расходы',
          data: categoryData,
          backgroundColor: [
            'rgba(117, 81, 233, 0.8)',
            'rgba(57, 101, 255, 0.8)',
            'rgba(255, 181, 71, 0.8)',
            'rgba(1, 181, 116, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#fff'
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#a3aed0' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          y: {
            ticks: { color: '#a3aed0' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    });

    const doughnutChart = new Chart(doughnutCtx, {
      type: 'doughnut',
      data: {
        labels: categoryLabels,
        datasets: [{
          data: categoryData,
          backgroundColor: [
            'rgba(117, 81, 233, 0.8)',
            'rgba(57, 101, 255, 0.8)',
            'rgba(255, 181, 71, 0.8)',
            'rgba(1, 181, 116, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#fff'
            }
          }
        }
      }
    });

    return () => {
      barChart.destroy();
      doughnutChart.destroy();
    };
  }, [stats, loading]);

  return (
    <div className="flex min-h-screen">
      <aside 
        className={`w-[250px] bg-[#1b254b] border-r border-white/10 fixed left-0 top-0 h-screen z-50 transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <a href="#" className="flex items-center gap-3 px-5 py-5 pb-[30px] border-b border-white/10">
          <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center font-bold text-white">
            V
          </div>
          <span className="text-white font-semibold">Vision UI</span>
        </a>
        <ul className="px-[15px] py-5 space-y-1">
          <li>
            <Link to="/" className="flex items-center gap-3 px-[15px] py-3 rounded-lg bg-primary text-white">
              <Icon name="Home" size={20} />
              <span>Дашборд</span>
            </Link>
          </li>
          <li>
            <Link to="/payments" className="flex items-center gap-3 px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              <Icon name="CreditCard" size={20} />
              <span>Платежи</span>
            </Link>
          </li>
          <li>
            <button 
              onClick={() => setDictionariesOpen(!dictionariesOpen)}
              className="w-full flex items-center justify-between px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon name="BookOpen" size={20} />
                <span>Справочники</span>
              </div>
              <Icon 
                name="ChevronDown" 
                size={16} 
                className={`transition-transform ${dictionariesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {dictionariesOpen && (
              <div className="mt-1 space-y-1">
                <Link 
                  to="/legal-entities" 
                  className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon name="Building2" size={18} />
                  <span>Юридические лица</span>
                </Link>
                <Link 
                  to="/categories" 
                  className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon name="Tag" size={18} />
                  <span>Категории платежей</span>
                </Link>
                <Link 
                  to="/custom-fields" 
                  className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon name="Settings" size={18} />
                  <span>Дополнительные поля</span>
                </Link>
              </div>
            )}
          </li>
          <li>
            <a href="#" className="flex items-center gap-3 px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              <Icon name="Box" size={20} />
              <span>Сервисы</span>
            </a>
          </li>
        </ul>
      </aside>

      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="lg:ml-[250px] p-4 md:p-6 lg:p-[30px] min-h-screen flex-1">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-[30px] px-4 md:px-[25px] py-4 md:py-[18px] bg-[#1b254b]/50 backdrop-blur-[20px] rounded-[15px] border border-white/10">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 text-white"
          >
            <Icon name="Menu" size={24} />
          </button>
          <div className="flex items-center gap-3 bg-card border border-white/10 rounded-[15px] px-4 md:px-5 py-2 md:py-[10px] w-full sm:w-[300px] lg:w-[400px]">
            <Icon name="Search" size={20} className="text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Поиск сервисов..." 
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
            />
          </div>
          <div className="flex items-center gap-2 md:gap-3 px-3 md:px-[15px] py-2 md:py-[10px] rounded-[12px] bg-white/5 border border-white/10">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-[10px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-sm md:text-base">
              А
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium">Администратор</div>
              <div className="text-xs text-muted-foreground">Администратор</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-6 md:mb-[30px]">
          <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-base font-bold mb-[5px]">Общие IT Расходы</h3>
                  <p className="text-sm text-muted-foreground">Все время</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-xl">
                  <Icon name="Server" size={20} />
                </div>
              </div>
              <div className="text-[32px] font-extrabold mb-2">{stats.total.toLocaleString('ru-RU')} ₽</div>
              <p className="text-sm text-muted-foreground">{stats.payment_count > 0 ? `${stats.payment_count} платежей` : 'Начните добавлять платежи'}</p>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)] rounded-[20px]">
            <CardContent className="p-[25px]">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-base font-bold mb-[5px]">Всего Платежей</h3>
                  <p className="text-sm text-muted-foreground">История операций</p>
                </div>
                <div className="w-[45px] h-[45px] rounded-[12px] bg-primary/10 flex items-center justify-center text-primary text-xl">
                  <Icon name="Box" size={20} />
                </div>
              </div>
              <div className="text-[34px] font-extrabold mb-[5px] leading-[42px]">{stats.payment_count}</div>
              <p className="text-sm text-muted-foreground">платежей за все время</p>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)] rounded-[20px]">
            <CardContent className="p-[25px]">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h3 className="text-base font-bold mb-[5px]">Категории</h3>
                  <p className="text-sm text-muted-foreground">Всего</p>
                </div>
                <div className="w-[45px] h-[45px] rounded-[12px] bg-primary/10 flex items-center justify-center text-primary text-xl">
                  <Icon name="Tag" size={20} />
                </div>
              </div>
              <div className="text-[34px] font-extrabold mb-[5px] leading-[42px]">{stats.categories.length}</div>
              <p className="text-sm text-muted-foreground">категорий расходов</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6 md:mb-[30px]">
          {stats.categories.map((category) => (
            <Card key={category.id} className="border-white/5 bg-card rounded-[20px]">
              <CardContent className="p-[20px] flex items-center gap-[15px]">
                <div className="w-[56px] h-[56px] rounded-[15px] bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {category.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold mb-[2px] leading-[32px]">{category.total.toLocaleString('ru-RU')} ₽</div>
                  <p className="text-sm text-muted-foreground">{category.name}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)] rounded-[20px]">
            <CardContent className="p-[25px]">
              <h3 className="text-lg font-bold mb-5">Расходы по категориям</h3>
              <div className="h-[300px]">
                <canvas ref={barChartRef}></canvas>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)] rounded-[20px]">
            <CardContent className="p-[25px]">
              <h3 className="text-lg font-bold mb-5">Распределение бюджета</h3>
              <div className="h-[300px]">
                <canvas ref={doughnutChartRef}></canvas>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;