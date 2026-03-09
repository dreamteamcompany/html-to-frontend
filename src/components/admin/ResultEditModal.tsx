import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Result {
  id: number;
  application_id: number | null;
  full_name: string;
  age: number | null;
  teacher: string | null;
  institution: string | null;
  work_title: string | null;
  email: string | null;
  contest_id: number | null;
  contest_name: string | null;
  work_file_url: string | null;
  result: string | null;
  place: number | null;
  score: number | null;
  diploma_url: string | null;
  notes: string | null;
  gallery_consent: boolean;
  diploma_issued_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ResultEditModalProps {
  isResultModalOpen: boolean;
  setIsResultModalOpen: (v: boolean) => void;
  editingResult: Result | null;
  setEditingResult: (v: Result | null) => void;
  handleSaveResult: (e: React.FormEvent) => void;
}

const ResultEditModal = ({
  isResultModalOpen,
  setIsResultModalOpen,
  editingResult,
  setEditingResult,
  handleSaveResult,
}: ResultEditModalProps) => {
  return (
    <Dialog open={isResultModalOpen} onOpenChange={setIsResultModalOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading font-bold text-primary">
            Редактировать результат
          </DialogTitle>
        </DialogHeader>

        {editingResult && (
          <form onSubmit={handleSaveResult} className="space-y-4">
            <div className="space-y-2">
              <Label>ФИО *</Label>
              <Input
                value={editingResult.full_name}
                onChange={(e) => setEditingResult({...editingResult, full_name: e.target.value})}
                required
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Возраст</Label>
              <Input
                type="number"
                value={editingResult.age || ''}
                onChange={(e) => setEditingResult({...editingResult, age: parseInt(e.target.value) || null})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Педагог</Label>
              <Input
                value={editingResult.teacher || ''}
                onChange={(e) => setEditingResult({...editingResult, teacher: e.target.value})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Учреждение</Label>
              <Input
                value={editingResult.institution || ''}
                onChange={(e) => setEditingResult({...editingResult, institution: e.target.value})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Название работы</Label>
              <Input
                value={editingResult.work_title || ''}
                onChange={(e) => setEditingResult({...editingResult, work_title: e.target.value})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editingResult.email || ''}
                onChange={(e) => setEditingResult({...editingResult, email: e.target.value})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Название конкурса</Label>
              <Input
                value={editingResult.contest_name || ''}
                onChange={(e) => setEditingResult({...editingResult, contest_name: e.target.value})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Результат</Label>
              <Select
                value={editingResult.result || 'none'}
                onValueChange={(value) => setEditingResult({...editingResult, result: value === 'none' ? null : value})}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Не указан</SelectItem>
                  <SelectItem value="Победитель">Победитель</SelectItem>
                  <SelectItem value="Призер">Призер</SelectItem>
                  <SelectItem value="Участник">Участник</SelectItem>
                  <SelectItem value="Гран-при">Гран-при</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Место</Label>
              <Input
                type="number"
                value={editingResult.place || ''}
                onChange={(e) => setEditingResult({...editingResult, place: parseInt(e.target.value) || null})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Баллы</Label>
              <Input
                type="number"
                step="0.01"
                value={editingResult.score || ''}
                onChange={(e) => setEditingResult({...editingResult, score: parseFloat(e.target.value) || null})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Ссылка на диплом</Label>
              <Input
                value={editingResult.diploma_url || ''}
                onChange={(e) => setEditingResult({...editingResult, diploma_url: e.target.value})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Дата вручения</Label>
              <Input
                type="date"
                value={editingResult.diploma_issued_at || ''}
                onChange={(e) => setEditingResult({...editingResult, diploma_issued_at: e.target.value || null})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Примечания</Label>
              <Textarea
                value={editingResult.notes || ''}
                onChange={(e) => setEditingResult({...editingResult, notes: e.target.value})}
                className="rounded-xl"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 rounded-xl bg-primary hover:bg-primary/90">
                Сохранить
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsResultModalOpen(false)}
                className="flex-1 rounded-xl"
              >
                Отмена
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResultEditModal;
