import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function Management() {
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
          Руководство
        </h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold mb-6 text-foreground">Руководитель образовательной организации</h2>
          <div className="space-y-6">
            <div>
              <p className="text-xl font-semibold text-foreground mb-4">Анохин Александр Дмитриевич</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Icon name="Phone" size={20} className="text-primary" />
                  <a href="tel:+79821472622" className="text-lg text-gray-700 hover:text-primary transition-colors">
                    +7 (982) 147-26-22
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Icon name="Mail" size={20} className="text-primary" />
                  <a href="mailto:super.armat2014@yandex.ru" className="text-lg text-gray-700 hover:text-primary transition-colors">
                    super.armat2014@yandex.ru
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}