import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";

interface Application {
  id: number;
  full_name: string;
  age: number;
  teacher: string | null;
  institution: string | null;
  work_title: string;
  email: string;
  contest_id: number | null;
  contest_name: string;
  work_file_url: string;
  status: 'new' | 'viewed' | 'sent';
  result: 'grand_prix' | 'first_degree' | 'second_degree' | 'third_degree' | 'participant' | null;
  gallery_consent: boolean;
  diploma_issued_at: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ApplicationEditModalProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  editingApplication: Application | null;
  appResult: string | undefined;
  setAppResult: (v: string | undefined) => void;
  appStatus: 'new' | 'viewed' | 'sent';
  setAppStatus: (v: 'new' | 'viewed' | 'sent') => void;
  onPreview: (url: string) => void;
  loadApplications: () => void;
  APPLICATIONS_API_URL: string;
  UPLOAD_URL: string;
  toast: (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

const ApplicationEditModal = ({
  isOpen,
  setIsOpen,
  editingApplication,
  appResult,
  setAppResult,
  onPreview,
  loadApplications,
  APPLICATIONS_API_URL,
  UPLOAD_URL,
  toast,
}: ApplicationEditModalProps) => {
  const [uploadingWorkFile, setUploadingWorkFile] = useState(false);
  const [newWorkFileUrl, setNewWorkFileUrl] = useState<string | null>(null);
  const [workFileError, setWorkFileError] = useState<string | null>(null);
  const [workFileUploadProgress, setWorkFileUploadProgress] = useState(0);

  const handleClose = (open: boolean) => {
    if (!open) {
      setNewWorkFileUrl(null);
      setWorkFileError(null);
      setWorkFileUploadProgress(0);
    }
    setIsOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-primary">
            Редактирование заявки
          </DialogTitle>
        </DialogHeader>

        {editingApplication && (
          <form
            className="space-y-5 mt-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);

              try {
                const diplomaDate = formData.get('diplomaIssuedAt') as string;
                const updateData: Record<string, unknown> = {
                  id: editingApplication.id,
                  full_name: formData.get('fullName') as string,
                  age: parseInt(formData.get('age') as string),
                  teacher: formData.get('teacher') as string || null,
                  institution: formData.get('institution') as string || null,
                  work_title: formData.get('workTitle') as string,
                  email: formData.get('email') as string,
                  result: appResult && appResult !== 'none' ? appResult : null,
                  diploma_issued_at: diplomaDate || null,
                  is_featured: formData.get('isFeatured') === 'on'
                };
                if (newWorkFileUrl) updateData.work_file_url = newWorkFileUrl;

                const response = await fetch(APPLICATIONS_API_URL, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(updateData)
                });

                if (response.ok) {
                  toast({ title: "Успешно", description: "Заявка обновлена" });
                  setIsOpen(false);
                  loadApplications();
                }
              } catch {
                toast({ title: "Ошибка", description: "Не удалось обновить заявку", variant: "destructive" });
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-base font-semibold">ФИО *</Label>
              <Input id="fullName" name="fullName" defaultValue={editingApplication.full_name} required className="rounded-xl border-2 focus:border-primary" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age" className="text-base font-semibold">Возраст *</Label>
              <Input id="age" name="age" type="number" defaultValue={editingApplication.age} required className="rounded-xl border-2 focus:border-primary" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher" className="text-base font-semibold">Педагог</Label>
              <Input id="teacher" name="teacher" defaultValue={editingApplication.teacher || ''} className="rounded-xl border-2 focus:border-primary" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution" className="text-base font-semibold">Учреждение</Label>
              <Input id="institution" name="institution" defaultValue={editingApplication.institution || ''} className="rounded-xl border-2 focus:border-primary" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="workTitle" className="text-base font-semibold">Название работы *</Label>
              <Input id="workTitle" name="workTitle" defaultValue={editingApplication.work_title} required className="rounded-xl border-2 focus:border-primary" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">Email *</Label>
              <Input id="email" name="email" type="email" defaultValue={editingApplication.email} required className="rounded-xl border-2 focus:border-primary" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="result" className="text-base font-semibold">Результат</Label>
              <Select value={appResult || 'none'} onValueChange={(val) => setAppResult(val === 'none' ? undefined : val)}>
                <SelectTrigger className="rounded-xl border-2">
                  <SelectValue placeholder="Не выбран" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не выбран</SelectItem>
                  <SelectItem value="grand_prix">Гран-При</SelectItem>
                  <SelectItem value="first_degree">1 степень</SelectItem>
                  <SelectItem value="second_degree">2 степень</SelectItem>
                  <SelectItem value="third_degree">3 степень</SelectItem>
                  <SelectItem value="participant">Участник</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="diplomaIssuedAt" className="text-base font-semibold">Дата вручения</Label>
              <Input id="diplomaIssuedAt" name="diplomaIssuedAt" type="date" defaultValue={editingApplication.diploma_issued_at || ''} className="rounded-xl border-2 focus:border-primary" />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-purple-200 bg-purple-50">
              <Checkbox
                id="isFeatured"
                name="isFeatured"
                defaultChecked={editingApplication.is_featured}
              />
              <div>
                <Label htmlFor="isFeatured" className="text-base font-semibold cursor-pointer flex items-center gap-2">
                  <Icon name="Star" size={16} className="text-purple-500" />
                  Лучшая работа
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">Работа попадёт в галерею на главной странице</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-semibold">Файл работы</Label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPreview(newWorkFileUrl || editingApplication.work_file_url)}
                  className="text-primary hover:underline flex items-center gap-2 text-sm"
                >
                  <Icon name="Eye" size={16} />
                  {newWorkFileUrl ? 'Посмотреть новый файл' : 'Посмотреть текущий файл'}
                </button>
                {newWorkFileUrl && (
                  <span className="text-xs text-success flex items-center gap-1">
                    <Icon name="CheckCircle" size={14} />
                    Новый файл загружен
                  </span>
                )}
              </div>
              <div className="border-2 border-dashed border-border rounded-xl p-4 bg-muted/30">
                <Label className="text-sm text-muted-foreground mb-2 block">Заменить файл (JPG, PNG, PDF — до 15 МБ)</Label>
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  disabled={uploadingWorkFile}
                  className="rounded-xl h-10"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 15 * 1024 * 1024) {
                      setWorkFileError('Файл слишком большой. Максимум 15 МБ.');
                      return;
                    }
                    setUploadingWorkFile(true);
                    setWorkFileError(null);
                    setWorkFileUploadProgress(0);
                    setNewWorkFileUrl(null);
                    try {
                      const CHUNK_SIZE = 2 * 1024 * 1024;
                      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
                      let uploadId = '';
                      let fileUrl = '';
                      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                        const start = chunkIndex * CHUNK_SIZE;
                        const end = Math.min(start + CHUNK_SIZE, file.size);
                        const chunk = file.slice(start, end);
                        const chunkBase64 = await new Promise<string>((resolve, reject) => {
                          const reader = new FileReader();
                          reader.onload = () => resolve((reader.result as string).split(',')[1]);
                          reader.onerror = reject;
                          reader.readAsDataURL(chunk);
                        });
                        const response = await fetch(UPLOAD_URL, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            chunk: chunkBase64,
                            chunkIndex,
                            totalChunks,
                            fileName: file.name,
                            fileType: file.type,
                            folder: 'works',
                            uploadId: uploadId || undefined
                          })
                        });
                        const data = await response.json();
                        if (data.uploadId) uploadId = data.uploadId;
                        if (data.url) fileUrl = data.url;
                        setWorkFileUploadProgress(Math.round(((chunkIndex + 1) / totalChunks) * 100));
                      }
                      if (fileUrl) {
                        setNewWorkFileUrl(fileUrl);
                      } else {
                        setWorkFileError('Не удалось загрузить файл. Попробуйте ещё раз.');
                      }
                    } catch {
                      setWorkFileError('Ошибка соединения. Проверьте интернет и попробуйте снова.');
                    } finally {
                      setUploadingWorkFile(false);
                    }
                  }}
                />
                {uploadingWorkFile && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="Loader2" size={14} className="animate-spin" />
                      Загружаю... {workFileUploadProgress}%
                    </div>
                    <div className="w-full bg-border rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${workFileUploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                {workFileError && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                    <Icon name="AlertCircle" size={14} />
                    {workFileError}
                  </p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full rounded-xl bg-primary hover:bg-primary/90">
              Сохранить изменения
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationEditModal;
