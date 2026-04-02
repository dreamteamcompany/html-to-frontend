import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";

const UPLOAD_URL = "https://functions.poehali.dev/33fdaaa7-5f20-43ee-aebd-ece943eb314b";
const SETTINGS_API_URL = "https://functions.poehali.dev/6f549b76-2cfc-4746-a61a-9a946c7a84bd";

interface AdminSettingsTabProps {
  applicationFormUrl: string;
  setApplicationFormUrl: (url: string) => void;
  toast: (opts: { title: string; description?: string; variant?: 'destructive' | 'default' }) => void;
}

const AdminSettingsTab = ({ applicationFormUrl, setApplicationFormUrl, toast }: AdminSettingsTabProps) => {
  const [uploadingAppForm, setUploadingAppForm] = useState(false);
  const { token } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAppForm(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        const response = await fetch(UPLOAD_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            file: base64,
            fileName: file.name,
            fileType: file.type || 'application/octet-stream',
            folder: 'application-forms'
          })
        });
        const data = await response.json();
        setApplicationFormUrl(data.url);
        await fetch(SETTINGS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': token || '',
          },
          body: JSON.stringify({ key: 'application_form_url', value: data.url })
        });
        toast({ title: 'Файл загружен', description: 'Лист подачи заявки успешно загружен' });
      };
      reader.readAsDataURL(file);
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить файл', variant: 'destructive' });
    } finally {
      setUploadingAppForm(false);
    }
  };

  const handleRemoveFile = async () => {
    setApplicationFormUrl('');
    await fetch(SETTINGS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token || '',
      },
      body: JSON.stringify({ key: 'application_form_url', value: '' })
    });
    toast({ title: 'Удалено', description: 'Ссылка на лист подачи заявки удалена' });
  };

  return (
    <div>
      <h2 className="text-3xl font-heading font-bold text-primary mb-8">Настройки</h2>
      <Card className="p-6 rounded-2xl max-w-2xl border border-border">
        <h3 className="text-xl font-heading font-bold mb-4 flex items-center gap-2">
          <Icon name="ClipboardList" size={20} className="text-primary" />
          Лист подачи заявки
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Загрузите файл листа подачи заявки (DOCX, DOC или PDF). Он будет доступен для скачивания в разделе «Документы» на сайте.
        </p>
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="file"
              accept=".docx,.doc,.pdf"
              onChange={handleFileChange}
              disabled={uploadingAppForm}
              className="rounded-xl h-10"
            />
            {uploadingAppForm && <Icon name="Loader2" className="animate-spin" />}
          </div>
          {applicationFormUrl && (
            <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-xl border border-green-500/20">
              <Icon name="CheckCircle" size={18} className="text-green-500" />
              <a
                href={applicationFormUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Icon name="ExternalLink" size={14} />
                Просмотреть загруженный файл
              </a>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-destructive hover:text-destructive"
                onClick={handleRemoveFile}
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminSettingsTab;