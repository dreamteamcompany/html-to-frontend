import { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { usePeriod } from '@/contexts/PeriodContext';
import { API_ENDPOINTS } from '@/config/api';
import { exportSavingsToExcel } from '@/utils/exportExcel';

interface SavingsItem {
  id: number;
  created_at: string;
  amount: number;
  description: string;
  department_name: string;
  service_name: string;
  frequency: string;
  currency: string;
  saving_reason_name: string;
  employee_name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

type SortField = 'created_at' | 'amount';
type SortDir = 'asc' | 'desc';

const FREQUENCY_LABEL: Record<string, string> = {
  once: 'Единоразово',
  monthly: 'Ежемесячно',
  yearly: 'Ежегодно',
  quarterly: 'Ежеквартально',
};

const fmt = (v: number) =>
  new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v).replace(/,/g, '.') + ' ₽';

const fmtDate = (s: string) => {
  const d = new Date(s);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
};

const SavingsDrillModal = ({ open, onClose }: Props) => {
  const { token } = useAuth();
  const { getDateRange, period, dateFrom, dateTo } = usePeriod();
  const [items, setItems] = useState<SavingsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [isMobile, setIsMobile] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!open || !token) return;
    setSearch('');
    setSortField('created_at');
    setSortDir('desc');

    const { from, to } = getDateRange();
    setLoading(true);
    const params = new URLSearchParams({
      startDate: from.toISOString(),
      endDate: to.toISOString(),
    });
    fetch(`${API_ENDPOINTS.main}?endpoint=savings-list&${params}`, {
      headers: { 'X-Auth-Token': token },
    })
      .then(r => r.ok ? r.json() : { items: [], total: 0 })
      .then(data => {
        setItems(Array.isArray(data.items) ? data.items : []);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open, token, period, dateFrom, dateTo]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    const base = q
      ? items.filter(p =>
          [p.description, p.department_name, p.service_name, p.saving_reason_name, p.employee_name]
            .some(v => v?.toLowerCase().includes(q))
        )
      : items;
    return [...base].sort((a, b) => {
      if (sortField === 'amount') {
        return sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortDir === 'asc' ? da - db : db - da;
    });
  }, [items, search, sortField, sortDir]);

  const filteredTotal = useMemo(() => sorted.reduce((s, p) => s + p.amount, 0), [sorted]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleExport = () => {
    if (exporting || sorted.length === 0) return;
    setExporting(true);
    try {
      exportSavingsToExcel(sorted, 'Реестр_экономии');
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Icon name="ChevronsUpDown" size={12} />;
    return <Icon name={sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={12} />;
  };

  if (!open) return null;

  const DESKTOP_COLS = '1fr 1.4fr 1fr 1fr 110px 110px 1fr';

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center',
        padding: isMobile ? '0' : '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        borderRadius: isMobile ? '20px 20px 0 0' : '20px',
        width: '100%',
        maxWidth: isMobile ? '100%' : '1100px',
        maxHeight: isMobile ? '92vh' : '90vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        overflow: 'hidden',
      }}>

        {/* HEADER */}
        <div style={{
          padding: isMobile ? '16px' : '20px 24px',
          borderBottom: '1px solid hsl(var(--border))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0, background: 'rgba(1,181,116,0.06)', gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(1,181,116,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon name="PiggyBank" size={16} style={{ color: '#01b574' }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: isMobile ? '14px' : '16px', fontWeight: 700,
                color: 'hsl(var(--foreground))',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                Детализация: <span style={{ color: '#01b574' }}>Реестр экономии</span>
              </div>
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
                {loading ? 'Загрузка...' : `${sorted.length} записей · Итого: `}
                {!loading && <span style={{ color: '#01b574', fontWeight: 700 }}>{fmt(filteredTotal)}</span>}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {!loading && sorted.length > 0 && (
              <button
                onClick={handleExport}
                disabled={exporting}
                title="Экспорт в Excel"
                style={{
                  height: '34px', borderRadius: '8px', padding: '0 12px',
                  border: '1px solid rgba(1,181,116,0.4)',
                  background: exporting ? 'rgba(1,181,116,0.1)' : 'rgba(1,181,116,0.08)',
                  cursor: exporting ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  color: '#01b574', fontSize: '12px', fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                <Icon name={exporting ? 'Loader2' : 'Download'} size={14} />
                {!isMobile && (exporting ? 'Экспорт...' : 'Excel')}
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                width: '34px', height: '34px', borderRadius: '8px',
                border: '1px solid hsl(var(--border))', background: 'transparent',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'hsl(var(--muted-foreground))',
              }}
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div style={{ padding: isMobile ? '12px' : '12px 24px', borderBottom: '1px solid hsl(var(--border))', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Icon name="Search" size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по описанию, отделу, сервису, причине, автору..."
              style={{
                width: '100%', paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px',
                borderRadius: '8px', border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))',
                fontSize: '13px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* TABLE HEADER — desktop only */}
        {!isMobile && (
          <div style={{
            display: 'grid', gridTemplateColumns: DESKTOP_COLS,
            padding: '8px 24px', gap: '12px', flexShrink: 0,
            borderBottom: '1px solid hsl(var(--border))',
            background: 'hsl(var(--muted))',
          }}>
            {[
              { label: 'Сервис', field: null },
              { label: 'Описание', field: null },
              { label: 'Отдел', field: null },
              { label: 'Причина', field: null },
              { label: 'Сумма', field: 'amount' as SortField },
              { label: 'Эквивалент', field: null },
              { label: 'Автор', field: null },
            ].map(col => (
              <div
                key={col.label}
                onClick={() => col.field && toggleSort(col.field)}
                style={{
                  fontSize: '11px', fontWeight: 600, color: 'hsl(var(--muted-foreground))',
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                  cursor: col.field ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center', gap: '4px',
                  userSelect: 'none',
                }}
              >
                {col.label}
                {col.field && <SortIcon field={col.field} />}
              </div>
            ))}
          </div>
        )}

        {/* BODY */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(1,181,116,0.2)', borderTopColor: '#01b574', animation: 'spin 0.8s linear infinite' }} />
            </div>
          ) : sorted.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '8px' }}>
              <Icon name="PiggyBank" size={40} style={{ color: 'hsl(var(--muted-foreground))', opacity: 0.4 }} />
              <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>Нет записей за выбранный период</div>
            </div>
          ) : isMobile ? (
            /* MOBILE: карточки */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
              {sorted.map(item => (
                <div key={item.id} style={{
                  background: 'hsl(var(--muted))', borderRadius: '12px',
                  padding: '12px', border: '1px solid hsl(var(--border))',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ minWidth: 0 }}>
                      {item.service_name && (
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.service_name}</div>
                      )}
                      {item.description && (
                        <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{item.description}</div>
                      )}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#01b574', flexShrink: 0 }}>{fmt(item.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {item.department_name && item.department_name !== 'Не указан' && (
                      <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '5px', background: 'rgba(1,181,116,0.1)', color: '#01b574' }}>{item.department_name}</span>
                    )}
                    {item.saving_reason_name && (
                      <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '5px', background: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>{item.saving_reason_name}</span>
                    )}
                    {item.frequency && (
                      <span style={{ fontSize: '11px', padding: '2px 7px', borderRadius: '5px', background: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>{FREQUENCY_LABEL[item.frequency] || item.frequency}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{item.employee_name}</span>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{fmtDate(item.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* DESKTOP: таблица */
            <div>
              {sorted.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid', gridTemplateColumns: DESKTOP_COLS,
                    padding: '12px 24px', gap: '12px', alignItems: 'center',
                    borderBottom: '1px solid hsl(var(--border))',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(1,181,116,0.02)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(1,181,116,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(1,181,116,0.02)')}
                >
                  {/* Сервис */}
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'hsl(var(--foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.service_name || <span style={{ color: 'hsl(var(--muted-foreground))' }}>—</span>}
                  </div>
                  {/* Описание */}
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description || <span>—</span>}
                  </div>
                  {/* Отдел */}
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.department_name && item.department_name !== 'Не указан' ? item.department_name : <span style={{ opacity: 0.4 }}>—</span>}
                  </div>
                  {/* Причина */}
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.saving_reason_name || <span style={{ opacity: 0.4 }}>—</span>}
                  </div>
                  {/* Сумма */}
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#01b574', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    {fmt(item.amount)}
                  </div>
                  {/* Эквивалент */}
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap' }}>
                    {FREQUENCY_LABEL[item.frequency] || item.frequency || <span style={{ opacity: 0.4 }}>—</span>}
                  </div>
                  {/* Автор */}
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.employee_name || <span style={{ opacity: 0.4 }}>—</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}
        {!loading && sorted.length > 0 && (
          <div style={{
            padding: isMobile ? '12px' : '14px 24px',
            borderTop: '1px solid hsl(var(--border))',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexShrink: 0, background: 'hsl(var(--card))',
          }}>
            <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
              {sorted.length} {sorted.length === 1 ? 'запись' : sorted.length < 5 ? 'записи' : 'записей'}
              {search && ` (из ${items.length})`}
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#01b574' }}>
              Итого: {fmt(filteredTotal)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsDrillModal;
