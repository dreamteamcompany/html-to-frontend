import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const tariffs = [
  {
    name: 'БАЗОВЫЙ',
    price: '5 400',
    controlLevel: 'Регулярные занятия',
    audience: 'Ребёнок работает сам, нужна база',
    format: 'Группа до 10 человек',
    duration: '4 занятия/мес • 60 минут',
    features: [
      'Определим уровень и составим план',
      'Занятия по чёткому расписанию',
      'Проверка знаний раз в месяц',
      'Доступ к материалам курса'
    ],
    result: 'Подходит для дисциплинированных учеников',
    popular: false
  },
  {
    name: 'СТАНДАРТ',
    price: '6 900',
    controlLevel: 'С регулярными отчётами',
    audience: 'Хотите видеть процесс и влиять на него',
    format: 'Мини-группа 3–5 человек',
    duration: '8 занятий/мес • 60 минут',
    features: [
      'Вы понимаете, как идёт обучение',
      'Отчёт каждые 2 недели с конкретикой',
      'Узнаёте о пропусках сразу',
      'Каждое ДЗ проверяется с разбором',
      'Видите реальный прогресс ежемесячно'
    ],
    result: 'Родитель спокоен, ребёнок под присмотром',
    popular: true
  },
  {
    name: 'ПРЕМИУМ',
    price: '9 900',
    controlLevel: 'Полное сопровождение',
    audience: 'Нужна уверенность, что цель будет достигнута',
    format: 'Индивидуально • 1 на 1',
    duration: '8 занятий/мес • 60 минут',
    features: [
      'Ребёнка ведут от А до Б',
      'Еженедельная связь с родителем',
      'Разбор каждой ошибки и пробела',
      'Реакция на любые отклонения',
      'Замена преподавателя без доплат',
      'График под вашу жизнь'
    ],
    result: 'Родитель управляет процессом, результат предсказуем',
    popular: false
  }
];

const reviews = [
  {
    name: 'Анна Петрова',
    text: 'Занимаемся уже 3 месяца по математике. Сын стал увереннее решать задачи, оценки улучшились с тройки до четвёрки с плюсом!',
    grade: '9 класс',
    subject: 'Математика',
    avatar: 'А'
  },
  {
    name: 'Дмитрий Соколов',
    text: 'Отличная подготовка к ЕГЭ по русскому языку. Преподаватель объясняет сложные темы простым языком, всегда на связи.',
    grade: '11 класс',
    subject: 'Русский язык',
    avatar: 'Д'
  },
  {
    name: 'Елена Иванова',
    text: 'Очень довольна подходом — каждые две недели получаю отчёт о прогрессе дочери. Вижу реальные результаты и спокойна!',
    grade: '10 класс',
    subject: 'Химия',
    avatar: 'Е'
  }
];

