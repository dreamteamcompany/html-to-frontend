import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

export default function Navigation() {
  const scrollToForm = () => {
    document.getElementById('contacts')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-10 w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">П</span>
          </div>
          <span className="text-2xl font-bold font-montserrat bg-gradient-to-r from-primary to-purple-700 bg-clip-text text-transparent">
            ПЕРФЕКЗ
          </span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <a href="#how" className="text-gray-600 hover:text-primary transition-colors font-medium">Как работаем</a>
          <a href="#tariffs" className="text-gray-600 hover:text-primary transition-colors font-medium">Тарифы</a>
          <a href="#reviews" className="text-gray-600 hover:text-primary transition-colors font-medium">Отзывы</a>
        </div>
        <Button 
          onClick={scrollToForm}
          className="bg-accent hover:bg-accent/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          <Icon name="Sparkles" className="mr-2" size={18} />
          Записаться на бесплатное занятие
        </Button>
      </div>
    </nav>
  );
}