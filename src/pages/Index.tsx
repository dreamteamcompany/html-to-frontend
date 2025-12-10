import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '@/components/ui/icon';

const Index = () => {
  const expensesData = [
    { name: 'Серверы', value: 15000, color: '#7551E9' },
    { name: 'Коммуникации', value: 8000, color: '#3965FF' },
    { name: 'Веб-сайты', value: 5000, color: '#FFB547' },
    { name: 'Безопасность', value: 3000, color: '#01B574' }
  ];

  const totalExpenses = expensesData.reduce((sum, item) => sum + item.value, 0);

  const stats = [
    {
      title: 'Общие расходы',
      value: `${totalExpenses.toLocaleString('ru-RU')} ₽`,
      icon: 'DollarSign',
      color: 'from-purple-500 to-purple-600',
      change: '+12.5%'
    },
    {
      title: 'Серверы',
      value: '15 000 ₽',
      icon: 'Server',
      color: 'from-blue-500 to-blue-600',
      change: '+8.2%'
    },
    {
      title: 'Коммуникации',
      value: '8 000 ₽',
      icon: 'Radio',
      color: 'from-orange-500 to-orange-600',
      change: '+5.1%'
    },
    {
      title: 'Безопасность',
      value: '3 000 ₽',
      icon: 'Shield',
      color: 'from-green-500 to-green-600',
      change: '+3.4%'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Дашборд расходов
          </h1>
          <p className="text-muted-foreground text-lg">
            Визуализация и анализ финансовых данных компании
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card 
              key={index} 
              className="border-2 hover:border-primary transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon name={stat.icon} size={24} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {stat.title}
                </h3>
                <p className="text-2xl font-bold">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="BarChart3" size={24} className="text-primary" />
                Расходы по категориям
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '2px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, 'Сумма']}
                  />
                  <Legend />
                  <Bar 
                    dataKey="value" 
                    name="Расходы"
                    radius={[8, 8, 0, 0]}
                  >
                    {expensesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="PieChart" size={24} className="text-secondary" />
                Распределение расходов
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '2px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString('ru-RU')} ₽`, 'Сумма']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="border-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="List" size={24} className="text-accent" />
              Детальная разбивка расходов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expensesData.map((item, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-muted rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(item.value / totalExpenses) * 100}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                    <span className="font-bold text-lg min-w-[120px] text-right">
                      {item.value.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="text-sm text-muted-foreground min-w-[60px] text-right">
                      {((item.value / totalExpenses) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
