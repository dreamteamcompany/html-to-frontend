import { useMemo, useState, useEffect, useCallback } from 'react';
import { usePaymentsCache, PaymentRecord } from '@/contexts/PaymentsCacheContext';
import { usePeriod } from '@/contexts/PeriodContext';
import { exportDrillDownToExcel } from '@/utils/exportExcel';
import type { SortField, SortDir } from './drillDownTypes';
import DrillDownHeader from './DrillDownHeader';
import DrillDownToolbar from './DrillDownToolbar';
import DrillDownTable from './DrillDownTable';
import { parsePaymentDate } from './dashboardUtils';

export type { DrillDownFilter } from './drillDownTypes';
import type { DrillDownFilter } from './drillDownTypes';

interface Props {
  filter: DrillDownFilter | null;
  onClose: () => void;
}

const DrillDownModal = ({ filter, onClose }: Props) => {
  const { payments: allPayments } = usePaymentsCache();
  const { getDateRange } = usePeriod();
  const [sortField, setSortField] = useState<SortField>('payment_date');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!filter) return;
    setSearch('');
    setSortField('payment_date');
    setSortDir('asc');
  }, [filter]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const filtered = useMemo(() => {
    if (!filter) return [];
    const { from, to } = getDateRange();

    return (Array.isArray(allPayments) ? allPayments : []).filter((p: PaymentRecord) => {
      if (p.status !== 'approved') return false;
      if (!p.payment_date) return false;
      const raw = String(p.payment_date);
      const d = new Date(raw.includes('T') ? raw : raw + 'T00:00:00');
      if (d < from || d > to) return false;

      switch (filter.type) {
        case 'category':
          return (p.category_name || 'Без категории') === filter.value;
        case 'contractor':
          return (p.contractor_name || 'Без контрагента') === filter.value;
        case 'service':
          return (p.service_name || 'Без сервиса') === filter.value;
        case 'department':
          return (p.department_name || 'Без отдела') === filter.value;
        case 'legal_entity':
          return (p.legal_entity_name || 'Без юр. лица') === filter.value;
        case 'payment_type': {
          const isCashPayment = p.payment_type === 'cash' || p.legal_entity_name === 'Наличные';
          if (filter.value === 'cash') return isCashPayment;
          return !isCashPayment;
        }
        case 'date': {
          const dateKey = raw.slice(0, 10);
          const fv = filter.value;
          if (fv.includes('T')) {
            const [datePart, timePart] = fv.split('T');
            const hour = timePart.slice(0, 2);
            const pHour = String(d.getHours()).padStart(2, '0');
            return dateKey === datePart && pHour === hour;
          }
          return dateKey === fv || dateKey.startsWith(fv);
        }
        case 'other': {
          if (!filter.otherValues || !filter.otherField) return false;
          const fieldVal = (p[filter.otherField] as string | undefined) || '';
          return filter.otherValues.includes(fieldVal);
        }
        case 'all':
          return true;
        default:
          return true;
      }
    });
  }, [filter, allPayments, getDateRange]);

  const sorted = useMemo(() => {
    const q = search.toLowerCase();
    const base = q
      ? filtered.filter(p =>
          [p.description, p.service_name, p.category_name, p.contractor_name, p.department_name]
            .some(v => v?.toLowerCase().includes(q))
        )
      : filtered;

    return [...base].sort((a, b) => {
      if (sortField === 'amount') {
        return sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      const da = parsePaymentDate(a.payment_date).getTime();
      const db = parsePaymentDate(b.payment_date).getTime();
      return sortDir === 'asc' ? da - db : db - da;
    });
  }, [filtered, sortField, sortDir, search]);

  const total = useMemo(() => sorted.reduce((s, p) => s + p.amount, 0), [sorted]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const handleExport = () => {
    if (exporting || sorted.length === 0 || !filter) return;
    setExporting(true);
    try {
      exportDrillDownToExcel(sorted, filter.label);
    } finally {
      setTimeout(() => setExporting(false), 800);
    }
  };

  const isLight = document.documentElement.classList.contains('light');

  if (!filter) return null;

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
        maxWidth: isMobile ? '100%' : '900px',
        maxHeight: isMobile ? '92vh' : '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
        overflow: 'hidden',
      }}>
        <DrillDownHeader
          label={filter.label}
          serviceLabel={filter.serviceLabel}
          count={sorted.length}
          total={total}
          isMobile={isMobile}
          onClose={onClose}
        />
        <DrillDownToolbar
          search={search}
          onSearchChange={setSearch}
          sortField={sortField}
          sortDir={sortDir}
          onToggleSort={toggleSort}
          exporting={exporting}
          hasItems={sorted.length > 0}
          onExport={handleExport}
          isMobile={isMobile}
        />
        <DrillDownTable
          sorted={sorted}
          total={total}
          isMobile={isMobile}
          isLight={isLight}
        />
      </div>
    </div>
  );
};

export default DrillDownModal;