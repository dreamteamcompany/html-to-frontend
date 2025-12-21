import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import PaymentsHeader from '@/components/payments/PaymentsHeader';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DashboardCard {
  id: string;
  title: string;
  type: 'stat' | 'chart';
}

const defaultCards: DashboardCard[] = [
  { id: 'total-expenses', title: 'Общие IT Расходы', type: 'stat' },
  { id: 'server-infrastructure', title: 'Серверная Инфраструктура', type: 'stat' },
  { id: 'communication-services', title: 'Коммуникационные Сервисы', type: 'stat' },
  { id: 'total-payments', title: 'Всего Платежей', type: 'stat' },
  { id: 'attention-required', title: 'Требуют внимания', type: 'stat' },
  { id: 'annual-savings', title: 'Годовая Экономия', type: 'stat' },
  { id: 'monthly-dynamics', title: 'Динамика Расходов по Месяцам', type: 'chart' },
  { id: 'category-expenses', title: 'IT Расходы по Категориям', type: 'chart' },
  { id: 'contractor-comparison', title: 'Сравнение по Контрагентам', type: 'chart' },
  { id: 'expense-structure', title: 'Структура Расходов', type: 'chart' },
  { id: 'legal-entity-comparison', title: 'Сравнение по Юридическим Лицам', type: 'chart' },
  { id: 'department-comparison', title: 'Сравнение Затрат по Отделам-Заказчикам', type: 'chart' },
];

function SortableCard({ card }: { card: DashboardCard }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-move"
    >
      <div
        style={{
          background: '#111c44',
          border: '1px solid rgba(117, 81, 233, 0.4)',
          boxShadow: '0 0 20px rgba(117, 81, 233, 0.15)',
          borderRadius: '16px',
          padding: '20px',
          minHeight: card.type === 'chart' ? '200px' : '150px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <Icon name="GripVertical" size={20} style={{ color: '#a3aed0' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', flex: 1 }}>
            {card.title}
          </h3>
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: card.type === 'stat' ? 'rgba(117, 81, 233, 0.1)' : 'rgba(1, 181, 116, 0.1)',
              color: card.type === 'stat' ? '#7551e9' : '#01b574',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            {card.type === 'stat' ? 'Статистика' : 'График'}
          </div>
        </div>
        <div style={{ color: '#a3aed0', fontSize: '14px' }}>
          Перетащите для изменения позиции
        </div>
      </div>
    </div>
  );
}

const DashboardEditor = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [cards, setCards] = useState<DashboardCard[]>(defaultCards);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const savedLayout = localStorage.getItem('dashboard2-layout');
    if (savedLayout) {
      try {
        const parsed = JSON.parse(savedLayout);
        setCards(parsed);
      } catch (e) {
        console.error('Failed to parse saved layout:', e);
      }
    }
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setCards((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSave = () => {
    localStorage.setItem('dashboard2-layout', JSON.stringify(cards));
    alert('Расположение карточек сохранено!');
    navigate('/dashboard2');
  };

  const handleReset = () => {
    if (confirm('Вы уверены, что хотите сбросить расположение карточек?')) {
      setCards(defaultCards);
      localStorage.removeItem('dashboard2-layout');
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      setMenuOpen(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #0f1535 0%, #1b254b 100%)' }}>
      <PaymentsSidebar
        menuOpen={menuOpen}
        dictionariesOpen={dictionariesOpen}
        setDictionariesOpen={setDictionariesOpen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />

      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="lg:ml-[250px] p-4 md:p-6 lg:p-[30px] min-h-screen flex-1">
        <PaymentsHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
                Редактор Дашборда
              </h1>
              <p style={{ color: '#a3aed0', fontSize: '14px' }}>
                Перетаскивайте карточки для изменения их расположения на дашборде
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                variant="outline"
                onClick={handleReset}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Icon name="RotateCcw" size={16} />
                Сбросить
              </Button>
              <Button
                onClick={handleSave}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Icon name="Save" size={16} />
                Сохранить
              </Button>
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={cards.map(c => c.id)} strategy={rectSortingStrategy}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
                  gap: '24px',
                }}
              >
                {cards.map((card) => (
                  <SortableCard key={card.id} card={card} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </main>
    </div>
  );
};

export default DashboardEditor;