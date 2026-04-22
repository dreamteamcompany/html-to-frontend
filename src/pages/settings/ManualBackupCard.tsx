import { RefObject } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
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

interface ManualBackupCardProps {
  exporting: boolean;
  importing: boolean;
  pendingFile: File | null;
  setPendingFile: (file: File | null) => void;
  restoreConfirmText: string;
  setRestoreConfirmText: (text: string) => void;
  fileInputRef: RefObject<HTMLInputElement>;
  handleExportBackup: () => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRestoreBackup: () => void;
}

const ManualBackupCard = ({
  exporting,
  importing,
  pendingFile,
  setPendingFile,
  restoreConfirmText,
  setRestoreConfirmText,
  fileInputRef,
  handleExportBackup,
  handleFileSelect,
  handleRestoreBackup,
}: ManualBackupCardProps) => (
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
);

export default ManualBackupCard;
