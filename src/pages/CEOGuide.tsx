import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';

const CEOGuide = () => {
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    menuOpen, setMenuOpen,
    handleTouchStart, handleTouchMove, handleTouchEnd,
  } = useSidebarTouch();

  const steps = useMemo(() => ([
    {
      n: 1,
      icon: 'LogIn',
      title: 'Как зайти в систему',
      text: 'Откройте страницу входа. Нажмите «Войти через Битрикс24» — это самый быстрый способ. Или введите логин и пароль, которые вам выдал администратор. Поставьте галочку «Запомнить меня», чтобы не входить каждый раз.',
    },
    {
      n: 2,
      icon: 'LayoutDashboard',
      title: 'Главный экран — Дашборд',
      text: 'После входа вы попадёте на Дашборд. Здесь вся картина за минуту: сколько платежей, на какую сумму, сколько ждут вашего одобрения. Можно переключать период: Сегодня / Неделя / Месяц / Год.',
    },
    {
      n: 3,
      icon: 'Bell',
      title: 'Где искать платежи на одобрение',
      text: 'В левом меню нажмите «Платежи». Рядом будет красный кружок с цифрой — это сколько платежей ждут именно вас. По умолчанию откроется вкладка «На согласовании» — там только то, что требует вашего решения.',
    },
    {
      n: 4,
      icon: 'Eye',
      title: 'Как посмотреть детали платежа',
      text: 'Нажмите на карточку платежа — откроется полная информация: описание, сумма, контрагент, отдел, юр.лицо, прикреплённый счёт и кто создал заявку. Справа будут вкладки «Обсуждение» (комментарии команды) и «История» (кто что делал с платежом).',
    },
    {
      n: 5,
      icon: 'Check',
      title: 'Как одобрить платёж',
      text: 'Если всё устраивает — нажмите зелёную кнопку «Согласовать» (в деталях) или «Одобрить» (на карточке). Платёж сразу уходит финансистам на оплату и перемещается во вкладку «Согласованные».',
    },
    {
      n: 6,
      icon: 'X',
      title: 'Как отклонить платёж',
      text: 'Если что-то не так — нажмите красную кнопку «Отклонить». Перед этим можно оставить комментарий во вкладке «Обсуждение», чтобы автор заявки понял, что исправить. Платёж вернётся создателю для доработки.',
    },
    {
      n: 7,
      icon: 'CheckCheck',
      title: 'Одобрить сразу всё',
      text: 'Если платежей много и все они у проверенных поставщиков — нажмите зелёную кнопку «Одобрить все (N)» сверху. Система попросит подтвердить. После этого все платежи разом уйдут в оплату.',
    },
    {
      n: 8,
      icon: 'History',
      title: 'История ваших решений',
      text: 'В меню есть пункт «История согласований» — там список всех платежей, которые вы когда-либо одобряли или отклоняли, с датами и комментариями. Удобно, если нужно вспомнить, почему было принято то или иное решение.',
    },
    {
      n: 9,
      icon: 'Download',
      title: 'Выгрузка в Excel',
      text: 'На странице платежей и на Дашборде есть кнопка «Выгрузить Excel». Одним кликом получаете файл со всеми платежами за выбранный период — удобно для отчётов и совещаний.',
    },
    {
      n: 10,
      icon: 'BellRing',
      title: 'Уведомления',
      text: 'В верхнем углу есть иконка колокольчика. Красный кружок показывает, сколько новых событий ждут внимания: новые платежи на согласование, комментарии, изменения. Нажмите — и сразу попадёте на нужный платёж.',
    },
  ]), []);

  const statuses = [
    { color: 'bg-gray-500', label: 'Черновик', desc: 'Сотрудник ещё готовит заявку, вам не показывается' },
    { color: 'bg-yellow-500', label: 'На согласовании (другие)', desc: 'Идёт по цепочке согласований до вас' },
    { color: 'bg-blue-500', label: 'На согласовании (CEO)', desc: 'Ждёт ВАШЕГО решения' },
    { color: 'bg-green-500', label: 'Согласован', desc: 'Вы одобрили — ушло финансистам' },
    { color: 'bg-red-500', label: 'Отклонён', desc: 'Вы отклонили — вернулось создателю' },
    { color: 'bg-emerald-600', label: 'Оплачен', desc: 'Финансисты провели оплату, процесс завершён' },
  ];

  return (
    <div
      className="flex min-h-screen bg-background text-foreground"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <PaymentsSidebar
        menuOpen={menuOpen}
        dictionariesOpen={dictionariesOpen}
        setDictionariesOpen={setDictionariesOpen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />

      <main className="flex-1 md:ml-64 p-4 md:p-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden mb-4"
            onClick={() => setMenuOpen(true)}
          >
            <Icon name="Menu" size={20} />
          </Button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Icon name="BookOpen" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Инструкция для руководителя</h1>
              <p className="text-muted-foreground">Как согласовывать платежи за 2 минуты</p>
            </div>
          </div>
        </div>

        <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Icon name="Lightbulb" size={24} className="text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold mb-1">Главное в двух словах</p>
                <p className="text-sm text-muted-foreground">
                  Сотрудники создают заявки на оплату. Они проходят проверку у ответственных специалистов,
                  а на последнем шаге приходят к вам. Вы либо <span className="text-green-500 font-medium">одобряете</span> — и платёж уходит в оплату,
                  либо <span className="text-red-500 font-medium">отклоняете</span> — и он возвращается автору на доработку.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 mb-10">
          {steps.map((step) => (
            <Card key={step.n} className="hover:border-blue-500/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold flex-shrink-0">
                    {step.n}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon name={step.icon} size={18} className="text-blue-500" />
                      {step.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pl-14">
                <p className="text-muted-foreground leading-relaxed">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Workflow" size={20} className="text-blue-500" />
              Как платёж движется по системе
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {statuses.map((s, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className={`w-3 h-3 rounded-full ${s.color} flex-shrink-0`} />
                  <div className="flex-1">
                    <div className="font-medium">{s.label}</div>
                    <div className="text-sm text-muted-foreground">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="HelpCircle" size={20} className="text-blue-500" />
              Частые вопросы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold mb-1">Я одобрил случайно — можно отменить?</p>
              <p className="text-sm text-muted-foreground">
                Да. Откройте платёж и нажмите оранжевую кнопку «Отозвать платёж» — он вернётся в работу с указанием причины.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Что делать, если сумма кажется странной?</p>
              <p className="text-sm text-muted-foreground">
                Откройте платёж, зайдите во вкладку «Обсуждение» и напишите вопрос автору. Можно не нажимать «Одобрить» и «Отклонить» — платёж просто подождёт.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Где посмотреть прикреплённый счёт?</p>
              <p className="text-sm text-muted-foreground">
                Откройте карточку платежа — в правой части будет кнопка «Счёт». Нажмите, чтобы скачать или посмотреть файл.
              </p>
            </div>
            <div>
              <p className="font-semibold mb-1">Могу ли я пользоваться системой с телефона?</p>
              <p className="text-sm text-muted-foreground">
                Да. Всё работает в браузере телефона. В меню слева есть кнопка «Меню» (три полоски) — через неё открывается навигация.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
              <div>
                <p className="font-semibold mb-1">Готовы начать?</p>
                <p className="text-sm text-muted-foreground">Посмотрите, какие платежи ждут вашего решения прямо сейчас</p>
              </div>
              <Link to="/payments">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                  <Icon name="ArrowRight" size={16} className="mr-2" />
                  К платежам на одобрение
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CEOGuide;
