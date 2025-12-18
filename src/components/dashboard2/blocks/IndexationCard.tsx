import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const IndexationCard = () => {
  return (
    <Card style={{ background: '#111c44', border: '1px solid rgba(255, 181, 71, 0.4)', borderTop: '4px solid #ffb547', boxShadow: '0 0 30px rgba(255, 181, 71, 0.2), inset 0 0 15px rgba(255, 181, 71, 0.05)' }}>
      <CardContent className="p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Индексация</div>
            <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>Корректировка цен</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255, 181, 71, 0.1)', color: '#ffb547', border: '1px solid rgba(255, 181, 71, 0.2)' }}>
            <Icon name="TrendingUp" size={20} />
          </div>
        </div>
        <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#fff' }}>45,780 ₽</div>
        <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>за текущий период</div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: '#01b574' }}>
          <Icon name="ArrowUp" size={14} /> +15.3% к предыдущему периоду
        </div>
      </CardContent>
    </Card>
  );
};

export default IndexationCard;
