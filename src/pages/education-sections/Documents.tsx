import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function Documents() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Link
            to="/education-info"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            <Icon name="ArrowLeft" size={20} />
            <span className="font-medium">Назад к разделам</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-foreground">Документы</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/docs/1) Сведение об ИП.pdf">
              Выписка из Единого государственного реестра индивидуальных
              предпринимателей
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/docs/2) ПРАВИЛА ВНУТРЕННЕГО РАСПОРЯДКА ОБУЧАЮЩИХСЯ PERFEKZ_signed.pdf">
              Правила внутреннего распорядка обучающихся ПЕРФЕКЗ
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/docs/3) Правила приёма_signed.pdf">
              Правила приема обучающихся
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/docs/4) ВОЗНИКНОВЕНИЕ_ПРЕКРАЩЕНИЕ_ОТНОШЕНИЙ_signed.pdf">
              Порядок возникновения, приостановления и прекращения отношений
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/docs/5) Положение обоказанииплатных образовательных услуг_signed.pdf">
              Положение об оказании платных образовательных услуг
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/docs/6) Положение о режиме занятий_signed.pdf">
              Положение о режиме занятий обучающихся
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/docs/9) ПРАВИЛА ВНУТРЕННЕГО ТРУДОВОГО РАСПОРЯДКА_signed.pdf">
              Правила внутреннего трудового распорядка
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/docs/10) Положение об аттестации (pdf)_signed.pdf">
              Положение о формах, периодичности и порядке текущего контроля
              успеваемости, промежуточной аттестации обучающихся
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/docs/11) Пололжение о порядке и основаниях для перевода, отчисления_signed.pdf">
              Положение о порядке и основаниях для перевода, отчисления
              воспитанников
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/docs/ОФЕРТА ИП Анохин Александр Дмитриевич_ ИНН 860409985318.pdf">
              Оферта о заключении договора возмездного оказания образовательных
              услуг
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