export default function MainSections() {
  const scrollToForm = () => {
    document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="pt-40 pb-20 px-4 bg-gradient-to-br from-purple-50 via-white to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 animate-fade-in">
            <Badge className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 text-sm font-semibold">
              Онлайн-репетиторы с системным подходом
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold font-montserrat leading-tight">
              Ребёнка ведут,<br />
              процесс понятен,<br />
              родители спокойны
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Репетитор может сказать «всё хорошо», но вы не видите реального прогресса.<br />
              <span className="text-primary font-semibold">В ПЕРФЕКЗ ребёнка не оставляют один на один с предметом — вы видите каждый шаг.</span>
            </p>
            <div className="pt-4">
              <Button 
                onClick={scrollToForm}
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-white font-semibold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all"
              >
                <Icon name="Sparkles" className="mr-2" size={20} />
                Записаться на бесплатное занятие
              </Button>
              <p className="text-sm text-gray-500 mt-3">60 минут • Индивидуально • Определим уровень и план</p>
            </div>
            <div className="flex justify-center gap-12 pt-8">
              <div>
                <div className="text-4xl font-bold text-primary">500+</div>
                <div className="text-gray-600">учеников ведём к результату</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent">98%</div>
                <div className="text-gray-600">родителей знают, что происходит</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white border-b border-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-bold font-montserrat text-gray-900 mb-2">
              По каким предметам готовим
            </h3>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {[
              { name: 'Математика', icon: 'Calculator' },
              { name: 'Русский язык', icon: 'BookOpen' },
              { name: 'Английский', icon: 'Languages' },
              { name: 'Информатика', icon: 'Code' },
              { name: 'Химия', icon: 'FlaskConical' },
              { name: 'Биология', icon: 'Leaf' },
              { name: 'Обществознание', icon: 'Users' }
            ].map((subject, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-5 py-3 hover:border-primary hover:shadow-lg transition-all animate-on-scroll"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={subject.icon} className="text-primary" size={20} />
                </div>
                <span className="font-semibold text-gray-800">{subject.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-5xl font-bold font-montserrat mb-4">
              Почему родители теряют спокойствие
            </h2>
            <p className="text-xl text-gray-600">И как мы возвращаем понимание процесса</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: 'AlertCircle',
                problem: 'Репетитор говорит «всё хорошо»',
                solution: 'Мы показываем конкретные результаты каждые 2 недели — вы видите прогресс'
              },
              {
                icon: 'XCircle',
                problem: 'Ребёнок пропускает занятия',
                solution: 'Мы сразу сообщаем о пропуске — вы реагируете, пока не поздно'
              },
              {
                icon: 'FileQuestion',
                problem: 'Домашние задания не проверяются',
                solution: 'Каждое ДЗ проверяется с разбором ошибок — ребёнок не застревает'
              }
            ].map((item, idx) => (
              <Card key={idx} className="animate-on-scroll border-2 border-gray-200 hover:border-primary transition-all">
                <CardHeader>
                  <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-3">
                    <Icon name={item.icon} className="text-red-500" size={28} />
                  </div>
                  <CardTitle className="text-lg text-gray-800 mb-3">{item.problem}</CardTitle>
                  <div className="flex items-start gap-2 bg-accent/5 p-3 rounded-lg">
                    <Icon name="CheckCircle2" className="text-accent flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-gray-700 font-medium">{item.solution}</p>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="py-20 px-4 bg-gradient-to-br from-purple-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-5xl font-bold font-montserrat mb-4">
              Как проходит обучение
            </h2>
            <p className="text-xl text-gray-600">Вы видите процесс и понимаете, что происходит на каждом этапе</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { 
                icon: 'ClipboardCheck', 
                title: 'Диагностика', 
                text: 'Бесплатное занятие: определяем уровень, объясняем родителю план и показываем, как будем работать'
              },
              { 
                icon: 'BookOpen', 
                title: 'Регулярные занятия', 
                text: 'Преподаватель следует плану, вы можете присутствовать. Если пропуск — сообщаем сразу'
              },
              { 
                icon: 'FileCheck', 
                title: 'Проверка ДЗ', 
                text: 'Каждое задание проверяется с разбором. Если ребёнок не понял — разбираем снова'
              },
              { 
                icon: 'MessageSquare', 
                title: 'Отчёты родителю', 
                text: 'Раз в 2 недели: что изучили, где прогресс, где сложности. Вы понимаете реальную картину'
              },
              { 
                icon: 'TrendingUp', 
                title: 'Реакция на проблемы', 
                text: 'Если что-то не работает — меняем подход, темп или преподавателя. Вы не остаётесь один на один'
              },
              { 
                icon: 'Target', 
                title: 'Движение к цели', 
                text: 'Мы отслеживаем, чтобы ребёнок шёл к результату. Если сбились — корректируем маршрут'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start animate-on-scroll">
                <div className="w-14 h-14 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name={item.icon} className="text-accent" size={26} />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-montserrat mb-2">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              onClick={scrollToForm}
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-white font-semibold text-lg px-8 py-6 shadow-xl"
            >
              <Icon name="Sparkles" className="mr-2" size={20} />
              Записаться на бесплатное занятие
            </Button>
          </div>
        </div>
      </section>

      <section id="tariffs" className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-5xl font-bold font-montserrat mb-4">
              Выберите уровень вовлечённости
            </h2>
            <p className="text-xl text-gray-600">Чем плотнее мы ведём — тем быстрее и стабильнее результат</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {tariffs.map((tariff, idx) => (
              <Card 
                key={idx} 
                className={`animate-on-scroll relative ${
                  tariff.popular 
                    ? 'border-4 border-accent shadow-2xl scale-105' 
                    : 'border-2 border-gray-200'
                } transition-all duration-300 hover:shadow-xl`}
              >
                {tariff.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-white px-6 py-2 text-sm font-bold shadow-lg">
                      ⭐ РЕКОМЕНДУЕМ
                    </Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="text-center mb-4">
                    <div className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">{tariff.name}</div>
                    <div className="text-5xl font-bold text-primary mb-2">
                      {tariff.price} ₽
                      <span className="text-lg text-gray-500 font-normal">/мес</span>
                    </div>
                    <div className="text-accent font-bold text-lg mb-2">{tariff.controlLevel}</div>
                    <div className="text-sm text-gray-600 font-medium">{tariff.audience}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="font-semibold text-gray-800">{tariff.format}</div>
                    <div className="text-sm text-gray-600">{tariff.duration}</div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {tariff.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-2">
                        <Icon name="Check" className="text-accent flex-shrink-0 mt-0.5" size={20} />
                        <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-accent/5 rounded-lg p-3 mt-4">
                    <div className="flex items-center gap-2">
                      <Icon name="TrendingUp" className="text-accent" size={18} />
                      <span className="text-sm font-semibold text-gray-800">{tariff.result}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={scrollToForm}
                    className={`w-full mt-4 font-semibold ${
                      tariff.popular 
                        ? 'bg-accent hover:bg-accent/90 text-white shadow-lg' 
                        : 'bg-white text-primary border-2 border-primary hover:bg-purple-50'
                    }`}
                  >
                    Выбрать тариф
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="text-3xl md:text-5xl font-bold font-montserrat mb-4">
              Что говорят родители
            </h2>
            <p className="text-xl text-gray-600">Реальные отзывы учеников и их родителей</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review, idx) => (
              <Card key={idx} className="animate-on-scroll border-2 border-gray-200 hover:border-primary hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {review.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{review.name}</div>
                      <div className="text-sm text-gray-600">{review.grade} • {review.subject}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} name="Star" className="text-yellow-400 fill-yellow-400" size={16} />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed italic">"{review.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              onClick={scrollToForm}
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-white font-semibold text-lg px-8 py-6 shadow-xl"
            >
              <Icon name="Sparkles" className="mr-2" size={20} />
              Записаться на бесплатное занятие
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}