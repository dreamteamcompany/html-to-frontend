import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const GENERATE_CERT_URL = "https://functions.poehali.dev/7ea2c01d-bd1a-4567-b4f0-21aab3b96774";

interface CertificateRow {
  id: number;
  result_id: number;
  full_name: string;
  contest_name: string;
  issued_at: string;
}

interface AdminCertificatesTabProps {
  certificatesLog: CertificateRow[];
  certLoading: boolean;
  onRefresh: () => void;
  toast: (opts: { title: string; description?: string; variant?: 'destructive' | 'default' }) => void;
}

const AdminCertificatesTab = ({ certificatesLog, certLoading, onRefresh, toast }: AdminCertificatesTabProps) => {
  const handleDownload = async (row: CertificateRow) => {
    const res = await fetch(`${GENERATE_CERT_URL}?id=${row.result_id}`);
    if (!res.ok) {
      toast({ title: 'Ошибка', description: 'Не удалось сформировать справку', variant: 'destructive' });
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate_${row.result_id}_${(row.full_name || '').replace(/\s+/g, '_')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-heading font-bold text-primary">Выданные справки</h2>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Обновить
        </Button>
      </div>
      {certLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Icon name="Loader2" className="animate-spin" /> Загрузка...
        </div>
      ) : certificatesLog.length === 0 ? (
        <p className="text-muted-foreground">Справки ещё не выдавались</p>
      ) : (
        <div className="rounded-2xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">ID</th>
                <th className="text-left px-4 py-3 font-semibold">Участник</th>
                <th className="text-left px-4 py-3 font-semibold">Конкурс</th>
                <th className="text-left px-4 py-3 font-semibold">ID результата</th>
                <th className="text-left px-4 py-3 font-semibold">Дата и время выдачи</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {certificatesLog.map((row, i) => (
                <tr key={row.id} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                  <td className="px-4 py-3 text-muted-foreground">{row.id}</td>
                  <td className="px-4 py-3 font-medium">{row.full_name || '—'}</td>
                  <td className="px-4 py-3">{row.contest_name || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.result_id}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(row.issued_at).toLocaleString('ru-RU', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(row)}>
                      <Icon name="Download" size={16} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCertificatesTab;
