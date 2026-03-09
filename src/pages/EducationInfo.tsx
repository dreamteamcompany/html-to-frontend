import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const sections = [
  { title: 'Основные сведения', path: '/education-info/basic' },
  { title: 'Структура и органы управления образовательной деятельностью', path: '/education-info/structure' },
  { title: 'Документы', path: '/education-info/documents' },
  { title: 'Образование', path: '/education-info/education' },
  { title: 'Руководство', path: '/education-info/management' },
  { title: 'Педагогический состав', path: '/education-info/staff' },
  { title: 'Материально-техническое обеспечение и оснащенность образовательного процесса. Доступная среда.', path: '/education-info/facilities' },
  { title: 'Платные образовательные услуги', path: '/education-info/paid-services' },
  { title: 'Финансово хозяйственная деятельность', path: '/education-info/finance' },
  { title: 'Вакантные места для приема (перевода) обучающихся', path: '/education-info/vacancies' },
  { title: 'Стипендии и меры поддержки обучающихся', path: '/education-info/scholarships' },
  { title: 'Международное сотрудничество', path: '/education-info/international' },
  { title: 'Организация питания в образовательной организации', path: '/education-info/nutrition' }
];

export default function EducationInfo() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <Icon name="ArrowLeft" size={20} />
            <span className="font-medium">Вернуться на главную</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          Сведения об образовательной организации
        </h1>
        <p className="text-gray-600 mb-8">
          ИП Анохин А.Д
        </p>

        <div className="grid gap-4">
          {sections.map((section, index) => (
            <Link
              key={index}
              to={section.path}
              className="group bg-white border border-gray-200 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  {section.title}
                </h2>
                <Icon name="ChevronRight" size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
