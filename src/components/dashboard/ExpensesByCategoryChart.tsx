import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Category {
  name: string;
  amount: number;
  icon: string;
  percentage: number;
}

interface ExpensesByCategoryChartProps {
  categoriesData: Category[];
  totalAmount: number;
}

const ExpensesByCategoryChart = ({ categoriesData, totalAmount }: ExpensesByCategoryChartProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon name="PieChart" className="text-blue-600" />
          Расходы по категориям
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-8">
          <div className="relative w-64 h-64">
            <svg viewBox="0 0 200 200" className="transform -rotate-90">
              {categoriesData.reduce((acc, cat, index) => {
                const colors = [
                  '#7f00ff',
                  '#0400ff',
                  '#fa0',
                  '#00ff09',
                  '#d0f',
                  '#f00',
                ];
                const total = categoriesData.reduce((sum, c) => sum + c.percentage, 0);
                const percentage = (cat.percentage / total) * 100;
                const circumference = 2 * Math.PI * 80;
                const offset = acc.offset;
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                
                acc.elements.push(
                  <circle
                    key={cat.name}
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke={colors[index % colors.length]}
                    strokeWidth="40"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={-offset}
                    style={{ transition: 'all 0.3s ease' }}
                  />
                );
                
                acc.offset += (percentage / 100) * circumference;
                return acc;
              }, { elements: [] as JSX.Element[], offset: 0 }).elements}
              <circle cx="100" cy="100" r="60" fill="hsl(var(--card))" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <p className="text-3xl font-bold">{totalAmount.toLocaleString('ru-RU', { notation: 'compact' })}</p>
              <p className="text-sm text-muted-foreground">Всего</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {categoriesData.map((cat, index) => {
              const colors = [
                '#7f00ff',
                '#0400ff',
                '#fa0',
                '#00ff09',
                '#d0f',
                '#f00',
              ];
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="font-medium">{cat.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cat.amount.toLocaleString('ru-RU')} ₽ ({cat.percentage}%)
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpensesByCategoryChart;
