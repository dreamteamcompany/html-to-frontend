import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { useToast } from '@/hooks/use-toast';

interface LogFile {
  id: number;
  filename: string;
  file_size: number;
  uploaded_at: string;
  total_lines: number;
  status: string;
  statistics: Array<{ level: string; count: number }>;
}

interface LogEntry {
  id: number;
  file_id: number;
  line_number: number;
  timestamp: string | null;
  level: string | null;
  message: string;
  raw_line: string;
}

const API_URL = 'https://functions.poehali.dev/dd221a88-cc33-4a30-a59f-830b0a41862f';

const LogAnalyzer = () => {
  const [files, setFiles] = useState<LogFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<LogFile | null>(null);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 100;
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

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      loadEntries();
    }
  }, [selectedFile, levelFilter, searchQuery, offset]);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?action=list`);
      if (!response.ok) throw new Error('Failed to load files');
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Failed to load files:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список файлов',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEntries = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'entries',
        file_id: selectedFile.id.toString(),
        limit: limit.toString(),
        offset: offset.toString(),
      });
      
      if (levelFilter) params.append('level', levelFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${API_URL}?${params}`);
      if (!response.ok) throw new Error('Failed to load entries');
      
      const data = await response.json();
      setEntries(data.entries);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to load entries:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить логи',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const base64Content = btoa(content);

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            file_content: base64Content,
          }),
        });

        if (!response.ok) throw new Error('Upload failed');

        const result = await response.json();
        toast({
          title: 'Успешно',
          description: `Файл загружен! Обработано строк: ${result.total_lines}`,
        });

        loadFiles();
        event.target.value = '';
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить файл',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getLevelColor = (level: string | null) => {
    if (!level) return 'text-gray-400';
    const levelLower = level.toLowerCase();
    if (levelLower.includes('error') || levelLower.includes('fatal')) return 'text-red-400';
    if (levelLower.includes('warn')) return 'text-yellow-400';
    if (levelLower.includes('info')) return 'text-blue-400';
    if (levelLower.includes('debug') || levelLower.includes('trace')) return 'text-gray-400';
    return 'text-gray-300';
  };

  const getLevelBadgeVariant = (level: string | null): "default" | "destructive" | "secondary" | "outline" => {
    if (!level) return 'secondary';
    const levelLower = level.toLowerCase();
    if (levelLower.includes('error') || levelLower.includes('fatal')) return 'destructive';
    if (levelLower.includes('warn')) return 'outline';
    return 'secondary';
  };

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString('ru-RU');
    } catch {
      return timestamp;
    }
  };

  const uniqueLevels = selectedFile
    ? Array.from(new Set(selectedFile.statistics.map((s) => s.level)))
    : [];

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
                Загружайте и анализируйте файлы логов
              </p>
            </div>
          </div>

          <div>
            <Input
              type="file"
              accept=".log,.txt"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload">
              <Button disabled={uploading} asChild>
                <span className="cursor-pointer">
                  {uploading ? (
                    <>
                      <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" size={18} className="mr-2" />
                      Загрузить файл
                    </>
                  )}
                </span>
              </Button>
            </Label>
          </div>
        </header>

        <Tabs defaultValue="files" className="space-y-4">
          <TabsList>
            <TabsTrigger value="files">
              <Icon name="FileText" size={16} className="mr-2" />
              Файлы ({files.length})
            </TabsTrigger>
            <TabsTrigger value="viewer" disabled={!selectedFile}>
              <Icon name="Eye" size={16} className="mr-2" />
              Просмотр логов
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files">
            {loading && files.length === 0 ? (
              <Card>
                <CardContent className="flex justify-center items-center py-12">
                  <Icon name="Loader2" size={32} className="animate-spin" />
                </CardContent>
              </Card>
            ) : files.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col justify-center items-center py-12 text-center">
                  <Icon name="FileX" size={48} className="text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Нет загруженных файлов</h3>
                  <p className="text-muted-foreground">
                    Загрузите файл логов для начала анализа
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {files.map((file) => (
                  <Card
                    key={file.id}
                    className={`cursor-pointer transition-colors ${
                      selectedFile?.id === file.id ? 'border-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedFile(file);
                      setOffset(0);
                    }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{file.filename}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatTimestamp(file.uploaded_at)} • {file.total_lines} строк • {(
                              file.file_size / 1024
                            ).toFixed(2)}{' '}
                            KB
                          </p>
                        </div>
                        <Badge variant={file.status === 'completed' ? 'default' : 'secondary'}>
                          {file.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {file.statistics.map((stat) => (
                          <Badge key={stat.level} variant={getLevelBadgeVariant(stat.level)}>
                            {stat.level}: {stat.count}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="viewer">
            {selectedFile && (
              <>
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle>Фильтры</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Поиск</Label>
                        <div className="relative">
                          <Icon
                            name="Search"
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          />
                          <Input
                            value={searchQuery}
                            onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setOffset(0);
                            }}
                            placeholder="Поиск по сообщению..."
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Уровень</Label>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={levelFilter === '' ? 'default' : 'outline'}
                            onClick={() => {
                              setLevelFilter('');
                              setOffset(0);
                            }}
                          >
                            Все
                          </Button>
                          {uniqueLevels.map((level) => (
                            <Button
                              key={level}
                              size="sm"
                              variant={levelFilter === level ? 'default' : 'outline'}
                              onClick={() => {
                                setLevelFilter(level);
                                setOffset(0);
                              }}
                            >
                              {level}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>
                        Логи ({total} записей)
                      </CardTitle>
                      <Button variant="outline" size="sm" onClick={loadEntries}>
                        <Icon name="RefreshCw" size={16} className="mr-2" />
                        Обновить
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center py-8">
                        <Icon name="Loader2" size={32} className="animate-spin" />
                      </div>
                    ) : entries.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Логи не найдены
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2 font-mono text-sm">
                          {entries.map((entry) => (
                            <div
                              key={entry.id}
                              className="p-3 rounded border bg-card hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex flex-wrap gap-2 mb-1 text-xs text-muted-foreground">
                                <span>#{entry.line_number}</span>
                                {entry.timestamp && (
                                  <span>{formatTimestamp(entry.timestamp)}</span>
                                )}
                                {entry.level && (
                                  <Badge variant={getLevelBadgeVariant(entry.level)} className="text-xs">
                                    {entry.level}
                                  </Badge>
                                )}
                              </div>
                              <div className={getLevelColor(entry.level)}>{entry.message}</div>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOffset(Math.max(0, offset - limit))}
                            disabled={offset === 0}
                          >
                            <Icon name="ChevronLeft" size={16} className="mr-2" />
                            Назад
                          </Button>

                          <span className="text-sm text-muted-foreground">
                            {offset + 1} - {Math.min(offset + limit, total)} из {total}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setOffset(offset + limit)}
                            disabled={offset + limit >= total}
                          >
                            Вперёд
                            <Icon name="ChevronRight" size={16} className="ml-2" />
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default LogAnalyzer;
