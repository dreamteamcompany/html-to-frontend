import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";

interface Contest {
  id?: number;
  title: string;
  description: string;
  categoryId: string;
  deadline: string;
  price: number;
  status: string;
  rulesLink: string;
  diplomaImage: string;
  image: string;
  isPopular?: boolean;
}

interface AdminContestsTabProps {
  contests: Contest[];
  isModalOpen: boolean;
  setIsModalOpen: (v: boolean) => void;
  editingContest: Contest | null;
  formData: Contest;
  setFormData: (v: Contest) => void;
  uploadingRules: boolean;
  setUploadingRules: (v: boolean) => void;
  uploadingDiploma: boolean;
  setUploadingDiploma: (v: boolean) => void;
  handleCreateContest: () => void;
  handleEditContest: (contest: Contest) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleDelete: (id: number) => void;
  UPLOAD_URL: string;
}

const categories = [
  { id: "visual-arts", name: "Конкурсы изобразительного искусства" },
  { id: "decorative-arts", name: "Конкурсы декоративно-прикладного искусства" },
  { id: "nature", name: "Конкурсы, посвященные теме природы" },
  { id: "animals", name: "Конкурсы, посвященные теме животных" },
  { id: "plants", name: "Конкурсы, посвященные теме растений" },
  { id: "holidays", name: "Конкурсы, посвященные теме праздников" },
  { id: "thematic", name: "Тематические конкурсы ИЗО и творчества" },
  { id: "literary", name: "Конкурсы, посвященные литературным сюжетам и образам" },
  { id: "preschool", name: "Конкурсы для детей дошкольного возраста" },
  { id: "artists-masters", name: "Конкурсы ИЗО и ДПИ, посвященные творчеству выдающихся художников" }
];

