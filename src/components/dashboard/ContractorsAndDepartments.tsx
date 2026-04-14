import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Contractor {
  name: string;
  amount: number;
  invoices: number;
}

interface Department {
  name: string;
  amount: number;
  percentage: number;
}

interface ContractorsAndDepartmentsProps {
  contractorsData: Contractor[];
  departmentsData: Department[];
  indexData: {
    currentMonth: number;
    previousMonth: number;
    growth: number;
    averageCheck: number;
    transactionsCount: number;
  };
}

const ContractorsAndDepartments = ({ contractorsData, departmentsData, indexData }: ContractorsAndDepartmentsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="hover:shadow-lg transition-shadow border-none" style={{
          width: '600px',
          maxWidth: '100%',
          height: '450px',
          overflow: 'auto',
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Users" className="text-green-600 dark:text-green-300" />
              Сравнение расходов по контрагентам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contractorsData.map((contractor, index) => (
                <div key={contractor.name} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{contractor.name}</p>
                    <p className="text-xs text-muted-foreground">{contractor.invoices} счетов</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{contractor.amount.toLocaleString('ru-RU')} ₽</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-none" style={{
          width: '600px',
          maxWidth: '100%',
          height: '450px',
          overflow: 'auto',
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Building2" className="text-orange-600 dark:text-orange-300" />
              Расходы по отделам-заказчикам
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentsData.map((dept) => (
                <div key={dept.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-sm font-semibold">{dept.amount.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all"
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-lg transition-shadow border-none" style={{
        width: '100%',
        maxWidth: '1240px',
        height: '300px',
        overflow: 'hidden',
      }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" className="text-purple-600 dark:text-purple-300" />
            Индексация расходов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-muted-foreground mb-1">Текущий месяц</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{indexData.currentMonth.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-muted-foreground mb-1">Предыдущий месяц</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{indexData.previousMonth.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-muted-foreground mb-1">Рост</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300 flex items-center gap-1">
                <Icon name="ArrowUp" size={24} />
                {indexData.growth}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-muted-foreground mb-1">Средний чек</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{indexData.averageCheck.toLocaleString('ru-RU')} ₽</p>
              <p className="text-xs text-muted-foreground mt-1">{indexData.transactionsCount} операций</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ContractorsAndDepartments;