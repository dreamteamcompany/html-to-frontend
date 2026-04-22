import { useState, useRef, useEffect, useCallback } from 'react';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import Icon from '@/components/ui/icon';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import ManualBackupCard from './settings/ManualBackupCard';
import AutoBackupCard from './settings/AutoBackupCard';
import BackupHistoryCard from './settings/BackupHistoryCard';
import { BackupHistoryItem, S3Backup, SCHEDULE_LABELS } from './settings/types';

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
            <ManualBackupCard
              exporting={exporting}
              importing={importing}
              pendingFile={pendingFile}
              setPendingFile={setPendingFile}
              restoreConfirmText={restoreConfirmText}
              setRestoreConfirmText={setRestoreConfirmText}
              fileInputRef={fileInputRef}
              handleExportBackup={handleExportBackup}
              handleFileSelect={handleFileSelect}
              handleRestoreBackup={handleRestoreBackup}
            />
          )}

          {isAdmin && (
            <AutoBackupCard
              schedule={schedule}
              savingSchedule={savingSchedule}
              runningBackup={runningBackup}
              lastAutoBackup={lastAutoBackup}
              autoLoading={autoLoading}
              s3Backups={s3Backups}
              deletingKey={deletingKey}
              handleSaveSchedule={handleSaveSchedule}
              handleRunBackupNow={handleRunBackupNow}
              handleDeleteBackup={handleDeleteBackup}
            />
          )}

          {isAdmin && (
            <BackupHistoryCard
              history={history}
              historyLoading={historyLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Settings;
