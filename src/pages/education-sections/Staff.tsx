import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function Staff() {
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
          Педагогический состав
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600">Содержимое раздела будет добавлено позже.</p>
        </div>
      </main>
    </div>
  );
}
