import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const TotalExpensesCard = () => {
  return (
    <Card style={{ background: '#111c44', border: '1px solid rgba(117, 81, 233, 0.4)', borderTop: '4px solid #7551e9', boxShadow: '0 0 30px rgba(117, 81, 233, 0.2), inset 0 0 15px rgba(117, 81, 233, 0.05)' }}>
      <CardContent className="p-6">
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
    </Card>
  );
};

export default TotalExpensesCard;
