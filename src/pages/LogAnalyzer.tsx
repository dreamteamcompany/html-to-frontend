import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  source?: string;
  [key: string]: unknown;
}

const LogAnalyzer = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [logSource, setLogSource] = useState<string>('frontend');
  const [limit, setLimit] = useState<string>('100');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

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

  const backendFunctions = [
    'main',
    'upload-file',
    'upload-photo',
    'savings-dashboard',
    'revoke-payment',
    'dashboard-layout',
    'dashboard-stats',
  ];

  const loadLogs = async () => {
    setLoading(true);
    try {
      toast({
        title: 'Функция в разработке',
        description: 'API для получения логов будет добавлено позже',
      });
      
      setLogs([
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: `Анализатор логов готов. Выбран источник: ${logSource}`,
          source: logSource,
        },
        {
          timestamp: new Date().toISOString(),
          level: 'warn',
          message: 'API для получения логов находится в разработке',
          source: 'system',
        },
      ]);
    } catch (error) {
      console.error('Failed to load logs:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить логи',
        variant: 'destructive',
      });
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      log.message?.toLowerCase().includes(searchLower) ||
      log.level?.toLowerCase().includes(searchLower) ||
      log.timestamp?.toLowerCase().includes(searchLower) ||
      JSON.stringify(log).toLowerCase().includes(searchLower)
    );
  });

  const getLevelColor = (level: string) => {
    const levelLower = level?.toLowerCase() || '';
    if (levelLower.includes('error')) return 'text-red-400';
    if (levelLower.includes('warn')) return 'text-yellow-400';
    if (levelLower.includes('info')) return 'text-blue-400';
    if (levelLower.includes('debug')) return 'text-gray-400';
    return 'text-gray-300';
  };

  const getLevelBg = (level: string) => {
    const levelLower = level?.toLowerCase() || '';
    if (levelLower.includes('error')) return 'bg-red-500/10 border-red-500/20';
    if (levelLower.includes('warn')) return 'bg-yellow-500/10 border-yellow-500/20';
    if (levelLower.includes('info')) return 'bg-blue-500/10 border-blue-500/20';
    if (levelLower.includes('debug')) return 'bg-gray-500/10 border-gray-500/20';
    return 'bg-gray-500/10 border-gray-500/20';
  };

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

      <main className="lg:ml-[250px] p-4 md:p-6 lg:p-[30px] min-h-screen flex-1 overflow-x-hidden max-w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-white"
            >
              <Icon name="Menu" size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Анализатор логов</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Все логи фронтенда и бэкенд функций
              </p>
            </div>
          </div>
        </header>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Фильтры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="source">Источник логов</Label>
                <Select value={logSource} onValueChange={setLogSource}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите источник" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frontend">
                      <div className="flex items-center gap-2">
                        <Icon name="Monitor" size={16} />
                        Frontend (браузер)
                      </div>
                    </SelectItem>
                    {backendFunctions.map((fn) => (
                      <SelectItem key={fn} value={`backend/${fn}`}>
                        <div className="flex items-center gap-2">
                          <Icon name="Server" size={16} />
                          Backend: {fn}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="limit">Количество записей</Label>
                <Input
                  id="limit"
                  type="number"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  min="10"
                  max="1000"
                  placeholder="100"
                />
              </div>

              <div className="flex items-end">
                <Button onClick={loadLogs} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="RefreshCw" size={18} className="mr-2" />
                      Загрузить логи
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="search">Поиск по логам</Label>
              <div className="relative">
                <Icon
                  name="Search"
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по сообщению, уровню, времени..."
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Логи ({filteredLogs.length} из {logs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" size={32} className="mx-auto animate-spin text-primary" />
                <p className="text-muted-foreground mt-4">Загрузка логов...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {logs.length === 0 ? 'Нажмите "Загрузить логи" для просмотра' : 'Нет результатов по вашему запросу'}
              </div>
            ) : (
              <div className="max-h-[600px] overflow-y-auto">
                <div className="space-y-2 p-4">
                  {filteredLogs.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${getLevelBg(log.level || '')} font-mono text-sm`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString('ru-RU')}
                        </span>
                        <span className={`font-bold text-xs uppercase ${getLevelColor(log.level || '')}`}>
                          {log.level || 'LOG'}
                        </span>
                        <span className="flex-1 break-all">{log.message || JSON.stringify(log)}</span>
                      </div>
                      {Object.keys(log).length > 3 && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-primary">
                            Показать детали
                          </summary>
                          <pre className="mt-2 text-xs bg-black/20 p-2 rounded overflow-x-auto">
                            {JSON.stringify(log, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LogAnalyzer;
