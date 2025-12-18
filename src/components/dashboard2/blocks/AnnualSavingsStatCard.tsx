import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const AnnualSavingsStatCard = () => {
  return (
    <Card style={{ 
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
      border: '1px solid rgba(1, 181, 116, 0.3)',
      boxShadow: '0 0 30px rgba(1, 181, 116, 0.15)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>Годовая Экономия</div>
            <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500' }}>За счет оптимизации</div>
          </div>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(1, 181, 116, 0.1)', color: '#01b574', border: '1px solid rgba(1, 181, 116, 0.2)' }}>
            <Icon name="PiggyBank" size={20} />
          </div>
        </div>
        <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px', color: '#01b574', textShadow: '0 0 20px rgba(1, 181, 116, 0.4)' }}>480,000 ₽</div>
        <div style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>сэкономлено за год</div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', fontWeight: '600', gap: '6px', color: '#01b574' }}>
          <Icon name="TrendingDown" size={14} /> Снижение затрат на 18%
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnualSavingsStatCard;
