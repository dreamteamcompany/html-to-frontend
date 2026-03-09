import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function Education() {
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
        <h1 className="text-4xl font-bold mb-8 text-foreground">Образование</h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/1) Информация о реализуемых образовательных программах_signed.pdf">
              Информация о реализуемых образовательных программах в 2025-2026
              гг.
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/2) Положение о языке, на котором осуществляется образование (обучение) _signed.pdf">
              Положение о языке, на котором осуществляется образование
              (обучение)
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/Программа ЕГЭ Английский_signed.pdf">
              Образовательная программа дополнительного образования по
              подготовке к ЕГЭ по английскому языку (11 класс)
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/Программа ЕГЭ биология_signed.pdf">
              Образовательная программа дополнительного образования по
              подготовке к ЕГЭ по биологии (11 класс)
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/Программа ЕГЭ информатика_signed.pdf">
              Образовательная программа дополнительного образования по
              подготовке к ЕГЭ по информатике (11 класс)
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/Программа ЕГЭ история_signed.pdf">
              Образовательная программа дополнительного образования по
              подготовке к ЕГЭ по истории (11 класс)
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/Программа ЕГЭ обществознание_signed.pdf">
              Образовательная программа дополнительного образования по
              подготовке к ЕГЭ по обществознанию (11 класс)
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/Программа ЕГЭ химия_signed.pdf">
              Образовательная программа дополнительного образования по
              подготовке к ЕГЭ по химии (11 класс)
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/Программа ОГЭ английский_signed.pdf">
              Образовательная программа дополнительного образования по
              подготовке к ОГЭ по английскому языку (9 класс)
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/Программа ОГЭ биология_signed.pdf">
              Образовательная программа дополнительного образования по
              подготовке к ОГЭ по биологии (9 класс)
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/Программа ОГЭ информатика_signed.pdf">
              Образовательная программа дополнительного образования по
              подготовке к ОГЭ по информатике (9 класс)
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/Программа ОГЭ история_signed.pdf">
              Образовательная программа дополнительного образования по
              подготовке к ОГЭ по истории (9 класс)
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/Программа ОГЭ Обществознание_signed.pdf">
              Образовательная программа дополнительного образования по
              подготовке к ОГЭ по обществознанию (9 класс)
            </a>
          </p>
          <p className="text-gray-600">
            <a href="http://perfekz.ru/docs/ed/Программа ОГЭ химия_signed.pdf">
              Образовательная программа дополнительного образования по
              подготовке к ОГЭ по химии (9 класс)
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
