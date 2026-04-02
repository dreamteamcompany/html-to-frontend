import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { PaymentRecord } from '@/contexts/PaymentsCacheContext';

// ─── Типы справочников ────────────────────────────────────────────────────────

interface DictItem  { id: number; name: string; }
interface CatItem   { id: number; name: string; icon: string; }
interface SvcItem   { id: number; name: string; description: string; }

interface Dicts {
  categories:          CatItem[];
  legalEntities:       DictItem[];
  contractors:         DictItem[];
  customerDepartments: DictItem[];
  services:            SvcItem[];
  loaded:              boolean;
}

// ─── Утилиты ──────────────────────────────────────────────────────────────────

const fmt = (amount: number | string) => {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(n)) return '— ₽';
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
};

const fmtDate = (date: string | undefined) => {
  if (!date) return '—';
  const d = new Date(date.includes('T') ? date : date + 'T00:00:00');
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
};

const REC_LABEL: Record<string, string> = {
  once: 'Однократно', daily: 'Ежедневно',
  weekly: 'Еженедельно', monthly: 'Ежемесячно', yearly: 'Ежегодно',
};

// ─── Строка деталей ───────────────────────────────────────────────────────────

const Row = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '13px', color: 'hsl(var(--foreground))', fontWeight: 600, wordBreak: 'break-word' }}>{value}</div>
    </div>
  );
};

// ─── Поле формы редактирования ────────────────────────────────────────────────

const FieldLabel = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 600, marginBottom: '4px' }}>
    {children}{required ? ' *' : ''}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', fontSize: '13px',
  borderRadius: '6px', border: '1px solid hsl(var(--border))',
  background: 'hsl(var(--background))', color: 'hsl(var(--foreground))',
  boxSizing: 'border-box',
};

const SelectField = ({
  label, value, onChange, options, required,
}: {
  label: string; value?: number | string; required?: boolean;
  onChange: (val: number | undefined) => void;
  options: DictItem[];
}) => (
  <div>
    <FieldLabel required={required}>{label}</FieldLabel>
    <select
      style={inputStyle}
      value={value ?? ''}
      onChange={e => onChange(e.target.value ? Number(e.target.value) : undefined)}
      required={required}
    >
      {!required && <option value="">Не выбрано</option>}
      {required && <option value="">Выберите...</option>}
      {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  </div>
);

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  payment:       PaymentRecord | null;
  onClose:       () => void;
  onActionDone?: () => void;
}

// ─── Состояние формы редактирования ──────────────────────────────────────────

interface EditState {
  category_id:         number;
  amount:              number;
  description:         string;
  planned_date:        string;
  legal_entity_id?:    number;
  contractor_id?:      number;
  department_id?:      number;
  service_id?:         number;
  invoice_number?:     string;
  invoice_date?:       string;
  recurrence_type:     string;
  recurrence_end_date?: string;
}

// ─── Компонент ────────────────────────────────────────────────────────────────

