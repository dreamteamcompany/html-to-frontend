import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Saving, Service, Employee, SavingReason, CustomerDepartment } from './types';

interface SavingsTableProps {
  savings: Saving[];
  loading: boolean;
  onDeleteSaving: (savingId: number) => void;
  onEditSaving?: (savingId: number, data: Record<string, unknown>) => Promise<boolean>;
  services?: Service[];
  employees?: Employee[];
  savingReasons?: SavingReason[];
  departments?: CustomerDepartment[];
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

const SavingsTable = ({
  savings, loading, onDeleteSaving, onEditSaving,
  services = [], employees = [], savingReasons = [], departments = [],
  highlightId,
}: SavingsTableProps) => {
  const { user } = useAuth();
  const [selectedSaving, setSelectedSaving] = useState<Saving | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    service_id: '',
    description: '',
    amount: '',
    frequency: 'once',
    currency: 'RUB',
    employee_id: '',
    saving_reason_id: '',
    customer_department_id: '',
  });

  const isAdmin = user?.roles?.some(r => r.name === 'Администратор' || r.name === 'Admin');

  const startEdit = (s: Saving) => {
    setEditData({
      service_id: s.service_id?.toString() || '',
      description: s.description || '',
      amount: s.amount?.toString() || '',
      frequency: s.frequency || 'once',
      currency: s.currency || 'RUB',
      employee_id: s.employee_id?.toString() || '',
      saving_reason_id: s.saving_reason_id?.toString() || '',
      customer_department_id: s.customer_department_id?.toString() || '',
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    if (!selectedSaving || !onEditSaving) return;
    setSaving(true);
    const ok = await onEditSaving(selectedSaving.id, {
      service_id: parseInt(editData.service_id),
      description: editData.description,
      amount: parseFloat(editData.amount),
      frequency: editData.frequency,
      currency: editData.currency,
      employee_id: parseInt(editData.employee_id),
      saving_reason_id: editData.saving_reason_id ? parseInt(editData.saving_reason_id) : null,
      customer_department_id: editData.customer_department_id ? parseInt(editData.customer_department_id) : null,
    });
    setSaving(false);
    if (ok) {
      setEditing(false);
      setSelectedSaving(null);
    }
  };

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
                    {savings.map(s => (
                      <tr
                        key={s.id}
                        id={`saving-row-${s.id}`}
                        onClick={() => { setSelectedSaving(s); setEditing(false); }}
                        className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer ${highlightId === s.id ? 'bg-green-500/20 ring-2 ring-green-500/60 animate-pulse' : ''}`}
                      >
                        <td className="p-4 font-medium break-words whitespace-normal">{s.service_name}</td>
                        <td className="p-4 text-muted-foreground"><span className="line-clamp-2">{s.description}</span></td>
                        <td className="p-4">
                          {s.customer_department_name ? <span className="text-muted-foreground truncate block">{s.customer_department_name}</span> : <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="p-4">
                          {s.saving_reason_name ? <span className="text-muted-foreground truncate block">{s.saving_reason_name}</span> : <span className="text-muted-foreground/50">—</span>}
                        </td>
                        <td className="p-4 font-semibold text-green-500 whitespace-nowrap">{formatAmount(s.amount, s.currency)}</td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">{frequencyLabels[s.frequency]}</td>
                        <td className="p-4 text-muted-foreground truncate">{s.employee_name}</td>
                        <td className="p-4 text-muted-foreground whitespace-nowrap">{new Date(s.created_at).toLocaleDateString('ru-RU')}</td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDeleteSaving(s.id); }} className="text-red-500 hover:text-red-600 hover:bg-red-500/10">
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden space-y-4 p-4">
                {savings.map(s => (
                  <div
                    key={s.id}
                    id={`saving-row-${s.id}`}
                    onClick={() => { setSelectedSaving(s); setEditing(false); }}
                    className={`p-4 rounded-lg border bg-card space-y-2 transition-colors cursor-pointer active:scale-[0.99] ${highlightId === s.id ? 'border-green-500 bg-green-500/10 ring-2 ring-green-500/60 animate-pulse' : 'border-white/5'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1 mr-2">
                        <div className="font-medium">{s.service_name}</div>
                        <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{s.description}</div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onDeleteSaving(s.id); }} className="text-red-500 hover:text-red-600 hover:bg-red-500/10 shrink-0">
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                    <div className="text-xl font-bold text-green-500">{formatAmount(s.amount, s.currency)}</div>
                    <div className="text-sm text-muted-foreground">{frequencyLabels[s.frequency]}</div>
                    {s.customer_department_name && <div className="text-sm text-muted-foreground">Отдел: {s.customer_department_name}</div>}
                    {s.saving_reason_name && <div className="text-sm text-muted-foreground">Причина: {s.saving_reason_name}</div>}
                    <div className="text-sm text-muted-foreground">Автор: {s.employee_name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleDateString('ru-RU')}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedSaving} onOpenChange={(open) => { if (!open) { setSelectedSaving(null); setEditing(false); } }}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedSaving && !editing && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Icon name="TrendingDown" size={20} className="text-green-500" />
                  {selectedSaving.service_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="text-2xl font-bold text-green-500">{formatAmount(selectedSaving.amount, selectedSaving.currency)}</div>
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
                {isAdmin && onEditSaving && (
                  <div className="pt-2">
                    <Button onClick={() => startEdit(selectedSaving)} className="gap-2">
                      <Icon name="Pencil" size={16} />
                      Редактировать
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}

          {selectedSaving && editing && (
            <>
              <DialogHeader>
                <DialogTitle>Редактирование записи</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Сервис *</Label>
                  <Select value={editData.service_id} onValueChange={(v) => setEditData({ ...editData, service_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Выберите сервис" /></SelectTrigger>
                    <SelectContent>
                      {services.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Описание *</Label>
                  <Textarea value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} rows={4} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Сумма *</Label>
                    <Input type="number" step="0.01" value={editData.amount} onChange={(e) => setEditData({ ...editData, amount: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Валюта *</Label>
                    <Select value={editData.currency} onValueChange={(v) => setEditData({ ...editData, currency: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RUB">RUB</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Причина экономии</Label>
                  <Select value={editData.saving_reason_id} onValueChange={(v) => setEditData({ ...editData, saving_reason_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Выберите причину" /></SelectTrigger>
                    <SelectContent>
                      {savingReasons.map(r => (
                        <SelectItem key={r.id} value={r.id.toString()}>
                          <span className="flex items-center gap-2"><span>{r.icon}</span><span>{r.name}</span></span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Эквивалент *</Label>
                  <Select value={editData.frequency} onValueChange={(v) => setEditData({ ...editData, frequency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Единоразово</SelectItem>
                      <SelectItem value="monthly">Ежемесячно</SelectItem>
                      <SelectItem value="quarterly">Ежеквартально</SelectItem>
                      <SelectItem value="yearly">Ежегодно</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Отдел *</Label>
                  <Select value={editData.customer_department_id} onValueChange={(v) => setEditData({ ...editData, customer_department_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Выберите отдел" /></SelectTrigger>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Автор *</Label>
                  <Select value={editData.employee_id} onValueChange={(v) => setEditData({ ...editData, employee_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Выберите сотрудника" /></SelectTrigger>
                    <SelectContent>
                      {employees.map(e => <SelectItem key={e.id} value={e.id.toString()}>{e.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={cancelEdit}>Отмена</Button>
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving && <Icon name="Loader2" size={16} className="animate-spin" />}
                    Сохранить
                  </Button>
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