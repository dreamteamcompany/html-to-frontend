import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const AnnualSavingsKPICard = () => {
  return (
    <Card style={{ 
      background: 'hsl(var(--card))', 
      border: '1px solid rgba(1, 181, 116, 0.3)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent className="p-4 sm:p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #01b574 0%, #018c5a 100%)',
          padding: '8px',
          borderRadius: '10px',
          display: 'inline-flex',
          marginBottom: '14px'
        }} className="sm:p-3 sm:mb-5">
          <Icon name="PiggyBank" size={18} style={{ color: '#fff' }} className="sm:w-6 sm:h-6" />
        </div>
        <h3 className="text-[15px] font-bold text-foreground mb-3 sm:text-lg sm:mb-4">
          Годовая Экономия
        </h3>
        <div style={{ 
          color: '#01b574', 
          fontSize: '32px', 
          fontWeight: '900',
          marginBottom: '8px'
        }} className="sm:text-[42px] sm:mb-3">
          ₽480K
        </div>
        <div className="text-muted-foreground text-xs mb-[14px] sm:text-sm sm:mb-5">
          За счет оптимизации подписок
        </div>
        <div style={{ 
          background: 'rgba(1, 181, 116, 0.1)',
          padding: '10px',
          borderRadius: '8px',
          border: '1px solid rgba(1, 181, 116, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }} className="sm:mb-2">
            <span className="text-muted-foreground text-[11px] sm:text-xs">Прогресс цели</span>
            <span style={{ color: '#01b574' }} className="text-[11px] font-bold sm:text-xs">73%</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '6px', 
            background: 'hsl(var(--muted))', 
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: '73%', 
              height: '100%', 
              background: 'linear-gradient(90deg, #01b574 0%, #01b574aa 100%)',
              borderRadius: '10px'
            }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnualSavingsKPICard;
