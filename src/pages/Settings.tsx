import { useState, useRef, useEffect, useCallback } from 'react';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { API_ENDPOINTS } from '@/config/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BackupHistoryItem {
  action: string;
  username: string;
  created_at: string;
  metadata: { tables?: number; rows?: number; file?: string; size_mb?: number };
}

interface S3Backup {
  key: string;
  name: string;
  size_mb: number;
  created_at: string;
  url: string;
}

const SCHEDULE_LABELS: Record<string, string> = {
  off: 'Отключено',
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
};

const Settings = () => {
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [restoreConfirmText, setRestoreConfirmText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [history, setHistory] = useState<BackupHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [schedule, setSchedule] = useState('off');
  const [lastAutoBackup, setLastAutoBackup] = useState<string | null>(null);
  const [s3Backups, setS3Backups] = useState<S3Backup[]>([]);
  const [autoLoading, setAutoLoading] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [runningBackup, setRunningBackup] = useState(false);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);

  const { token, hasPermission } = useAuth();
  const { toast } = useToast();
  const isAdmin = hasPermission('settings', 'write') || hasPermission('roles', 'write');

  const {
    menuOpen, setMenuOpen,
    handleTouchStart, handleTouchMove, handleTouchEnd,
  } = useSidebarTouch();

  const loadHistory = useCallback(async () => {
    if (!token) return;
    setHistoryLoading(true);
    try {
      const resp = await fetch(`${API_ENDPOINTS.dbBackup}?action=history`, {
        headers: { 'X-Auth-Token': token },
      });
      if (resp.ok) {
        const data = await resp.json();
        setHistory(data.history || []);
      }
    } catch { /* ignore */ } finally {
      setHistoryLoading(false);
    }
  }, [token]);

  const loadAutoSettings = useCallback(async () => {
    if (!token) return;
    setAutoLoading(true);
    try {
      const resp = await fetch(`${API_ENDPOINTS.autoBackup}?action=settings`, {
        headers: { 'X-Auth-Token': token },
      });
      if (resp.ok) {
        const data = await resp.json();
        setSchedule(data.schedule || 'off');
        setLastAutoBackup(data.last_auto_backup || null);
        setS3Backups(data.backups || []);
      }
    } catch { /* ignore */ } finally {
      setAutoLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAdmin) {
      loadHistory();
      loadAutoSettings();
    }
  }, [isAdmin, loadHistory, loadAutoSettings]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const handleSaveSchedule = async (value: string) => {
    setSchedule(value);
    setSavingSchedule(true);
    try {
      const resp = await fetch(`${API_ENDPOINTS.autoBackup}?action=save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ schedule: value }),
      });
      if (resp.ok) {
        toast({ title: 'Сохранено', description: `Расписание: ${SCHEDULE_LABELS[value]}` });
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось сохранить настройки', variant: 'destructive' });
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleRunBackupNow = async () => {
    setRunningBackup(true);
    try {
      const resp = await fetch(`${API_ENDPOINTS.autoBackup}?action=run`, {
        method: 'POST',
        headers: { 'X-Auth-Token': token || '' },
      });
      if (resp.ok) {
        const data = await resp.json();
        toast({
          title: 'Бэкап создан',
          description: `${data.tables} таблиц, ${data.rows} записей (${data.size_mb} МБ)`,
        });
        loadAutoSettings();
        loadHistory();
      } else {
        const err = await resp.json().catch(() => ({ error: 'Ошибка сервера' }));
        throw new Error(err.error);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось создать бэкап',
        variant: 'destructive',
      });
    } finally {
      setRunningBackup(false);
    }
  };

  const handleDeleteBackup = async (key: string) => {
    setDeletingKey(key);
    try {
      const resp = await fetch(`${API_ENDPOINTS.autoBackup}?action=delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ key }),
      });
      if (resp.ok) {
        toast({ title: 'Удалено' });
        setS3Backups(prev => prev.filter(b => b.key !== key));
      }
    } catch {
      toast({ title: 'Ошибка', variant: 'destructive' });
    } finally {
      setDeletingKey(null);
    }
  };

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      const resp = await fetch(`${API_ENDPOINTS.dbBackup}?action=export`, {
        headers: { 'X-Auth-Token': token || '' },
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Ошибка сервера' }));
        throw new Error(err.error || 'Не удалось скачать бэкап');
      }
      const data = await resp.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `backup_${date}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Готово', description: 'Резервная копия скачана' });
      loadHistory();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось скачать бэкап',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setRestoreConfirmText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRestoreBackup = async () => {
    if (restoreConfirmText !== 'ВОССТАНОВИТЬ' || !pendingFile) return;
    setImporting(true);
    try {
      const text = await pendingFile.text();
      const backup = JSON.parse(text);
      const resp = await fetch(`${API_ENDPOINTS.dbBackup}?action=import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || '' },
        body: JSON.stringify({ backup }),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Ошибка сервера' }));
        throw new Error(err.error || 'Не удалось восстановить данные');
      }
      const result = await resp.json();
      toast({
        title: 'Данные восстановлены',
        description: `Таблиц: ${result.tables_restored}, записей: ${result.rows_restored}`,
      });
      setPendingFile(null);
      setRestoreConfirmText('');
      setTimeout(() => { window.location.href = '/'; }, 2000);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось восстановить данные',
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
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
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMenuOpen(false)} />
      )}

      <main className="lg:ml-[250px] p-4 md:p-6 lg:p-[30px] min-h-screen flex-1 overflow-x-hidden max-w-full">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-foreground">
              <Icon name="Menu" size={24} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Резервное копирование</h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Создание и восстановление резервных копий базы данных
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-6">
          {isAdmin && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="DatabaseBackup" fallback="Database" size={24} className="text-[#7551e9]" />
                  Ручное копирование
                </CardTitle>
                <CardDescription>
                  Скачайте копию на устройство или восстановите из файла
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleExportBackup} disabled={exporting} className="bg-[#7551e9] hover:bg-[#6341d4] text-white">
                    {exporting ? (
                      <><Icon name="Loader2" size={18} className="mr-2 animate-spin" />Скачивание...</>
                    ) : (
                      <><Icon name="Download" size={18} className="mr-2" />Скачать резервную копию</>
                    )}
                  </Button>

                  <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-amber-500/40 text-amber-500 hover:bg-amber-500/10 hover:text-amber-500"
                  >
                    <Icon name="Upload" size={18} className="mr-2" />
                    Восстановить из копии
                  </Button>
                </div>

                {pendingFile && (
                  <AlertDialog open={!!pendingFile} onOpenChange={(open) => { if (!open) { setPendingFile(null); setRestoreConfirmText(''); } }}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <Icon name="AlertTriangle" size={24} className="text-amber-500" />
                          Восстановление из резервной копии
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          Файл: <strong>{pendingFile.name}</strong>
                          <br /><br />
                          Все текущие данные будут заменены на данные из файла. Это действие необратимо.
                          <br /><br />
                          Для подтверждения введите: <strong>ВОССТАНОВИТЬ</strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="py-4">
                        <Input
                          value={restoreConfirmText}
                          onChange={(e) => setRestoreConfirmText(e.target.value)}
                          placeholder="Введите ВОССТАНОВИТЬ"
                          className="font-mono"
                        />
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => { setPendingFile(null); setRestoreConfirmText(''); }}>Отмена</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleRestoreBackup}
                          disabled={importing || restoreConfirmText !== 'ВОССТАНОВИТЬ'}
                          className="bg-amber-600 text-white hover:bg-amber-700"
                        >
                          {importing ? 'Восстановление...' : 'Восстановить'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </CardContent>
            </Card>
          )}

          {isAdmin && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CalendarClock" size={24} className="text-emerald-500" />
                  Автоматическое копирование
                </CardTitle>
                <CardDescription>
                  Бэкапы создаются автоматически и сохраняются в облачное хранилище
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium mb-1.5 block">Частота</label>
                    <Select value={schedule} onValueChange={handleSaveSchedule} disabled={savingSchedule}>
                      <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">Отключено</SelectItem>
                        <SelectItem value="daily">Ежедневно</SelectItem>
                        <SelectItem value="weekly">Еженедельно</SelectItem>
                        <SelectItem value="monthly">Ежемесячно</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end gap-3">
                    <Button
                      onClick={handleRunBackupNow}
                      disabled={runningBackup}
                      variant="outline"
                      className="border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-500"
                    >
                      {runningBackup ? (
                        <><Icon name="Loader2" size={18} className="mr-2 animate-spin" />Создание...</>
                      ) : (
                        <><Icon name="Play" size={18} className="mr-2" />Создать сейчас</>
                      )}
                    </Button>
                  </div>
                </div>

                {lastAutoBackup && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Icon name="Clock" size={16} />
                    <span>Последний автобэкап: {formatDate(lastAutoBackup)}</span>
                  </div>
                )}

                {autoLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-2">
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    <span className="text-sm">Загрузка...</span>
                  </div>
                ) : s3Backups.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Сохранённые копии в облаке</h4>
                    <div className="rounded-lg border border-border overflow-hidden">
                      {s3Backups.map((backup) => (
                        <div
                          key={backup.key}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 rounded bg-emerald-500/10 flex-shrink-0">
                              <Icon name="FileJson" fallback="File" size={16} className="text-emerald-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{backup.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(backup.created_at)} · {backup.size_mb} МБ
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <a
                              href={backup.url}
                              download
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#7551e9]/10 text-[#7551e9] hover:bg-[#7551e9]/20 transition-colors"
                            >
                              <Icon name="Download" size={14} />
                              Скачать
                            </a>
                            <button
                              onClick={() => handleDeleteBackup(backup.key)}
                              disabled={deletingKey === backup.key}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
                            >
                              <Icon name={deletingKey === backup.key ? "Loader2" : "Trash2"} size={14} className={deletingKey === backup.key ? "animate-spin" : ""} />
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Автоматических копий пока нет</p>
                )}
              </CardContent>
            </Card>
          )}

          {isAdmin && (
            <Card className="border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="History" size={24} className="text-muted-foreground" />
                  История операций
                </CardTitle>
                <CardDescription>Последние действия с резервными копиями</CardDescription>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-4">
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    <span className="text-sm">Загрузка...</span>
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">Операций с резервными копиями пока не было</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((item, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-3 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            item.action === 'export' ? 'bg-[#7551e9]/10' :
                            item.action === 'auto_export' ? 'bg-emerald-500/10' :
                            'bg-amber-500/10'
                          }`}>
                            <Icon
                              name={item.action === 'export' || item.action === 'auto_export' ? 'Download' : 'Upload'}
                              size={18}
                              className={
                                item.action === 'export' ? 'text-[#7551e9]' :
                                item.action === 'auto_export' ? 'text-emerald-500' :
                                'text-amber-500'
                              }
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {item.action === 'export' ? 'Скачивание копии' :
                               item.action === 'auto_export' ? 'Автоматический бэкап' :
                               item.action === 'delete_backup' ? 'Удаление копии' :
                               'Восстановление из копии'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.username || 'Администратор'}
                              {item.metadata?.tables ? ` · ${item.metadata.tables} табл.` : ''}
                              {item.metadata?.rows ? `, ${item.metadata.rows} записей` : ''}
                              {item.metadata?.size_mb ? ` · ${item.metadata.size_mb} МБ` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground sm:text-right">{formatDate(item.created_at)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
