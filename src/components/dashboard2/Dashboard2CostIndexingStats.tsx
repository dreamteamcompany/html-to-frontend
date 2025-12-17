import Icon from '@/components/ui/icon';

interface Dashboard2CostIndexingStatsProps {
  currentIndex: number;
  lastMonth: string;
  totalChange: number;
  avgMonthlyChange: number;
  maxIndex: number;
  minIndex: number;
  categoryColor: string;
}

const Dashboard2CostIndexingStats = ({
  currentIndex,
  lastMonth,
  totalChange,
  avgMonthlyChange,
  maxIndex,
  minIndex,
  categoryColor
}: Dashboard2CostIndexingStatsProps) => {
  const stats = [
    { 
      icon: 'Target', 
      label: 'Текущий индекс', 
      value: currentIndex.toFixed(1), 
      sublabel: lastMonth,
      color: categoryColor,
      bgGradient: `${categoryColor}15`
    },
    { 
      icon: 'TrendingUp', 
      label: 'Общий рост', 
      value: `${totalChange >= 0 ? '+' : ''}${totalChange.toFixed(1)}%`, 
      sublabel: 'За весь период',
      color: totalChange >= 0 ? '#01B574' : '#ff6b6b',
      bgGradient: totalChange >= 0 ? 'rgba(1, 181, 116, 0.15)' : 'rgba(255, 107, 107, 0.15)'
    },
    { 
      icon: 'BarChart2', 
      label: 'Средний рост', 
      value: `${avgMonthlyChange >= 0 ? '+' : ''}${avgMonthlyChange.toFixed(1)}%`, 
      sublabel: 'В месяц',
      color: '#2CD9FF',
      bgGradient: 'rgba(44, 217, 255, 0.15)'
    },
    { 
      icon: 'Activity', 
      label: 'Макс. значение', 
      value: maxIndex.toFixed(1), 
      sublabel: `Мин: ${minIndex.toFixed(1)}`,
      color: '#7551e9',
      bgGradient: 'rgba(117, 81, 233, 0.15)'
    }
  ];

  return (
    <>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{ 
            background: `linear-gradient(135deg, ${stat.bgGradient} 0%, ${stat.bgGradient}80 100%)`,
            padding: '18px',
            borderRadius: '14px',
            border: `1px solid ${stat.color}30`,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = `0 10px 30px ${stat.color}40`;
            e.currentTarget.style.borderColor = stat.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = `${stat.color}30`;
          }}>
            <div style={{
              position: 'absolute',
              top: '-30px',
              right: '-30px',
              width: '80px',
              height: '80px',
              background: `radial-gradient(circle, ${stat.color}20 0%, transparent 70%)`,
              pointerEvents: 'none'
            }} />
            <Icon name={stat.icon} size={20} style={{ color: stat.color, marginBottom: '10px' }} />
            <div style={{ 
              color: stat.color, 
              fontSize: '20px', 
              fontWeight: '900',
              marginBottom: '6px',
              textShadow: `0 0 20px ${stat.color}60`
            }}>
              {stat.value}
            </div>
            <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
              {stat.label}
            </div>
            <div style={{ color: '#a3aed0', fontSize: '11px', fontWeight: '500' }}>
              {stat.sublabel}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(57, 101, 255, 0.15) 0%, rgba(57, 101, 255, 0.05) 100%)',
        border: '1px solid rgba(57, 101, 255, 0.3)',
        borderRadius: '14px',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #3965ff 0%, #2948cc 100%)',
          padding: '12px',
          borderRadius: '12px',
          boxShadow: '0 0 20px rgba(57, 101, 255, 0.5)'
        }}>
          <Icon name="TrendingUp" size={24} style={{ color: '#fff' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#3965ff', fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>
            Индекс вырос на {totalChange.toFixed(1)}% за год 📈
          </div>
          <div style={{ color: '#a3aed0', fontSize: '13px', lineHeight: '1.6' }}>
            Средний темп роста затрат составляет <span style={{ color: '#3965ff', fontWeight: '700' }}>{avgMonthlyChange.toFixed(1)}% в месяц</span>. 
            {avgMonthlyChange > 5 ? ' Рекомендуется анализ причин высокого роста' : ' Темп роста в пределах нормы'}
          </div>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '10px 20px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          e.currentTarget.style.transform = 'scale(1)';
        }}>
          <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>
            Анализ →
          </span>
        </div>
      </div>
    </>
  );
};

export default Dashboard2CostIndexingStats;
