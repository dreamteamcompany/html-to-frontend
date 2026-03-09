import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function BasicInfo() {
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
          Основные сведения
        </h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-4">Об образовательной организации</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <span className="font-medium text-gray-900">Полное наименование:</span>
                  <span className="text-gray-700">ИП Анохин Александр Дмитриевич</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <span className="font-medium text-gray-900">Сокращенное наименование:</span>
                  <span className="text-gray-700">Отсутствует</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <span className="font-medium text-gray-900">Дата создания:</span>
                  <span className="text-gray-700">26 июля 2024 г.</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <span className="font-medium text-gray-900">Руководитель:</span>
                  <span className="text-gray-700">Анохин Александр Дмитриевич</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <span className="font-medium text-gray-900">Учредители:</span>
                  <span className="text-gray-700">Отсутствуют</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Контактная информация</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <span className="font-medium text-gray-900">Адрес:</span>
                  <span className="text-gray-700">628011, ХМАО-Югра, г. Ханты-Мансийск, ул. Анны Коньковой, 2</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <span className="font-medium text-gray-900">Режим работы:</span>
                  <span className="text-gray-700">Понедельник – Воскресенье с 09:00 до 21:00 без перерыва</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <span className="font-medium text-gray-900">Телефон:</span>
                  <a href="tel:+79821472622" className="text-primary hover:underline">+7 982 147-26-22</a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <span className="font-medium text-gray-900">Email:</span>
                  <a href="mailto:super.armat2014@mail.ru" className="text-primary hover:underline">super.armat2014@mail.ru</a>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <span className="font-medium text-gray-900">Официальный сайт:</span>
                  <a href="https://perfekz.ru" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">perfekz.ru</a>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Лицензия</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <span className="font-medium text-gray-900">Регистрационный номер:</span>
                  <span className="text-gray-700">№ Л035-01304-86/01430877</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2">
                  <span className="font-medium text-gray-900">Дата предоставления:</span>
                  <span className="text-gray-700">10.10.2024</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">Государственная аккредитация</h2>
              <p className="text-gray-700">
                В соответствии с ч. 1 ст. 92 Федерального закона «Об образовании в Российской Федерации» государственная аккредитация дополнительных образовательных программ не предусмотрена.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}