const AdminContestsTab = ({
  contests,
  isModalOpen,
  setIsModalOpen,
  editingContest,
  formData,
  setFormData,
  uploadingRules,
  setUploadingRules,
  uploadingDiploma,
  setUploadingDiploma,
  handleCreateContest,
  handleEditContest,
  handleSubmit,
  handleDelete,
  UPLOAD_URL,
}: AdminContestsTabProps) => {
  const [rulesError, setRulesError] = useState<string | null>(null);
  const [diplomaError, setDiplomaError] = useState<string | null>(null);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-heading font-bold text-primary">Управление конкурсами</h2>
        <Button
          onClick={handleCreateContest}
          className="rounded-xl bg-primary hover:bg-primary/90"
        >
          <Icon name="Plus" className="mr-2" />
          Создать конкурс
        </Button>
      </div>

      <div className="grid gap-4">
        {contests.map((contest) => (
          <Card key={contest.id} className="rounded-3xl shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-primary mb-2">
                    {contest.isPopular && <span className="mr-1">⭐</span>}{contest.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{contest.description}</p>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="bg-secondary/20 px-3 py-1 rounded-lg">
                      {categories.find(c => c.id === contest.categoryId)?.name}
                    </span>
                    <span className="bg-info/20 px-3 py-1 rounded-lg">
                      До: {contest.deadline}
                    </span>
                    <span className="bg-success/20 px-3 py-1 rounded-lg">
                      {contest.price} ₽
                    </span>
                    <span className={`px-3 py-1 rounded-lg ${contest.status === 'new' ? 'bg-success/20' : 'bg-primary/20'}`}>
                      {contest.status === 'new' ? 'Новый' : 'Активный'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    onClick={() => handleEditContest(contest)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                  >
                    <Icon name="Edit" size={16} />
                  </Button>
                  <Button
                    onClick={() => contest.id && handleDelete(contest.id)}
                    variant="destructive"
                    size="sm"
                    className="rounded-xl"
                  >
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading font-bold text-primary">
              {editingContest ? "Редактировать конкурс" : "Создать конкурс"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Название конкурса *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Описание *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                className="rounded-xl"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Категория *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({...formData, categoryId: value})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Дата дедлайна *</Label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Стоимость участия (₽) *</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Статус</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="new">Новый</SelectItem>
                  <SelectItem value="completed">Завершен</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Загрузить положение (PDF)</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingRules(true);
                    setRulesError(null);
                    try {
                      const reader = new FileReader();
                      reader.onload = async () => {
                        try {
                          const base64 = reader.result?.toString().split(',')[1];
                          const uploadId = crypto.randomUUID();
                          const response = await fetch(UPLOAD_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              chunk: base64,
                              chunkIndex: 0,
                              totalChunks: 1,
                              uploadId,
                              fileName: file.name,
                              fileType: file.type || 'application/octet-stream',
                              folder: 'rules'
                            })
                          });
                          const data = await response.json();
                          if (data.url) {
                            setFormData({...formData, rulesLink: data.url});
                          } else {
                            setRulesError(data.error || 'Не удалось загрузить файл. Попробуйте ещё раз.');
                          }
                        } catch {
                          setRulesError('Ошибка соединения. Проверьте интернет и попробуйте снова.');
                        } finally {
                          setUploadingRules(false);
                        }
                      };
                      reader.onerror = () => {
                        setRulesError('Не удалось прочитать файл.');
                        setUploadingRules(false);
                      };
                      reader.readAsDataURL(file);
                    } catch {
                      setRulesError('Произошла ошибка при загрузке.');
                      setUploadingRules(false);
                    }
                  }}
                  disabled={uploadingRules}
                  className="rounded-xl h-10"
                />
                {uploadingRules && <Icon name="Loader2" className="animate-spin" />}
              </div>
              {rulesError && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <Icon name="AlertCircle" size={14} />
                  {rulesError}
                </p>
              )}
              {formData.rulesLink && formData.rulesLink !== '#' && (
                <a href={formData.rulesLink} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                  <Icon name="ExternalLink" size={14} />
                  Посмотреть загруженный файл
                </a>
              )}
            </div>

            <div className="space-y-2">
              <Label>Загрузить изображение диплома</Label>
              <div className="flex gap-2 items-center">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploadingDiploma(true);
                    setDiplomaError(null);
                    try {
                      const reader = new FileReader();
                      reader.onload = async () => {
                        try {
                          const base64 = reader.result?.toString().split(',')[1];
                          const uploadId = crypto.randomUUID();
                          const response = await fetch(UPLOAD_URL, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              chunk: base64,
                              chunkIndex: 0,
                              totalChunks: 1,
                              uploadId,
                              fileName: file.name,
                              fileType: file.type,
                              folder: 'diplomas'
                            })
                          });
                          const data = await response.json();
                          if (data.url) {
                            setFormData({...formData, diplomaImage: data.url});
                          } else {
                            setDiplomaError(data.error || 'Не удалось загрузить изображение. Попробуйте ещё раз.');
                          }
                        } catch {
                          setDiplomaError('Ошибка соединения. Проверьте интернет и попробуйте снова.');
                        } finally {
                          setUploadingDiploma(false);
                        }
                      };
                      reader.onerror = () => {
                        setDiplomaError('Не удалось прочитать файл.');
                        setUploadingDiploma(false);
                      };
                      reader.readAsDataURL(file);
                    } catch {
                      setDiplomaError('Произошла ошибка при загрузке.');
                      setUploadingDiploma(false);
                    }
                  }}
                  disabled={uploadingDiploma}
                  className="rounded-xl h-10"
                />
                {uploadingDiploma && <Icon name="Loader2" className="animate-spin" />}
              </div>
              {diplomaError && (
                <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                  <Icon name="AlertCircle" size={14} />
                  {diplomaError}
                </p>
              )}
              {formData.diplomaImage && (
                <div className="mt-2">
                  <img src={formData.diplomaImage} alt="Превью диплома" className="w-32 h-auto rounded-lg border" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-xl">
              <input
                type="checkbox"
                id="isPopular"
                checked={!!formData.isPopular}
                onChange={(e) => setFormData({...formData, isPopular: e.target.checked})}
                className="w-5 h-5 accent-primary cursor-pointer"
              />
              <Label htmlFor="isPopular" className="cursor-pointer">
                ⭐ Показывать в разделе «Популярные конкурсы» на главной
              </Label>
            </div>

            <Button
              type="submit"
              className="w-full rounded-xl bg-primary hover:bg-primary/90"
            >
              {editingContest ? "Сохранить изменения" : "Создать конкурс"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminContestsTab;