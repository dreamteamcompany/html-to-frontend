export interface BackupHistoryItem {
  action: string;
  username: string;
  created_at: string;
  metadata: { tables?: number; rows?: number; file?: string; size_mb?: number };
}

export interface S3Backup {
  key: string;
  name: string;
  size_mb: number;
  created_at: string;
  url: string;
}

export const SCHEDULE_LABELS: Record<string, string> = {
  off: 'Отключено',
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
  monthly: 'Ежемесячно',
};

export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};
