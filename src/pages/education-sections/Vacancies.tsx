import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function Vacancies() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Link to="/education-info" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Icon name="ArrowLeft" size={20} />
            <span className="font-medium">Назад к разделам</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-foreground">
          Вакантные места для приема (перевода) обучающихся
        </h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Реализуемые образовательные программы</h2>
          <p className="text-lg text-gray-700 mb-6">Образовательная программа дополнительного образования индивидуального предпринимателя Анохин А.Д. на 2025 – 2026 учебный год:</p>
          <div className="space-y-4">
            <div className="border-l-4 border-primary pl-4">
              <p className="text-gray-700"><span className="font-semibold">За счет бюджетных ассигнований федерального бюджета</span> (в том числе с выделением численности обучающихся, являющихся иностранными гражданами) – <span className="font-semibold">0</span></p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="text-gray-700"><span className="font-semibold">За счет бюджетов субъектов Российской Федерации</span> (в том числе с выделением численности обучающихся, являющихся иностранными гражданами) – <span className="font-semibold">0</span></p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="text-gray-700"><span className="font-semibold">За счет местных бюджетов</span> (в том числе с выделением численности обучающихся, являющихся иностранными гражданами) – <span className="font-semibold">0</span></p>
            </div>
            <div className="border-l-4 border-primary pl-4">
              <p className="text-gray-700"><span className="font-semibold">По договорам об образовании, заключаемых при приеме на обучении за счет средств физических и (или) юридических лиц</span> (в том числе с выделением численности обучающихся, являющихся иностранными гражданами) – <span className="font-semibold">0</span></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}