const PlannedPaymentDetailModal = ({ payment, onClose, onActionDone }: Props) => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [mode, setMode]       = useState<'view' | 'edit'>('view');
  const [saving, setSaving]   = useState(false);
  const [editState, setEdit]  = useState<EditState | null>(null);
  const [dicts, setDicts]     = useState<Dicts>({
    categories: [], legalEntities: [], contractors: [],
    customerDepartments: [], services: [], loaded: false,
  });

  // Сброс режима при смене платежа
  useEffect(() => { setMode('view'); }, [payment?.id]);

  const loadDicts = useCallback(async () => {
    if (!token || dicts.loaded) return;
    const [catR, leR, contrR, deptR, svcR] = await Promise.all([
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=categories`,           { headers: { 'X-Auth-Token': token } }),
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=legal-entities`,       { headers: { 'X-Auth-Token': token } }),
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=contractors`,          { headers: { 'X-Auth-Token': token } }),
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=customer-departments`, { headers: { 'X-Auth-Token': token } }),
      fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=services`,             { headers: { 'X-Auth-Token': token } }),
    ]);
    setDicts({
      categories:          catR.ok  ? await catR.json()   : [],
      legalEntities:       leR.ok   ? await leR.json()    : [],
      contractors:         contrR.ok ? await contrR.json() : [],
      customerDepartments: deptR.ok  ? await deptR.json()  : [],
      services:            svcR.ok   ? await svcR.json()   : [],
      loaded: true,
    });
  }, [token, dicts.loaded]);

  const enterEdit = async () => {
    if (!payment) return;
    await loadDicts();
    setEdit({
      category_id:         payment.category_id as number,
      amount:              payment.amount,
      description:         payment.description || '',
      planned_date:        String(payment.payment_date).slice(0, 10),
      legal_entity_id:     payment.department_id ? undefined : undefined, // заполняется ниже
      contractor_id:       (payment as Record<string, unknown>).contractor_id as number | undefined,
      department_id:       payment.department_id,
      service_id:          payment.service_id,
      invoice_number:      (payment as Record<string, unknown>).invoice_number as string | undefined,
      invoice_date:        (payment as Record<string, unknown>).invoice_date as string | undefined,
      recurrence_type:     (payment as Record<string, unknown>).recurrence_type as string || 'once',
      recurrence_end_date: (payment as Record<string, unknown>).recurrence_end_date as string | undefined,
    });

    // Точные id из исходных данных платежа
    setEdit(prev => prev ? {
      ...prev,
      legal_entity_id: (payment as Record<string, unknown>).legal_entity_id as number | undefined,
    } : prev);

    setMode('edit');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment || !editState || !token) return;
    setSaving(true);
    try {
      const body = {
        id:                  payment.id,
        category_id:         editState.category_id,
        amount:              editState.amount,
        description:         editState.description,
        planned_date:        editState.planned_date,
        legal_entity_id:     editState.legal_entity_id || null,
        contractor_id:       editState.contractor_id   || null,
        department_id:       editState.department_id   || null,
        service_id:          editState.service_id      || null,
        invoice_number:      editState.invoice_number  || null,
        invoice_date:        editState.invoice_date    || null,
        recurrence_type:     editState.recurrence_type || 'once',
        recurrence_end_date: editState.recurrence_end_date || null,
      };
      const res = await fetch(
        `${API_ENDPOINTS.main}?endpoint=planned-payments&id=${payment.id}`,
        { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token }, body: JSON.stringify(body) }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Не удалось сохранить');
      }
      toast({ title: 'Сохранено', description: 'Запланированный платёж обновлён' });
      setMode('view');
      onActionDone?.();
      onClose();
    } catch (err: unknown) {
      toast({ title: 'Ошибка', description: err instanceof Error ? err.message : 'Ошибка сохранения', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!payment) return null;

  const e = editState;
  const recType = (payment as Record<string, unknown>).recurrence_type as string;

  return (
    <Dialog open onOpenChange={v => { if (!v) { setMode('view'); onClose(); } }}>
      <DialogContent className="!flex !flex-col !gap-0 !p-0 w-[95vw]" style={{ maxWidth: '900px', overflow: 'hidden', maxHeight: '95dvh' }}>
        <DialogHeader style={{ padding: '18px 20px 0', flexShrink: 0 }}>
          <DialogTitle style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icon name="CalendarClock" size={16} style={{ color: '#ffb547', flexShrink: 0 }} />
            {mode === 'edit' ? 'Редактировать платёж' : `Запланированный платёж #${payment.id}`}
          </DialogTitle>
        </DialogHeader>

        {/* ── Режим просмотра ── */}
        {mode === 'view' && (
          <>
            <div style={{ padding: '14px 20px', overflowY: 'auto', flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Сумма */}
              <div style={{
                background: 'linear-gradient(135deg, #ffb54720 0%, #ff950010 100%)',
                border: '1px solid #ffb54740', borderRadius: '10px',
                padding: '14px 16px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>Сумма платежа</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: 'hsl(var(--foreground))' }}>{fmt(payment.amount)}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: '#6366f1', borderRadius: '4px', padding: '2px 6px' }}>
                    Запланированный
                  </span>
                  {recType && recType !== 'once' && (
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', background: '#0ea5e9', borderRadius: '4px', padding: '2px 6px' }}>
                      {REC_LABEL[recType] ?? recType}
                    </span>
                  )}
                </div>
              </div>

              {/* Детали */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <Row label="Дата платежа"    value={fmtDate(payment.payment_date as string)} />
                <Row label="Категория"        value={payment.category_name} />
                <Row label="Контрагент"       value={payment.contractor_name} />
                <Row label="Юридическое лицо" value={payment.legal_entity_name} />
                <Row label="Отдел-заказчик"   value={payment.department_name} />
                <Row label="Сервис"           value={payment.service_name} />
                {(payment as Record<string, unknown>).invoice_number && (
                  <Row label="Номер счёта" value={(payment as Record<string, unknown>).invoice_number as string} />
                )}
                {(payment as Record<string, unknown>).recurrence_end_date && (
                  <Row label="Повторять до" value={fmtDate((payment as Record<string, unknown>).recurrence_end_date as string)} />
                )}
              </div>

              {payment.description && (
                <div>
                  <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', fontWeight: 500, marginBottom: '4px' }}>Назначение</div>
                  <div style={{ fontSize: '13px', color: 'hsl(var(--foreground))', background: 'hsl(var(--muted))', borderRadius: '8px', padding: '10px 12px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                    {payment.description}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '12px 20px 18px', borderTop: '1px solid hsl(var(--border))', display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
              <Button
                onClick={enterEdit}
                style={{ flex: 1, minWidth: '100px', gap: '6px', background: '#ffb54720', color: '#ff9500', border: '1px solid #ffb54740' }}
                className="hover:bg-orange-500/20"
              >
                <Icon name="Pencil" size={15} />
                Редактировать
              </Button>
              <Button variant="outline" onClick={onClose} style={{ flexShrink: 0 }}>
                Закрыть
              </Button>
            </div>
          </>
        )}

        {/* ── Режим редактирования ── */}
        {mode === 'edit' && e && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', overflowY: 'auto', flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Категория + Сумма */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <SelectField
                  label="Категория" required
                  value={e.category_id}
                  onChange={val => setEdit(prev => prev ? { ...prev, category_id: val ?? prev.category_id } : prev)}
                  options={dicts.categories}
                />
                <div>
                  <FieldLabel required>Сумма (₽)</FieldLabel>
                  <input
                    type="number" step="0.01" required style={inputStyle}
                    value={e.amount}
                    onChange={ev => setEdit(prev => prev ? { ...prev, amount: Number(ev.target.value) } : prev)}
                  />
                </div>
              </div>

              {/* Назначение */}
              <div>
                <FieldLabel required>Назначение</FieldLabel>
                <input
                  type="text" required style={inputStyle}
                  value={e.description}
                  onChange={ev => setEdit(prev => prev ? { ...prev, description: ev.target.value } : prev)}
                />
              </div>

              {/* Дата + Юр. лицо */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <FieldLabel required>Дата платежа</FieldLabel>
                  <input
                    type="date" required style={inputStyle}
                    value={e.planned_date}
                    onChange={ev => setEdit(prev => prev ? { ...prev, planned_date: ev.target.value } : prev)}
                  />
                </div>
                <SelectField
                  label="Юридическое лицо"
                  value={e.legal_entity_id}
                  onChange={val => setEdit(prev => prev ? { ...prev, legal_entity_id: val } : prev)}
                  options={dicts.legalEntities}
                />
              </div>

              {/* Контрагент + Отдел */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <SelectField
                  label="Контрагент"
                  value={e.contractor_id}
                  onChange={val => setEdit(prev => prev ? { ...prev, contractor_id: val } : prev)}
                  options={dicts.contractors}
                />
                <SelectField
                  label="Отдел-заказчик"
                  value={e.department_id}
                  onChange={val => setEdit(prev => prev ? { ...prev, department_id: val } : prev)}
                  options={dicts.customerDepartments}
                />
              </div>

              {/* Сервис */}
              <SelectField
                label="Сервис"
                value={e.service_id}
                onChange={val => setEdit(prev => prev ? { ...prev, service_id: val } : prev)}
                options={dicts.services}
              />

              {/* Номер счёта + Дата счёта */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <FieldLabel>Номер счёта</FieldLabel>
                  <input
                    type="text" style={inputStyle}
                    value={e.invoice_number || ''}
                    onChange={ev => setEdit(prev => prev ? { ...prev, invoice_number: ev.target.value } : prev)}
                  />
                </div>
                <div>
                  <FieldLabel>Дата счёта</FieldLabel>
                  <input
                    type="date" style={inputStyle}
                    value={e.invoice_date?.slice(0, 10) || ''}
                    onChange={ev => setEdit(prev => prev ? { ...prev, invoice_date: ev.target.value } : prev)}
                  />
                </div>
              </div>

              {/* Повторение */}
              <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.18)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <Icon name="Repeat" size={14} style={{ color: '#0ea5e9' }} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0ea5e9' }}>Повторение</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <FieldLabel>Тип повторения</FieldLabel>
                    <select
                      style={inputStyle}
                      value={e.recurrence_type || 'once'}
                      onChange={ev => setEdit(prev => prev ? {
                        ...prev,
                        recurrence_type: ev.target.value,
                        recurrence_end_date: ev.target.value === 'once' ? undefined : prev.recurrence_end_date,
                      } : prev)}
                    >
                      <option value="once">Однократно</option>
                      <option value="weekly">Еженедельно</option>
                      <option value="monthly">Ежемесячно</option>
                      <option value="yearly">Ежегодно</option>
                    </select>
                  </div>
                  {e.recurrence_type && e.recurrence_type !== 'once' && (
                    <div>
                      <FieldLabel>Дата окончания</FieldLabel>
                      <input
                        type="date" style={inputStyle}
                        value={e.recurrence_end_date?.slice(0, 10) || ''}
                        onChange={ev => setEdit(prev => prev ? { ...prev, recurrence_end_date: ev.target.value } : prev)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div style={{ padding: '12px 20px 18px', borderTop: '1px solid hsl(var(--border))', display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
              <Button
                type="submit"
                disabled={saving}
                style={{ flex: 1, minWidth: '100px', gap: '6px', background: '#ff9500', color: '#fff' }}
                className="hover:bg-orange-600"
              >
                {saving && <Icon name="Loader2" size={14} style={{ animation: 'spin 0.7s linear infinite' }} />}
                Сохранить
              </Button>
              <Button
                type="button" variant="outline"
                onClick={() => setMode('view')}
                disabled={saving}
                style={{ flexShrink: 0 }}
              >
                Отмена
              </Button>
            </div>
          </form>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </DialogContent>
    </Dialog>
  );
};

export default PlannedPaymentDetailModal;