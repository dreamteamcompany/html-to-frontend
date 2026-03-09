import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function Finance() {
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
          Финансово хозяйственная деятельность
        </h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Объем образовательной деятельности</h2>
          <p className="text-lg text-gray-700 mb-6">Финансирование организации осуществляется Индивидуальным Предпринимателем.</p>
          <h3 className="text-xl font-semibold mb-4 text-foreground">Источники формирования финансовых ресурсов организации:</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold text-xl">•</span>
              <span className="text-gray-700">частные средства;</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-primary font-bold text-xl">•</span>
              <span className="text-gray-700">плата родителей (законных представителей) за услуги школы.</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}