import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

interface ApplicationCardActiveProps {
  mode: 'active';
  app: Application;
  hasResult: boolean;
  onCreateResult: (app: Application) => void;
  onEdit: (app: Application) => void;
  onDelete: (id: number) => void;
  onPreview: (url: string) => void;
}

interface ApplicationCardArchiveProps {
  mode: 'archive';
  app: Application;
  onPreview: (url: string) => void;
}

interface ApplicationCardTrashProps {
  mode: 'trash';
  app: Application;
  onRestore: (id: number) => void;
  onPermanentDelete: (id: number) => void;
}

type ApplicationCardProps =
  | ApplicationCardActiveProps
  | ApplicationCardArchiveProps
  | ApplicationCardTrashProps;

const resultLabel = (result: Application['result']) => {
  if (result === 'grand_prix') return '🏆 Гран-При';
  if (result === 'first_degree') return '🥇 Диплом 1 степени';
  if (result === 'second_degree') return '🥈 Диплом 2 степени';
  if (result === 'third_degree') return '🥉 Диплом 3 степени';
  if (result === 'participant') return '✨ Участник';
  return '—';
};

const ApplicationCard = (props: ApplicationCardProps) => {
  const { app } = props;

  if (props.mode === 'active') {
    return (
      <Card key={`app-${app.id}`} className="rounded-2xl shadow-md">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 grid md:grid-cols-3 gap-x-4 gap-y-2">
              <div>
                <p className="text-xs text-muted-foreground">ФИО</p>
                <p className="font-semibold text-sm">{app.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Возраст</p>
                <p className="font-semibold text-sm">{app.age} лет</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Название работы</p>
                <p className="font-semibold text-sm">{app.work_title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Конкурс</p>
                <p className="font-semibold text-sm">{app.contest_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Педагог</p>
                <p className="font-semibold text-sm">{app.teacher || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Учреждение</p>
                <p className="font-semibold text-sm">{app.institution || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-semibold text-sm">{app.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Дата подачи</p>
                <p className="font-semibold text-sm">
                  {app.created_at ? new Date(app.created_at).toLocaleString('ru-RU', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Работа</p>
                <button
                  onClick={() => props.onPreview(app.work_file_url)}
                  className="text-primary hover:underline flex items-center gap-1 text-xs cursor-pointer"
                >
                  <Icon name="Eye" size={14} />
                  Посмотреть
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Публикация в галерее</p>
                <span className={`text-sm font-semibold ${app.gallery_consent ? 'text-green-600' : 'text-red-600'}`}>
                  {app.gallery_consent ? '✓ Согласен' : '✗ Не согласен'}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Дата вручения</p>
                <p className="font-semibold text-sm">
                  {app.diploma_issued_at
                    ? new Date(app.diploma_issued_at).toLocaleDateString('ru-RU')
                    : '—'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <Button
                onClick={() => props.onCreateResult(app)}
                variant="default"
                size="sm"
                className={`rounded-xl ${props.hasResult ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                title={props.hasResult ? "Результат уже создан" : "Добавить в результаты"}
                disabled={props.hasResult}
              >
                <Icon name={props.hasResult ? "Check" : "Award"} size={16} />
              </Button>
              <Button
                onClick={() => props.onEdit(app)}
                variant="outline"
                size="sm"
                className="rounded-xl"
              >
                <Icon name="Edit" size={16} />
              </Button>
              <Button
                onClick={() => props.onDelete(app.id)}
                variant="destructive"
                size="sm"
                className="rounded-xl"
              >
                <Icon name="Trash2" size={16} />
              </Button>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-start gap-3 flex-1">
                <Icon name="Award" size={20} className={app.result ? "text-orange-500" : "text-gray-400"} />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-2">Результат</p>
                  {app.result ? (
                    <span className="inline-block px-4 py-2 rounded-lg text-base font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 shadow-md">
                      {resultLabel(app.result)}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-md text-xs bg-gray-200 text-gray-600">
                      Не выбран
                    </span>
                  )}
                </div>
              </div>
              {app.is_featured && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md">
                  <Icon name="Star" size={14} className="fill-white" />
                  Лучшая работа
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (props.mode === 'archive') {
    return (
      <Card key={`arch-${app.id}`} className="rounded-2xl shadow-md border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1 grid md:grid-cols-3 gap-x-4 gap-y-2">
              <div>
                <p className="text-xs text-muted-foreground">ФИО</p>
                <p className="font-semibold text-sm">{app.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Возраст</p>
                <p className="font-semibold text-sm">{app.age} лет</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Название работы</p>
                <p className="font-semibold text-sm">{app.work_title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Конкурс</p>
                <p className="font-semibold text-sm">{app.contest_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Педагог</p>
                <p className="font-semibold text-sm">{app.teacher || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-semibold text-sm">{app.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Работа</p>
                <button
                  onClick={() => props.onPreview(app.work_file_url)}
                  className="text-primary hover:underline flex items-center gap-1 text-xs cursor-pointer"
                >
                  <Icon name="Eye" size={14} />
                  Посмотреть
                </button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Дата подачи</p>
                <p className="font-semibold text-sm">
                  {app.created_at ? new Date(app.created_at).toLocaleDateString('ru-RU') : '—'}
                </p>
              </div>
            </div>
            <div className="ml-4 flex flex-col items-end gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-green-100 text-green-800">
                <Icon name="CheckCircle2" size={14} />
                Итоги опубликованы
              </span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Icon name="Award" size={20} className="text-orange-500" />
              <span className="inline-block px-4 py-2 rounded-lg text-base font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-md">
                {resultLabel(app.result)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card key={app.id} className="rounded-2xl shadow-md opacity-60">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 grid md:grid-cols-3 gap-x-4 gap-y-2">
            <div>
              <p className="text-xs text-muted-foreground">ФИО</p>
              <p className="font-semibold text-sm">{app.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Возраст</p>
              <p className="font-semibold text-sm">{app.age} лет</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Название работы</p>
              <p className="font-semibold text-sm">{app.work_title}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Конкурс</p>
              <p className="font-semibold text-sm">{app.contest_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-semibold text-sm">{app.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Удалено</p>
              <p className="font-semibold text-sm">
                {app.deleted_at ? new Date(app.deleted_at).toLocaleString('ru-RU', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '—'}
              </p>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              onClick={() => props.onRestore(app.id)}
              variant="outline"
              size="sm"
              className="rounded-xl"
            >
              <Icon name="RotateCcw" size={16} className="mr-1" />
              Восстановить
            </Button>
            <Button
              onClick={() => props.onPermanentDelete(app.id)}
              variant="destructive"
              size="sm"
              className="rounded-xl"
            >
              <Icon name="Trash2" size={16} className="mr-1" />
              Удалить
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationCard;