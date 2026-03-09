import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function PaidServices() {
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
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          Платные образовательные услуги
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/service/1) ПОЛОЖЕНИЕ ОБ ОКАЗАНИИ ПЛАТНЫХ ОБРАЗОВАТЕЛЬНЫХ УСЛУГ_signed.pdf">
              Положение об оказании платных образовательных услуг
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/service/2) Информация о ценах_signed.pdf">
              Информация о ценах
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/service/3) Приказ Об установлении стоимости обучения по образовательным программам дополнительного образования_signed.pdf">
              Приказ об установлении стоимости обучения по образовательным
              программам дополнительного образования
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/service/4) ДОГОВОР НА ОКАЗАНИЕ ПЛАТНЫХ УСЛУГ_signed.pdf">
              Договор на оказание платных образовательных услуг
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/service/ОФЕРТА ИП Анохин Александр Дмитриевич_ ИНН 860409985318.pdf">
              Оферта о заключении договора возмездного оказания образовательных
              услуг
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
