import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

export default function Facilities() {
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
          Материально-техническое обеспечение и оснащенность образовательного процесса. Доступная среда.
        </h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            <div className="border-l-4 border-primary pl-6">
              <p className="text-lg text-gray-700">
                Реализация образовательных программ осуществляется исключительно с применением электронного обучения и дистанционных образовательных технологий.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <p className="text-lg text-gray-700">
                В образовательном процессе используются персональные компьютеры, средства аудио- и видеосвязи, программное обеспечение и информационно-телекоммуникационная сеть «Интернет».
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <p className="text-lg text-gray-700">
                Образовательный процесс реализуется с использованием электронных образовательных ресурсов и сервисов видеоконференцсвязи, обеспечивающих взаимодействие обучающихся и педагогических работников, передачу учебных материалов и фиксацию результатов обучения.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <p className="text-lg text-gray-700">
                Учебные помещения для проведения очных занятий не используются.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <p className="text-lg text-gray-700">
                Обучающиеся не находятся на территории образовательной организации. Организация питания обучающихся не осуществляется.
              </p>
            </div>

            <div className="border-l-4 border-primary pl-6">
              <p className="text-lg text-gray-700">
                Обучение инвалидов и лиц с ограниченными возможностями здоровья осуществляется в дистанционном формате. Специальные условия и адаптированные образовательные программы не предусмотрены.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}