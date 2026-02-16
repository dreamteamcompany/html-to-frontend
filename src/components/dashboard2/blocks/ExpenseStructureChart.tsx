import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Doughnut } from 'react-chartjs-2';

const categories = [
  { name: 'IT', value: 45, amount: '4 500 000 ₽', color: 'rgb(117, 81, 233)' },
  { name: 'Маркетинг', value: 25, amount: '2 500 000 ₽', color: 'rgb(57, 101, 255)' },
  { name: 'HR', value: 15, amount: '1 500 000 ₽', color: 'rgb(255, 181, 71)' },
  { name: 'Офис', value: 10, amount: '1 000 000 ₽', color: 'rgb(1, 181, 116)' },
  { name: 'Прочее', value: 5, amount: '500 000 ₽', color: 'rgb(255, 107, 107)' },
];

const ExpenseStructureChart = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'details'>('general');

  const activeStyle = {
    background: '#7551e9',
    border: 'none',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600' as const,
    boxShadow: '0 2px 8px rgba(117, 81, 233, 0.3)',
  };

  const inactiveStyle = {
    background: 'transparent',
    border: 'none',
    color: '#a3aed0',
    padding: '8px 16px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600' as const,
  };

  return (
    <Card style={{ background: '#111c44', border: '1px solid rgba(255, 181, 71, 0.4)', boxShadow: '0 0 30px rgba(255, 181, 71, 0.2), inset 0 0 15px rgba(255, 181, 71, 0.05)' }}>
      <CardContent className="p-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff' }}>Структура Расходов</h3>
          <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '10px' }}>
            <button
              style={activeTab === 'general' ? activeStyle : inactiveStyle}
              onClick={() => setActiveTab('general')}
            >
              Общие
            </button>
            <button
              style={activeTab === 'details' ? activeStyle : inactiveStyle}
              onClick={() => setActiveTab('details')}
            >
              Детали
            </button>
          </div>
        </div>

        {activeTab === 'general' ? (
          <div style={{ height: '350px', position: 'relative' }}>
            <Doughnut
              data={{
                labels: categories.map(c => c.name),
                datasets: [{
                  data: categories.map(c => c.value),
                  backgroundColor: categories.map(c => c.color),
                  borderWidth: 0,
                  hoverOffset: 10
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    position: 'right',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                      color: '#a3aed0',
                      font: {
                        family: 'Plus Jakarta Sans, sans-serif',
                        size: 13
                      }
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ${context.parsed}%`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        ) : (
          <div style={{ height: '350px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: '#a3aed0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Категория</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', color: '#a3aed0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Доля</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', color: '#a3aed0', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Сумма</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.name} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                        <span style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>{cat.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '14px 12px' }}>
                      <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{cat.value}%</span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '14px 12px' }}>
                      <span style={{ color: '#a3aed0', fontSize: '14px' }}>{cat.amount}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '16px', padding: '14px 12px', background: 'rgba(117, 81, 233, 0.1)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#a3aed0', fontSize: '14px', fontWeight: '600' }}>Итого</span>
              <span style={{ color: '#fff', fontSize: '16px', fontWeight: '700' }}>10 000 000 ₽</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpenseStructureChart;