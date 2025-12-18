import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

interface CardLayout {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface DashboardCard {
  id: string;
  title: string;
  component: React.ReactNode;
}

interface DragState {
  isDragging: boolean;
  cardId: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

interface ResizeState {
  isResizing: boolean;
  cardId: string;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  handle: string;
}

const Dashboard2EditableLayout = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layouts, setLayouts] = useState<CardLayout[]>([]);
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    cardId: '',
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  });
  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    cardId: '',
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    handle: '',
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const defaultLayouts: CardLayout[] = [
    { id: 'total-expenses', x: 0, y: 0, width: 350, height: 200 },
    { id: 'server-infrastructure', x: 370, y: 0, width: 350, height: 200 },
    { id: 'communication-services', x: 740, y: 0, width: 350, height: 200 },
    { id: 'total-payments', x: 0, y: 220, width: 350, height: 200 },
    { id: 'attention-required', x: 370, y: 220, width: 720, height: 420 },
  ];

  const cards: DashboardCard[] = [
    {
      id: 'total-expenses',
      title: 'Общие IT Расходы',
      component: (
        <CardContent className="p-6 h-full">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Общие IT Расходы</div>
              <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>Все время</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(117, 81, 233, 0.1)', color: '#7551e9', border: '1px solid rgba(117, 81, 233, 0.2)' }}>
              <Icon name="Server" size={20} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>184,200 ₽</div>
          <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>Общая сумма расходов</div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: '#e31a1a' }}>
            <Icon name="ArrowUp" size={14} /> +12.5% с прошлого месяца
          </div>
        </CardContent>
      ),
    },
    {
      id: 'server-infrastructure',
      title: 'Серверная Инфраструктура',
      component: (
        <CardContent className="p-6 h-full">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Серверная Инфраструктура</div>
              <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>Расходы на серверы</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(1, 181, 116, 0.1)', color: '#01b574', border: '1px solid rgba(1, 181, 116, 0.2)' }}>
              <Icon name="Database" size={20} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>98,500 ₽</div>
          <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>53.4% от общего бюджета</div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: '#e31a1a' }}>
            <Icon name="ArrowUp" size={14} /> +8.2% с прошлого месяца
          </div>
        </CardContent>
      ),
    },
    {
      id: 'communication-services',
      title: 'Коммуникационные Сервисы',
      component: (
        <CardContent className="p-6 h-full">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Коммуникационные Сервисы</div>
              <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>Телефония и мессенджеры</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(57, 101, 255, 0.1)', color: '#3965ff', border: '1px solid rgba(57, 101, 255, 0.2)' }}>
              <Icon name="MessageCircle" size={20} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>45,300 ₽</div>
          <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>24.6% от общего бюджета</div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: '#a3aed0' }}>
            <Icon name="Minus" size={14} /> Без изменений
          </div>
        </CardContent>
      ),
    },
    {
      id: 'total-payments',
      title: 'Всего Платежей',
      component: (
        <CardContent className="p-6 h-full">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Всего Платежей</div>
              <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>История операций</div>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 181, 71, 0.1)', color: '#ffb547', border: '1px solid rgba(255, 181, 71, 0.2)' }}>
              <Icon name="Box" size={20} />
            </div>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>23</div>
          <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>платежей за все время</div>
          <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: '#e31a1a' }}>
            <Icon name="ArrowUp" size={14} /> +3 за месяц
          </div>
        </CardContent>
      ),
    },
    {
      id: 'attention-required',
      title: 'Требуют внимания',
      component: (
        <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '150%',
            height: '150%',
            background: 'radial-gradient(circle, rgba(255, 107, 107, 0.08) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <CardContent className="p-6" style={{ position: 'relative', zIndex: 1, height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                padding: '12px',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
                animation: 'pulse 2s infinite'
              }}>
                <Icon name="AlertTriangle" size={24} style={{ color: '#fff' }} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Требуют внимания</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { icon: 'Clock3', text: 'Просрочено 4 платежа', color: '#ff6b6b', urgent: true },
                { icon: 'XCircle', text: '2 отклоненных запроса', color: '#ffb547', urgent: false },
                { icon: 'AlertCircle', text: 'Лимит приближается к 80%', color: '#ff6b6b', urgent: true },
                { icon: 'FileWarning', text: '3 документа без подписи', color: '#ffb547', urgent: false }
              ].map((alert, idx) => (
                <div key={idx} style={{ 
                  background: alert.urgent ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 181, 71, 0.1)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${alert.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}>
                  <Icon name={alert.icon} size={20} style={{ color: alert.color, flexShrink: 0 }} />
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{alert.text}</span>
                </div>
              ))}
            </div>
            <div style={{ 
              marginTop: '20px',
              padding: '16px',
              background: 'rgba(117, 81, 233, 0.1)',
              borderRadius: '12px',
              border: '1px solid rgba(117, 81, 233, 0.2)',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ color: '#7551e9', fontSize: '14px', fontWeight: '600' }}>
                Посмотреть все уведомления
              </span>
            </div>
          </CardContent>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const loadLayouts = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/5977014b-b187-49a2-8bf6-4ffb51e2aaeb', {
          method: 'GET',
          headers: {
            'X-User-Id': 'admin',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.layouts && data.layouts.length > 0) {
            const loadedLayouts = data.layouts.map((l: any) => ({
              id: l.card_id,
              x: l.x,
              y: l.y,
              width: l.width,
              height: l.height,
            }));
            setLayouts(loadedLayouts);
          } else {
            setLayouts(defaultLayouts);
          }
        } else {
          setLayouts(defaultLayouts);
        }
      } catch (error) {
        console.error('Failed to load layouts:', error);
        setLayouts(defaultLayouts);
      }
    };
    
    loadLayouts();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragState.isDragging) {
        const deltaX = e.clientX - dragState.startX;
        const deltaY = e.clientY - dragState.startY;
        
        setLayouts(prev => prev.map(l => 
          l.id === dragState.cardId 
            ? { ...l, x: Math.max(0, dragState.offsetX + deltaX), y: Math.max(0, dragState.offsetY + deltaY) }
            : l
        ));
      }
      
      if (resizeState.isResizing) {
        const deltaX = e.clientX - resizeState.startX;
        const deltaY = e.clientY - resizeState.startY;
        
        setLayouts(prev => prev.map(l => {
          if (l.id !== resizeState.cardId) return l;
          
          const newLayout = { ...l };
          
          if (resizeState.handle.includes('right')) {
            newLayout.width = Math.max(280, resizeState.startWidth + deltaX);
          }
          if (resizeState.handle.includes('left')) {
            const newWidth = Math.max(280, resizeState.startWidth - deltaX);
            const widthDiff = resizeState.startWidth - newWidth;
            newLayout.width = newWidth;
            newLayout.x = l.x + widthDiff;
          }
          if (resizeState.handle.includes('bottom')) {
            newLayout.height = Math.max(150, resizeState.startHeight + deltaY);
          }
          if (resizeState.handle.includes('top')) {
            const newHeight = Math.max(150, resizeState.startHeight - deltaY);
            const heightDiff = resizeState.startHeight - newHeight;
            newLayout.height = newHeight;
            newLayout.y = l.y + heightDiff;
          }
          
          return newLayout;
        }));
      }
    };

    const handleMouseUp = () => {
      setDragState(prev => ({ ...prev, isDragging: false }));
      setResizeState(prev => ({ ...prev, isResizing: false }));
    };

    if (dragState.isDragging || resizeState.isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, resizeState]);

  const handleSave = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/5977014b-b187-49a2-8bf6-4ffb51e2aaeb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': 'admin',
        },
        body: JSON.stringify({ layouts }),
      });
      
      if (response.ok) {
        setIsEditMode(false);
        alert('Расположение сохранено!');
      } else {
        alert('Ошибка при сохранении');
      }
    } catch (error) {
      console.error('Failed to save layouts:', error);
      alert('Ошибка при сохранении');
    }
  };

  const handleReset = async () => {
    if (confirm('Сбросить расположение к исходному?')) {
      setLayouts(defaultLayouts);
      try {
        await fetch('https://functions.poehali.dev/5977014b-b187-49a2-8bf6-4ffb51e2aaeb', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': 'admin',
          },
          body: JSON.stringify({ layouts: defaultLayouts }),
        });
      } catch (error) {
        console.error('Failed to reset layouts:', error);
      }
    }
  };

  const handleDragStart = (e: React.MouseEvent, cardId: string) => {
    if (!isEditMode) return;
    
    const layout = layouts.find(l => l.id === cardId);
    if (!layout) return;
    
    setDragState({
      isDragging: true,
      cardId,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: layout.x,
      offsetY: layout.y,
    });
  };

  const handleResizeStart = (e: React.MouseEvent, cardId: string, handle: string) => {
    if (!isEditMode) return;
    e.stopPropagation();
    
    const layout = layouts.find(l => l.id === cardId);
    if (!layout) return;
    
    setResizeState({
      isResizing: true,
      cardId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth: layout.width,
      startHeight: layout.height,
      handle,
    });
  };

  const getCardStyle = (id: string) => {
    const baseStyle = {
      background: '#111c44',
      boxShadow: '0 0 30px rgba(117, 81, 233, 0.2), inset 0 0 15px rgba(117, 81, 233, 0.05)',
      borderRadius: '16px',
      overflow: 'hidden',
      height: '100%',
    };

    switch (id) {
      case 'total-expenses':
        return { ...baseStyle, border: '1px solid rgba(117, 81, 233, 0.4)', borderTop: '4px solid #7551e9' };
      case 'server-infrastructure':
        return { ...baseStyle, border: '1px solid rgba(1, 181, 116, 0.4)', borderTop: '4px solid #01b574' };
      case 'communication-services':
        return { ...baseStyle, border: '1px solid rgba(57, 101, 255, 0.4)', borderTop: '4px solid #3965ff' };
      case 'total-payments':
        return { ...baseStyle, border: '1px solid rgba(255, 181, 71, 0.4)', borderTop: '4px solid #ffb547' };
      case 'attention-required':
        return { 
          background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          boxShadow: '0 0 30px rgba(255, 107, 107, 0.15), inset 0 0 20px rgba(255, 107, 107, 0.05)',
          borderRadius: '16px',
          overflow: 'hidden',
          height: '100%',
        };
      default:
        return baseStyle;
    }
  };

  const renderResizeHandles = (cardId: string) => {
    if (!isEditMode) return null;
    
    const handleStyle = {
      position: 'absolute' as const,
      background: '#7551e9',
      zIndex: 10,
    };
    
    return (
      <>
        <div style={{ ...handleStyle, top: 0, left: 0, width: '10px', height: '10px', cursor: 'nwse-resize' }} 
             onMouseDown={(e) => handleResizeStart(e, cardId, 'top-left')} />
        <div style={{ ...handleStyle, top: 0, right: 0, width: '10px', height: '10px', cursor: 'nesw-resize' }} 
             onMouseDown={(e) => handleResizeStart(e, cardId, 'top-right')} />
        <div style={{ ...handleStyle, bottom: 0, left: 0, width: '10px', height: '10px', cursor: 'nesw-resize' }} 
             onMouseDown={(e) => handleResizeStart(e, cardId, 'bottom-left')} />
        <div style={{ ...handleStyle, bottom: 0, right: 0, width: '10px', height: '10px', cursor: 'nwse-resize' }} 
             onMouseDown={(e) => handleResizeStart(e, cardId, 'bottom-right')} />
        <div style={{ ...handleStyle, top: 0, left: '50%', transform: 'translateX(-50%)', width: '40px', height: '6px', cursor: 'ns-resize' }} 
             onMouseDown={(e) => handleResizeStart(e, cardId, 'top')} />
        <div style={{ ...handleStyle, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '40px', height: '6px', cursor: 'ns-resize' }} 
             onMouseDown={(e) => handleResizeStart(e, cardId, 'bottom')} />
        <div style={{ ...handleStyle, left: 0, top: '50%', transform: 'translateY(-50%)', width: '6px', height: '40px', cursor: 'ew-resize' }} 
             onMouseDown={(e) => handleResizeStart(e, cardId, 'left')} />
        <div style={{ ...handleStyle, right: 0, top: '50%', transform: 'translateY(-50%)', width: '6px', height: '40px', cursor: 'ew-resize' }} 
             onMouseDown={(e) => handleResizeStart(e, cardId, 'right')} />
      </>
    );
  };

  return (
    <div style={{ marginBottom: '30px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        padding: '16px',
        background: isEditMode ? 'rgba(117, 81, 233, 0.1)' : 'transparent',
        borderRadius: '12px',
        border: isEditMode ? '2px solid rgba(117, 81, 233, 0.3)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div>
          {isEditMode && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icon name="Edit" size={20} style={{ color: '#7551e9' }} />
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                Режим редактирования активен
              </span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {isEditMode ? (
            <>
              <Button variant="outline" onClick={handleReset}>
                <Icon name="RotateCcw" size={16} className="mr-2" />
                Сбросить
              </Button>
              <Button variant="outline" onClick={() => setIsEditMode(false)}>
                <Icon name="X" size={16} className="mr-2" />
                Отмена
              </Button>
              <Button onClick={handleSave}>
                <Icon name="Save" size={16} className="mr-2" />
                Сохранить
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditMode(true)}>
              <Icon name="Edit" size={16} className="mr-2" />
              Редактировать
            </Button>
          )}
        </div>
      </div>

      <div ref={containerRef} style={{ position: 'relative', minHeight: '800px' }}>
        {layouts.map((layout) => {
          const card = cards.find(c => c.id === layout.id);
          if (!card) return null;

          return (
            <div
              key={layout.id}
              style={{
                position: 'absolute',
                left: layout.x,
                top: layout.y,
                width: layout.width,
                height: layout.height,
                cursor: isEditMode ? 'move' : 'default',
              }}
              onMouseDown={(e) => handleDragStart(e, layout.id)}
            >
              <Card style={{
                ...getCardStyle(layout.id),
                border: isEditMode ? '2px dashed rgba(117, 81, 233, 0.5)' : getCardStyle(layout.id).border,
                userSelect: 'none',
              }}>
                {card.component}
              </Card>
              {renderResizeHandles(layout.id)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard2EditableLayout;