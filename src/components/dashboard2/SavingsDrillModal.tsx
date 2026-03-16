import { useState, useEffect, useCallback, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { usePeriod } from '@/contexts/PeriodContext';
import { API_ENDPOINTS } from '@/config/api';

interface SavingsItem {
  id: number;
  created_at: string;
  amount: number;
  description: string;
  department_name: string;
  service_name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

type SortField = 'created_at' | 'amount';
type SortDir = 'asc' | 'desc';

const fmt = (v: number) =>
  new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v).replace(/,/g, '.') + ' ₽';

const fmtDate = (s: string) => {
  const d = new Date(s);
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
};

const SavingsDrillModal = ({ open, onClose }: Props) => {
  const { token } = useAuth();
  const { getDateRange } = usePeriod();
  const [items, setItems] = useState<SavingsItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [isMobile, setIsMobile] = useState(false);

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
        setTotal(data.total ?? 0);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open, token]);

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
          [p.description, p.department_name, p.service_name]
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

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <Icon name="ChevronsUpDown" size={12} />;
    return <Icon name={sortDir === 'asc' ? 'ChevronUp' : 'ChevronDown'} size={12} />;
  };

  if (!open) return null;

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
        maxWidth: isMobile ? '100%' : '860px',
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
          <button
            onClick={onClose}
            style={{
              width: '34px', height: '34px', borderRadius: '8px',
              border: '1px solid hsl(var(--border))', background: 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'hsl(var(--muted-foreground))', flexShrink: 0,
            }}
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* SEARCH */}
        <div style={{ padding: isMobile ? '12px' : '12px 24px', borderBottom: '1px solid hsl(var(--border))', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <Icon name="Search" size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по описанию, отделу..."
              style={{
                width: '100%', paddingLeft: '32px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px',
                borderRadius: '8px', border: '1px solid hsl(var(--border))',
                background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))',
                fontSize: '13px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* TABLE HEADER */}
        {!isMobile && (
          <div style={{
            display: 'grid', gridTemplateColumns: '130px 1fr 1fr 140px',
            padding: '8px 24px', gap: '12px', flexShrink: 0,
            borderBottom: '1px solid hsl(var(--border))',
            background: 'hsl(var(--muted))',
          }}>
            {[
              { label: 'Дата', field: 'created_at' as SortField },
              { label: 'Описание', field: null },
              { label: 'Отдел', field: null },
              { label: 'Сумма', field: 'amount' as SortField },
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px' }}>
              {sorted.map(item => (
                <div key={item.id} style={{
                  background: 'hsl(var(--muted))', borderRadius: '12px',
                  padding: '12px', border: '1px solid hsl(var(--border))',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{fmtDate(item.created_at)}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#01b574' }}>{fmt(item.amount)}</span>
                  </div>
                  {item.description && (
                    <div style={{ fontSize: '12px', color: 'hsl(var(--foreground))', marginBottom: '4px' }}>{item.description}</div>
                  )}
                  <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{item.department_name}</div>
                </div>
              ))}
            </div>
          ) : (
            <div>
              {sorted.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '130px 1fr 1fr 140px',
                    padding: '12px 24px', gap: '12px', alignItems: 'center',
                    borderBottom: '1px solid hsl(var(--border))',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(1,181,116,0.02)',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(1,181,116,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(1,181,116,0.02)')}
                >
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                    {fmtDate(item.created_at)}
                  </div>
                  <div style={{ fontSize: '13px', color: 'hsl(var(--foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.description || <span style={{ color: 'hsl(var(--muted-foreground))' }}>—</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.department_name}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#01b574', textAlign: 'right' }}>
                    {fmt(item.amount)}
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
