import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { BackupHistoryItem, formatDate } from './types';

interface BackupHistoryCardProps {
  history: BackupHistoryItem[];
  historyLoading: boolean;
}

const BackupHistoryCard = ({ history, historyLoading }: BackupHistoryCardProps) => (
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
);

export default BackupHistoryCard;
