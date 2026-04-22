import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { S3Backup, formatDate } from './types';

interface AutoBackupCardProps {
  schedule: string;
  savingSchedule: boolean;
  runningBackup: boolean;
  lastAutoBackup: string | null;
  autoLoading: boolean;
  s3Backups: S3Backup[];
  deletingKey: string | null;
  handleSaveSchedule: (value: string) => void;
  handleRunBackupNow: () => void;
  handleDeleteBackup: (key: string) => void;
}

const AutoBackupCard = ({
  schedule,
  savingSchedule,
  runningBackup,
  lastAutoBackup,
  autoLoading,
  s3Backups,
  deletingKey,
  handleSaveSchedule,
  handleRunBackupNow,
  handleDeleteBackup,
}: AutoBackupCardProps) => (
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
);

export default AutoBackupCard;
