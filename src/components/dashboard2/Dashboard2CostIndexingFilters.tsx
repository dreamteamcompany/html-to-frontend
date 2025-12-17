import Icon from '@/components/ui/icon';

interface Category {
  id: 'all' | 'it' | 'office' | 'marketing' | 'operations';
  name: string;
  icon: string;
  color: string;
}

interface Dashboard2CostIndexingFiltersProps {
  categories: Category[];
  selectedCategory: 'all' | 'it' | 'office' | 'marketing' | 'operations';
  onCategoryChange: (category: 'all' | 'it' | 'office' | 'marketing' | 'operations') => void;
}

const Dashboard2CostIndexingFilters = ({ categories, selectedCategory, onCategoryChange }: Dashboard2CostIndexingFiltersProps) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '10px', 
      marginBottom: '24px',
      flexWrap: 'wrap'
    }}>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onCategoryChange(cat.id)}
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
  );
};

export default Dashboard2CostIndexingFilters;
