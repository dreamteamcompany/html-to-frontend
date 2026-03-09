import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface AccessibleProps {
  onToggle: () => void;
}

const subjects = [
  { name: "Математика", icon: "Calculator" },
  { name: "Русский язык", icon: "BookOpen" },
  { name: "Английский язык", icon: "Languages" },
  { name: "Информатика", icon: "Code" },
  { name: "Химия", icon: "FlaskConical" },
  { name: "Биология", icon: "Leaf" },
  { name: "Обществознание", icon: "Users" },
];

export default function Accessible({ onToggle }: AccessibleProps) {
  const scrollToForm = () => {
    document
      .getElementById("accessible-contacts")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Верхняя панель */}
      <div className="bg-yellow-400 text-black py-3 px-4 border-b-4 border-black">
        <div className="container mx-auto flex justify-between items-center">
          <span className="text-2xl font-bold">
            ПЕРФЕКЗ - Версия для слабовидящих
          </span>
          <Button
            onClick={onToggle}
            className="bg-black text-yellow-400 hover:bg-gray-900 font-bold border-2 border-yellow-400"
          >
            <Icon name="Eye" className="mr-2" size={20} />
            Обычная версия
          </Button>
        </div>
      </div>

      {/* Главный контент */}
      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Заголовок */}
        <section className="mb-16 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Онлайн-репетиторство с полным контролем процесса
          </h1>
          <p className="text-3xl mb-8 leading-relaxed">
            Родители видят каждый шаг: как идут занятия, что задали, как ребёнок
            справляется
          </p>
          <Button
            onClick={scrollToForm}
            className="bg-yellow-400 text-black hover:bg-yellow-500 text-2xl font-bold py-8 px-12"
          >
            <Icon name="Sparkles" className="mr-3" size={28} />
            Записаться на бесплатное занятие
          </Button>
        </section>

        {/* Статистика */}
        <section className="mb-16 border-4 border-yellow-400 p-8">
          <h2 className="text-4xl font-bold mb-8 text-yellow-400">
            Наши результаты
          </h2>
          <div className="space-y-6">
            <div className="border-b-2 border-gray-700 pb-4">
              <div className="text-5xl font-bold text-yellow-400 mb-2">
                2,000+
              </div>
              <div className="text-2xl">учеников ведём к результату</div>
            </div>
            <div className="border-b-2 border-gray-700 pb-4">
              <div className="text-5xl font-bold text-yellow-400 mb-2">
                500+
              </div>
              <div className="text-2xl">репетиторов с проверенным опытом</div>
            </div>
            <div className="border-b-2 border-gray-700 pb-4">
              <div className="text-5xl font-bold text-yellow-400 mb-2">95%</div>
              <div className="text-2xl">родителей знают, что происходит</div>
            </div>
          </div>
        </section>

        {/* Предметы */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-yellow-400">
            Предметы для подготовки
          </h2>
          <div className="space-y-4">
            {subjects.map((subject, idx) => (
              <div
                key={idx}
                className="bg-gray-900 border-2 border-yellow-400 p-6 flex items-center gap-4"
              >
                <Icon
                  name={subject.icon}
                  size={40}
                  className="text-yellow-400"
                />
                <span className="text-3xl font-semibold">{subject.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Как работаем */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-yellow-400">
            Как работает контроль
          </h2>
          <div className="space-y-6">
            <div className="bg-gray-900 border-l-8 border-yellow-400 p-6">
              <h3 className="text-3xl font-bold mb-4">
                1. Индивидуальный план обучения
              </h3>
              <p className="text-2xl leading-relaxed">
                Вы видите весь путь от текущего уровня до цели: темы, сроки,
                промежуточные результаты
              </p>
            </div>
            <div className="bg-gray-900 border-l-8 border-yellow-400 p-6">
              <h3 className="text-3xl font-bold mb-4">
                2. Отчёт после каждого занятия
              </h3>
              <p className="text-2xl leading-relaxed">
                Репетитор присылает краткую сводку: что прошли, как справился,
                что задано на дом
              </p>
            </div>
            <div className="bg-gray-900 border-l-8 border-yellow-400 p-6">
              <h3 className="text-3xl font-bold mb-4">
                3. Еженедельная аналитика
              </h3>
              <p className="text-2xl leading-relaxed">
                Графики прогресса показывают реальную динамику: где растём, где
                нужна помощь
              </p>
            </div>
            <div className="bg-gray-900 border-l-8 border-yellow-400 p-6">
              <h3 className="text-3xl font-bold mb-4">
                4. Связь с куратором 24/7
              </h3>
              <p className="text-2xl leading-relaxed">
                Если заметили отклонение — пишете куратору, он корректирует
                программу
              </p>
            </div>
          </div>
        </section>

        {/* Тарифы */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold mb-8 text-yellow-400">Тарифы</h2>
          <div className="space-y-6">
            <div className="bg-gray-900 border-4 border-white p-8">
              <h3 className="text-3xl font-bold mb-4">БАЗОВЫЙ</h3>
              <p className="text-2xl mb-4">Ребёнок работает сам, нужна база</p>
              <div className="text-4xl font-bold mb-6 text-yellow-400">
                5 400₽/мес
              </div>
              <p className="text-xl mb-4">
                Группа до 10 человек • 4 занятия/мес • 60 минут
              </p>
              <ul className="space-y-3 text-xl">
                <li>• Определим уровень и составим план</li>
                <li>• Занятия по чёткому расписанию</li>
                <li>• Проверка знаний раз в месяц</li>
                <li>• Доступ к материалам курса</li>
              </ul>
              <p className="text-lg mt-6 border-t-2 border-gray-700 pt-4">
                Подходит для дисциплинированных учеников
              </p>
            </div>

            <div className="bg-yellow-400 text-black border-4 border-yellow-400 p-8">
              <h3 className="text-3xl font-bold mb-4">СТАНДАРТ (ПОПУЛЯРНЫЙ)</h3>
              <p className="text-2xl mb-4">
                Хотите видеть процесс и влиять на него
              </p>
              <div className="text-4xl font-bold mb-6">6 900₽/мес</div>
              <p className="text-xl mb-4 font-semibold">
                Мини-группа 3–5 человек • 8 занятий/мес • 60 минут
              </p>
              <ul className="space-y-3 text-xl font-semibold">
                <li>• Вы понимаете, как идёт обучение</li>
                <li>• Отчёт каждые 2 недели с конкретикой</li>
                <li>• Узнаёте о пропусках сразу</li>
                <li>• Каждое ДЗ проверяется с разбором</li>
                <li>• Видите реальный прогресс ежемесячно</li>
              </ul>
              <p className="text-lg mt-6 border-t-2 border-black pt-4 font-bold">
                Родитель спокоен, ребёнок под присмотром
              </p>
            </div>

            <div className="bg-gray-900 border-4 border-yellow-400 p-8">
              <h3 className="text-3xl font-bold mb-4">ПРЕМИУМ</h3>
              <p className="text-2xl mb-4">
                Нужна уверенность, что цель будет достигнута
              </p>
              <div className="text-4xl font-bold mb-6 text-yellow-400">
                9 900₽/мес
              </div>
              <p className="text-xl mb-4">
                Индивидуально • 1 на 1 • 8 занятий/мес • 60 минут
              </p>
              <ul className="space-y-3 text-xl">
                <li>• Ребёнка ведут от А до Б</li>
                <li>• Еженедельная связь с родителем</li>
                <li>• Разбор каждой ошибки и пробела</li>
                <li>• Реакция на любые отклонения</li>
                <li>• Замена преподавателя без доплат</li>
                <li>• График под вашу жизнь</li>
              </ul>
              <p className="text-lg mt-6 border-t-2 border-gray-700 pt-4">
                Родитель управляет процессом, результат предсказуем
              </p>
            </div>
          </div>
        </section>

        {/* Форма записи */}
        <section
          id="accessible-contacts"
          className="mb-16 border-4 border-yellow-400 p-8 bg-gray-900"
        >
          <h2 className="text-4xl font-bold mb-8 text-yellow-400">
            Записаться на бесплатное занятие
          </h2>
          <p className="text-2xl mb-8">
            Оставьте заявку — мы свяжемся в течение 30 минут
          </p>
          <div className="space-y-6">
            <div>
              <label className="text-2xl font-bold mb-2 block">Ваше имя</label>
              <input
                type="text"
                placeholder="Иван Иванов"
                className="w-full p-4 text-2xl bg-black border-2 border-yellow-400 text-white"
              />
            </div>
            <div>
              <label className="text-2xl font-bold mb-2 block">Телефон</label>
              <input
                type="tel"
                placeholder="+7 (999) 123-45-67"
                className="w-full p-4 text-2xl bg-black border-2 border-yellow-400 text-white"
              />
            </div>
            <div>
              <label className="text-2xl font-bold mb-2 block">Предмет</label>
              <select className="w-full p-4 text-2xl bg-black border-2 border-yellow-400 text-white">
                <option>Выберите предмет</option>
                {subjects.map((s, i) => (
                  <option key={i}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-start gap-3">
              <input type="checkbox" className="w-6 h-6 mt-1" />
              <label className="text-xl">
                Я соглашаюсь на{" "}
                <a
                  href="http://perfekz.ru/docs/docs/8) СОГЛАСИЕ_НА_ОБРАБОТКУ_signed.pdf"
                  target="_blank"
                  className="text-yellow-400 underline font-bold"
                >
                  обработку персональных данных
                </a>{" "}
                и принимаю условия{" "}
                <a
                  href="http://perfekz.ru/docs/docs/7) ПОЛОЖЕНИЕ_ЗАЩИТА_ПЕРС_ДАННЫХ_signed.pdf"
                  target="_blank"
                  className="text-yellow-400 underline font-bold"
                >
                  политики конфиденциальности
                </a>
              </label>
            </div>
            <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-500 text-2xl font-bold py-8">
              <Icon name="Sparkles" className="mr-3" size={24} />
              Записаться на бесплатное занятие
            </Button>
          </div>
        </section>

        {/* Контакты */}
        <section className="text-center border-t-4 border-yellow-400 pt-12">
          <h2 className="text-4xl font-bold mb-6 text-yellow-400">Контакты</h2>
          <div className="space-y-4 text-2xl">
            <p>Телефон: +7 (999) 123-45-67</p>
            <p>Email: info@perfekz.ru</p>
            <p>ИНН: 860409985318</p>
          </div>
        </section>
      </main>
    </div>
  );
}
