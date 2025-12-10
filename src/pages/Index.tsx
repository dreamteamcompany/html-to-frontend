import { useEffect, useRef, useState } from 'react';
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
      <aside className="w-[250px] bg-[#1b254b] border-r border-white/10 fixed left-0 top-0 h-screen">
        <a href="#" className="flex items-center gap-3 px-5 py-5 pb-[30px] border-b border-white/10">
          <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center font-bold text-white">
            V
          </div>
          <span className="text-white font-semibold">Vision UI</span>
        </a>
        <ul className="px-[15px] py-5 space-y-1">
          <li>
            <a href="/" className="flex items-center gap-3 px-[15px] py-3 rounded-lg bg-primary text-white">
              <Icon name="Home" size={20} />
              <span>Дашборд</span>
            </a>
          </li>
          <li>
            <a href="/payments" className="flex items-center gap-3 px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
              <Icon name="CreditCard" size={20} />
              <span>Платежи</span>
            </a>
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
                <a 
                  href="#" 
                  className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground/60 cursor-not-allowed"
                  onClick={(e) => e.preventDefault()}
                >
                  <Icon name="Building2" size={18} />
                  <span>Компании</span>
                </a>
                <a 
                  href="/categories" 
                  className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  <Icon name="Tag" size={18} />
                  <span>Категории платежей</span>
                </a>
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

      <main className="ml-[250px] p-[30px] min-h-screen flex-1">
        <header className="flex justify-between items-center mb-[30px] px-[25px] py-[18px] bg-[#1b254b]/50 backdrop-blur-[20px] rounded-[15px] border border-white/10">
          <div className="flex items-center gap-3 bg-card border border-white/10 rounded-[15px] px-5 py-[10px] w-[400px]">
            <Icon name="Search" size={20} className="text-muted-foreground" />
            <Input 
              type="text" 
              placeholder="Поиск сервисов..." 
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
            />
          </div>
          <div className="flex items-center gap-3 px-[15px] py-[10px] rounded-[12px] bg-white/5 border border-white/10">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white">
              А
            </div>
            <div>
              <div className="text-sm font-medium">Администратор</div>
              <div className="text-xs text-muted-foreground">Администратор</div>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-[30px]">
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-[30px]">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
