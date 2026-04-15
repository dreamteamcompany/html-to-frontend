import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import { Saving } from './types';

interface SavingsTableProps {
  savings: Saving[];
  loading: boolean;
  onDeleteSaving: (savingId: number) => void;
  highlightId?: number | null;
}

const frequencyLabels: Record<string, string> = {
  once: 'Единоразово',
  monthly: 'Ежемесячно',
  yearly: 'Ежегодно',
  quarterly: 'Ежеквартально',
};

const SavingsTable = ({ savings, loading, onDeleteSaving, highlightId }: SavingsTableProps) => {
  return (
    <Card className="border-white/5 bg-card shadow-[0_4px_20px_rgba(0,0,0,0.25)]">
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Загрузка...</div>
        ) : savings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Нет записей об экономии. Добавьте первую запись.
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/5">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Сервис</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Описание</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Отдел</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Причина</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Сумма</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Эквивалент</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Автор</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Дата</th>
                    <th className="text-left p-4 text-sm font-semibold text-muted-foreground">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {savings.map(saving => (
                    <tr
                      key={saving.id}
                      id={`saving-row-${saving.id}`}
                      className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${highlightId === saving.id ? 'bg-green-500/20 ring-2 ring-green-500/60 animate-pulse' : ''}`}
                    >
                      <td className="p-4 font-medium max-w-[150px] break-words whitespace-normal">{saving.service_name}</td>
                      <td className="p-4 text-muted-foreground max-w-xs break-anywhere">{saving.description}</td>
                      <td className="p-4">
                        {saving.customer_department_name ? (
                          <span className="text-muted-foreground">{saving.customer_department_name}</span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="p-4">
                        {saving.saving_reason_name ? (
                          <span className="text-muted-foreground">{saving.saving_reason_name}</span>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-green-500">
                        {new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(saving.amount).replace(/,/g, '.')} {saving.currency || 'RUB'}
                      </td>
                      <td className="p-4 text-muted-foreground">{frequencyLabels[saving.frequency]}</td>
                      <td className="p-4 text-muted-foreground">{saving.employee_name}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(saving.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDeleteSaving(saving.id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        >
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4 p-4">
              {savings.map(saving => (
                <div
                  key={saving.id}
                  id={`saving-row-${saving.id}`}
                  className={`p-4 rounded-lg border bg-card space-y-2 transition-colors ${highlightId === saving.id ? 'border-green-500 bg-green-500/10 ring-2 ring-green-500/60 animate-pulse' : 'border-white/5'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{saving.service_name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{saving.description}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteSaving(saving.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                  <div className="text-xl font-bold text-green-500">
                    {new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(saving.amount).replace(/,/g, '.')} {saving.currency || 'RUB'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {frequencyLabels[saving.frequency]}
                  </div>
                  {saving.customer_department_name && (
                    <div className="text-sm text-muted-foreground">
                      Отдел: {saving.customer_department_name}
                    </div>
                  )}
                  {saving.saving_reason_name && (
                    <div className="text-sm text-muted-foreground">
                      Причина: {saving.saving_reason_name}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Автор: {saving.employee_name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(saving.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsTable;