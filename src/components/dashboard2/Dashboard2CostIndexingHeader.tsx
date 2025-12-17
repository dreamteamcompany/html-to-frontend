import Icon from '@/components/ui/icon';

interface Dashboard2CostIndexingHeaderProps {
  currentIndex: number;
  totalChange: number;
}

const Dashboard2CostIndexingHeader = ({ currentIndex, totalChange }: Dashboard2CostIndexingHeaderProps) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #3965ff 0%, #2948cc 100%)',
          padding: '14px',
          borderRadius: '14px',
          boxShadow: '0 0 25px rgba(57, 101, 255, 0.6)',
          animation: 'pulse 3s infinite'
        }}>
          <Icon name="LineChart" size={28} style={{ color: '#fff' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>Индексация Затрат</h3>
          <p style={{ fontSize: '14px', color: '#a3aed0', marginTop: '4px' }}>Динамика индекса за 12 месяцев • Базовый период: январь</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ 
          background: 'rgba(57, 101, 255, 0.15)',
          padding: '10px 18px',
          borderRadius: '10px',
          border: '1px solid rgba(57, 101, 255, 0.3)'
        }}>
          <span style={{ color: '#3965ff', fontSize: '14px', fontWeight: '700' }}>Индекс: {currentIndex.toFixed(1)}</span>
        </div>
        <div style={{ 
          background: totalChange >= 0 ? 'rgba(1, 181, 116, 0.15)' : 'rgba(255, 107, 107, 0.15)',
          padding: '10px 18px',
          borderRadius: '10px',
          border: totalChange >= 0 ? '1px solid rgba(1, 181, 116, 0.3)' : '1px solid rgba(255, 107, 107, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Icon name={totalChange >= 0 ? "TrendingUp" : "TrendingDown"} size={16} style={{ color: totalChange >= 0 ? '#01b574' : '#ff6b6b' }} />
          <span style={{ color: totalChange >= 0 ? '#01b574' : '#ff6b6b', fontSize: '14px', fontWeight: '700' }}>
            {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(1)}% за год
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard2CostIndexingHeader;
