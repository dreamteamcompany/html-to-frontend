import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface Payment {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  description: string;
  amount: number;
  payment_date: string;
  legal_entity_id?: number;
  legal_entity_name?: string;
}

interface PaymentsListProps {
  payments: Payment[];
  loading: boolean;
}

const PaymentsList = ({ payments, loading }: PaymentsListProps) => {
  return (
    <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Нет платежей. Добавьте первый платёж для начала работы.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Категория</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Юр. лицо</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Назначение</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Сумма</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Icon name={payment.category_icon} size={18} />
                          </div>
                          <span className="font-medium">{payment.category_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {payment.legal_entity_name || <span className="text-muted-foreground/50">—</span>}
                      </td>
                      <td className="p-4 text-muted-foreground">{payment.description}</td>
                      <td className="p-4">
                        <span className="font-bold text-lg">{payment.amount.toLocaleString('ru-RU')} ₽</span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(payment.payment_date).toLocaleDateString('ru-RU', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="md:hidden space-y-3 p-4">
              {payments.map((payment) => (
                <Card key={payment.id} className="border-white/10 bg-white/5">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Icon name={payment.category_icon} size={18} />
                        </div>
                        <span className="font-medium">{payment.category_name}</span>
                      </div>
                      <span className="font-bold text-lg">{payment.amount.toLocaleString('ru-RU')} ₽</span>
                    </div>
                    {payment.legal_entity_name && (
                      <div className="text-sm">
                        <span className="text-muted-foreground/70">Юр. лицо: </span>
                        <span className="text-muted-foreground">{payment.legal_entity_name}</span>
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">{payment.description}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(payment.payment_date).toLocaleDateString('ru-RU', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentsList;
