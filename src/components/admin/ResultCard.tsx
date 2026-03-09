import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

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

interface ResultCardProps {
  result: Result;
  handleDeleteResult: (id: number) => void;
}

const ResultCard = ({ result, handleDeleteResult }: ResultCardProps) => {
  return (
    <Card className="rounded-2xl shadow-md">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 grid md:grid-cols-3 gap-x-4 gap-y-2">
            <div>
              <p className="text-xs text-muted-foreground">ФИО</p>
              <p className="font-semibold text-sm">{result.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Возраст</p>
              <p className="font-semibold text-sm">{result.age} лет</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Название работы</p>
              <p className="font-semibold text-sm">{result.work_title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Конкурс</p>
              <p className="font-semibold text-sm">{result.contest_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Педагог</p>
              <p className="font-semibold text-sm">{result.teacher || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Учреждение</p>
              <p className="font-semibold text-sm">{result.institution || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Файл работы</p>
              {result.work_file_url ? (
                <button
                  onClick={() => window.open(result.work_file_url!, '_blank')}
                  className="text-primary hover:underline flex items-center gap-1 text-xs cursor-pointer"
                >
                  <Icon name="Eye" size={14} />
                  Посмотреть
                </button>
              ) : (
                <p className="font-semibold text-sm">—</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Результат</p>
              <p className="font-semibold text-sm">{result.result || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Место</p>
              <p className="font-semibold text-sm">{result.place || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Баллы</p>
              <p className="font-semibold text-sm">{result.score || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Диплом</p>
              {result.diploma_url ? (
                <button
                  onClick={() => window.open(result.diploma_url!, '_blank')}
                  className="text-primary hover:underline flex items-center gap-1 text-xs cursor-pointer"
                >
                  <Icon name="FileText" size={14} />
                  Открыть
                </button>
              ) : (
                <p className="font-semibold text-sm">—</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Публикация в галерее</p>
              <span className={`text-sm font-semibold ${result.gallery_consent ? 'text-green-600' : 'text-red-600'}`}>
                {result.gallery_consent ? '✓ Согласен' : '✗ Не согласен'}
              </span>
            </div>
            {result.diploma_issued_at && (
              <div>
                <p className="text-xs text-muted-foreground">Дата вручения</p>
                <p className="font-semibold text-sm">{new Date(result.diploma_issued_at).toLocaleDateString('ru-RU')}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              onClick={() => handleDeleteResult(result.id)}
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
  );
};

export default ResultCard;
