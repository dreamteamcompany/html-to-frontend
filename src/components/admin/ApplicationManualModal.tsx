import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";

interface Contest {
  id?: number;
  title: string;
}

interface ApplicationManualModalProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  contests: Contest[];
  manualAppFile: File | null;
  setManualAppFile: (v: File | null) => void;
  manualContestName: string;
  setManualContestName: (v: string) => void;
  submittingManualApp: boolean;
  manualAppUploadProgress: number;
  handleManualAppSubmit: (e: React.FormEvent) => void;
  toast: (opts: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void;
}

const ApplicationManualModal = ({
  isOpen,
  setIsOpen,
  contests,
  manualAppFile,
  setManualAppFile,
  manualContestName,
  setManualContestName,
  submittingManualApp,
  manualAppUploadProgress,
  handleManualAppSubmit,
  toast,
}: ApplicationManualModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-primary">
            Добавить заявку вручную
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleManualAppSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>ФИО участника *</Label>
            <Input name="manualFullName" placeholder="Введите ФИО участника" required className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Возраст *</Label>
            <Input name="manualAge" type="number" placeholder="Введите возраст" required className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Педагог</Label>
            <Input name="manualTeacher" placeholder="ФИО педагога (если есть)" className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Учреждение</Label>
            <Input name="manualInstitution" placeholder="Название школы, студии или учреждения" className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Название творческой работы *</Label>
            <Input name="manualWorkTitle" placeholder="Введите название работы" required className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Электронная почта *</Label>
            <Input name="manualEmail" type="email" placeholder="example@mail.ru" required className="rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label>Конкурс *</Label>
            <Select value={manualContestName} onValueChange={setManualContestName}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Выберите конкурс" />
              </SelectTrigger>
              <SelectContent>
                {contests.map((c) => (
                  <SelectItem key={c.id || c.title} value={c.title}>{c.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Загрузить работу *</Label>
            <Input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const maxSize = 15 * 1024 * 1024;
                  if (file.size > maxSize) {
                    toast({
                      title: "Файл слишком большой",
                      description: `Максимальный размер файла — 15 МБ. Ваш файл: ${(file.size / 1024 / 1024).toFixed(1)} МБ`,
                      variant: "destructive"
                    });
                    e.target.value = '';
                    setManualAppFile(null);
                    return;
                  }
                  setManualAppFile(file);
                } else {
                  setManualAppFile(null);
                }
              }}
              className="rounded-xl h-10"
            />
            {manualAppFile && !submittingManualApp && (
              <div className="flex items-center gap-2 p-2 bg-green-50 rounded-xl text-sm">
                <Icon name="CheckCircle" className="text-green-600" size={16} />
                <span className="text-green-700 font-semibold">{manualAppFile.name} ({(manualAppFile.size / 1024 / 1024).toFixed(1)} МБ)</span>
              </div>
            )}
            {submittingManualApp && manualAppUploadProgress > 0 && (
              <div className="space-y-2 p-3 bg-primary/10 rounded-xl">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-primary">Загрузка файла...</span>
                  <span className="text-primary">{manualAppUploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${manualAppUploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">Форматы: JPG, PNG, PDF (макс. 15 МБ)</p>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-accent/10 rounded-xl">
            <Checkbox id="manualGallery" name="manualGallery" />
            <Label htmlFor="manualGallery" className="text-sm cursor-pointer">
              Согласие на публикацию работы в галерее сайта
            </Label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={submittingManualApp}
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {submittingManualApp ? (
                <>
                  <Icon name="Loader2" className="mr-2 animate-spin" size={16} />
                  {manualAppUploadProgress < 60 ? `Загрузка ${manualAppUploadProgress}%` : 'Создание заявки...'}
                </>
              ) : (
                <><Icon name="Plus" className="mr-2" size={16} />Создать заявку</>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1 rounded-xl"
            >
              Отмена
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ApplicationManualModal;
