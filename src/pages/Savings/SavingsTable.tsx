import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

const formatAmount = (amount: number, currency?: string) =>
  `${new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true }).format(amount).replace(/,/g, '.')} ${currency || 'RUB'}`;

const SavingsTable = ({ savings, loading, onDeleteSaving, highlightId }: SavingsTableProps) => {
  const [selectedSaving, setSelectedSaving] = useState<Saving | null>(null);

  return (
    <>
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
                <table className="w-full table-fixed">
                  <thead className="border-b border-white/5">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground w-[120px]">Сервис</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground w-[200px]">Описание</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground w-[130px]">Отдел</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground w-[160px]">Причина</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground w-[140px]">Сумма</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground w-[110px]">Эквивалент</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground w-[120px]">Автор</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground w-[100px]">Дата</th>
                      <th className="text-left p-4 text-sm font-semibold text-muted-foreground w-[70px]">Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savings.map(saving => (
                      <tr
                        key={saving.id}
                        id={`saving-row-${saving.id}`}
                        onClick={() => setSelectedSaving(saving)}
                        className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${highlightId === saving.id ? 'bg-green-500/20 ring-2 ring-green-500/60 animate-pulse' : ''}`}
                      >
                        <td className="p-4 font-medium break-words whitespace-normal">{saving.service_name}</td>
                        <td className="p-4 text-muted-foreground">
                          <span className="line-clamp-2">{saving.description}</span>
                        </td>
                        <td className="p-4">
                          {saving.customer_department_name ? (
                            <span className="text-muted-foreground truncate block">{saving.customer_department_name}</span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="p-4">
                          {saving.saving_reason_name ? (
                            <span className="text-muted-foreground truncate block">{saving.saving_reason_name}</span>
                          ) : (
                            <span className="text-muted-foreground/50">—</span>
                          )}
                        </td>
                        <td className="p-4 font-semibold text-green-500 whitespace-nowrap">
                          {formatAmount(saving.amount, saving.currency)}
                        </td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">{frequencyLabels[saving.frequency]}</td>
                        <td className="p-4 text-muted-foreground truncate">{saving.employee_name}</td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">
                          {new Date(saving.created_at).toLocaleDateString('ru-RU')}
                        </td>
                        <td className="p-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); onDeleteSaving(saving.id); }}
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
                    onClick={() => setSelectedSaving(saving)}
                    className={`p-4 rounded-lg border bg-card space-y-2 transition-colors cursor-pointer active:scale-[0.99] ${highlightId === saving.id ? 'border-green-500 bg-green-500/10 ring-2 ring-green-500/60 animate-pulse' : 'border-white/5'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1 mr-2">
                        <div className="font-medium">{saving.service_name}</div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{saving.description}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onDeleteSaving(saving.id); }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0"
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                    <div className="text-xl font-bold text-green-500">
                      {formatAmount(saving.amount, saving.currency)}
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

      <Dialog open={!!selectedSaving} onOpenChange={(open) => !open && setSelectedSaving(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedSaving && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icon name="TrendingDown" size={20} className="text-green-500" />
                  {selectedSaving.service_name}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 pt-2">
                <div className="text-2xl font-bold text-green-500">
                  {formatAmount(selectedSaving.amount, selectedSaving.currency)}
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Описание</div>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">{selectedSaving.description || '—'}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Отдел</div>
                      <div className="text-sm">{selectedSaving.customer_department_name || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Причина</div>
                      <div className="text-sm">{selectedSaving.saving_reason_name || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Эквивалент</div>
                      <div className="text-sm">{frequencyLabels[selectedSaving.frequency]}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Автор</div>
                      <div className="text-sm">{selectedSaving.employee_name}</div>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Дата</div>
                    <div className="text-sm">{new Date(selectedSaving.created_at).toLocaleDateString('ru-RU')}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SavingsTable;