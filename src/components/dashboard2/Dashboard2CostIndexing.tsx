import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

interface IndexData {
  month: string;
  index: number;
  change: number;
  categories: {
    it: number;
    office: number;
    marketing: number;
    operations: number;
  };
}

const Dashboard2CostIndexing = () => {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'it' | 'office' | 'marketing' | 'operations'>('all');

  const indexData: IndexData[] = [
    { month: 'Янв', index: 100, change: 0, categories: { it: 100, office: 100, marketing: 100, operations: 100 } },
    { month: 'Фев', index: 105, change: 5, categories: { it: 103, office: 108, marketing: 102, operations: 106 } },
    { month: 'Мар', index: 112, change: 6.7, categories: { it: 110, office: 115, marketing: 108, operations: 113 } },
    { month: 'Апр', index: 108, change: -3.6, categories: { it: 106, office: 112, marketing: 105, operations: 109 } },
    { month: 'Май', index: 115, change: 6.5, categories: { it: 113, office: 118, marketing: 112, operations: 116 } },
    { month: 'Июн', index: 122, change: 6.1, categories: { it: 120, office: 125, marketing: 118, operations: 123 } },
    { month: 'Июл', index: 118, change: -3.3, categories: { it: 116, office: 121, marketing: 115, operations: 119 } },
    { month: 'Авг', index: 125, change: 5.9, categories: { it: 123, office: 128, marketing: 122, operations: 126 } },
    { month: 'Сен', index: 132, change: 5.6, categories: { it: 130, office: 135, marketing: 129, operations: 133 } },
    { month: 'Окт', index: 128, change: -3, categories: { it: 126, office: 131, marketing: 125, operations: 129 } },
    { month: 'Ноя', index: 135, change: 5.5, categories: { it: 133, office: 138, marketing: 132, operations: 136 } },
    { month: 'Дек', index: 142, change: 5.2, categories: { it: 140, office: 145, marketing: 139, operations: 143 } },
  ];

  const categories = [
    { id: 'all' as const, name: 'Все категории', icon: 'Layers', color: '#3965ff' },
    { id: 'it' as const, name: 'IT-инфраструктура', icon: 'Server', color: '#2CD9FF' },
    { id: 'office' as const, name: 'Офисные расходы', icon: 'Building2', color: '#01B574' },
    { id: 'marketing' as const, name: 'Маркетинг', icon: 'TrendingUp', color: '#ffb547' },
    { id: 'operations' as const, name: 'Операционные', icon: 'Settings', color: '#7551e9' },
  ];

  const getDisplayData = () => {
    if (selectedCategory === 'all') {
      return indexData.map(d => d.index);
    }
    return indexData.map(d => d.categories[selectedCategory]);
  };

  const displayData = getDisplayData();
  const maxIndex = Math.max(...displayData);
  const minIndex = Math.min(...displayData);
  const currentIndex = displayData[displayData.length - 1];
  const startIndex = displayData[0];
  const totalChange = ((currentIndex - startIndex) / startIndex) * 100;
  const avgMonthlyChange = indexData.reduce((sum, d) => sum + d.change, 0) / indexData.length;

  const chartWidth = 650;
  const chartHeight = 280;
  const padding = { top: 40, right: 50, bottom: 40, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const xStep = plotWidth / (indexData.length - 1);
  const yScale = (value: number) => {
    return padding.top + plotHeight - ((value - minIndex) / (maxIndex - minIndex)) * plotHeight;
  };

  const points = displayData.map((value, index) => ({
    x: padding.left + index * xStep,
    y: yScale(value),
    value,
    month: indexData[index].month,
    change: indexData[index].change
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${padding.left} ${chartHeight - padding.bottom} Z`;

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const categoryColor = selectedCategoryData?.color || '#3965ff';

  return (
    <Card style={{ 
      background: 'linear-gradient(135deg, #1a1f37 0%, #111c44 100%)', 
      border: '1px solid rgba(57, 101, 255, 0.3)',
      boxShadow: '0 0 40px rgba(57, 101, 255, 0.2), inset 0 0 30px rgba(57, 101, 255, 0.08)',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '30px'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '180%',
        height: '180%',
        background: 'radial-gradient(circle, rgba(57, 101, 255, 0.08) 0%, transparent 65%)',
        pointerEvents: 'none',
        animation: 'rotate 30s linear infinite'
      }} />

      <CardContent className="p-6" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
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

        {/* Category filters */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id 
                  ? `linear-gradient(135deg, ${cat.color}30 0%, ${cat.color}15 100%)`
                  : 'rgba(255, 255, 255, 0.03)',
                border: selectedCategory === cat.id 
                  ? `1px solid ${cat.color}`
                  : '1px solid rgba(255, 255, 255, 0.1)',
                padding: '10px 16px',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== cat.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = cat.color;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== cat.id) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            >
              <Icon name={cat.icon} size={16} style={{ color: selectedCategory === cat.id ? cat.color : '#a3aed0' }} />
              <span style={{ 
                color: selectedCategory === cat.id ? cat.color : '#a3aed0',
                fontSize: '13px',
                fontWeight: selectedCategory === cat.id ? '700' : '600'
              }}>
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        {/* Chart */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '24px'
        }}>
          <svg width={chartWidth} height={chartHeight} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="indexLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={categoryColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={categoryColor} stopOpacity="1" />
              </linearGradient>
              <linearGradient id="indexAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={categoryColor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={categoryColor} stopOpacity="0.05" />
              </linearGradient>
              <filter id="indexGlow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = padding.top + plotHeight - ratio * plotHeight;
              const value = (minIndex + (maxIndex - minIndex) * ratio).toFixed(0);
              return (
                <g key={`grid-y-${idx}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fill="#a3aed0"
                    style={{ fontSize: '11px', fontWeight: '600' }}
                  >
                    {value}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {points.map((point, index) => (
              <text
                key={`month-${index}`}
                x={point.x}
                y={chartHeight - padding.bottom + 20}
                textAnchor="middle"
                fill={hoveredMonth === index ? categoryColor : '#a3aed0'}
                style={{ 
                  fontSize: '12px', 
                  fontWeight: hoveredMonth === index ? '700' : '600',
                  transition: 'all 0.3s ease'
                }}
              >
                {point.month}
              </text>
            ))}

            {/* Area fill */}
            <path
              d={areaPath}
              fill="url(#indexAreaGradient)"
            />

            {/* Line */}
            <path
              d={linePath}
              stroke="url(#indexLineGradient)"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#indexGlow)"
            />

            {/* Points */}
            {points.map((point, index) => (
              <g 
                key={`point-${index}`}
                onMouseEnter={() => setHoveredMonth(index)}
                onMouseLeave={() => setHoveredMonth(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredMonth === index ? "10" : "6"}
                  fill={categoryColor}
                  opacity="0.3"
                  style={{ transition: 'all 0.3s ease' }}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={hoveredMonth === index ? "6" : "4"}
                  fill="#fff"
                  filter={hoveredMonth === index ? "url(#indexGlow)" : "none"}
                  style={{ transition: 'all 0.3s ease' }}
                />
                
                {/* Tooltip on hover */}
                {hoveredMonth === index && (
                  <g>
                    <rect
                      x={point.x - 50}
                      y={point.y - 60}
                      width="100"
                      height="50"
                      rx="8"
                      fill="rgba(17, 28, 68, 0.95)"
                      stroke={categoryColor}
                      strokeWidth="1"
                    />
                    <text
                      x={point.x}
                      y={point.y - 40}
                      textAnchor="middle"
                      fill="#fff"
                      style={{ fontSize: '13px', fontWeight: '700' }}
                    >
                      {point.month}
                    </text>
                    <text
                      x={point.x}
                      y={point.y - 25}
                      textAnchor="middle"
                      fill={categoryColor}
                      style={{ fontSize: '15px', fontWeight: '800' }}
                    >
                      {point.value.toFixed(1)}
                    </text>
                    <text
                      x={point.x}
                      y={point.y - 12}
                      textAnchor="middle"
                      fill={point.change >= 0 ? '#01b574' : '#ff6b6b'}
                      style={{ fontSize: '12px', fontWeight: '700' }}
                    >
                      {point.change >= 0 ? '+' : ''}{point.change.toFixed(1)}%
                    </text>
                  </g>
                )}
              </g>
            ))}

            {/* Baseline (January = 100) */}
            <line
              x1={padding.left}
              y1={yScale(100)}
              x2={chartWidth - padding.right}
              y2={yScale(100)}
              stroke="#ffb547"
              strokeWidth="2"
              strokeDasharray="8 4"
              opacity="0.5"
            />
            <text
              x={chartWidth - padding.right + 5}
              y={yScale(100) + 4}
              textAnchor="start"
              fill="#ffb547"
              style={{ fontSize: '11px', fontWeight: '700' }}
            >
              База: 100
            </text>
          </svg>
        </div>

        {/* Statistics grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '16px',
          marginBottom: '24px'
        }}>
          {[
            { 
              icon: 'Target', 
              label: 'Текущий индекс', 
              value: currentIndex.toFixed(1), 
              sublabel: indexData[indexData.length - 1].month,
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
          ].map((stat, idx) => (
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

        {/* Insight banner */}
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
      </CardContent>
    </Card>
  );
};

export default Dashboard2CostIndexing;
