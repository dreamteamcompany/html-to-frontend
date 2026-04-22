import { useState, useMemo } from 'react';
import Icon from '@/components/ui/icon';
import { Payment } from '@/types/payment';

export type SortKey = 'category' | 'service' | 'legal_entity' | 'description' | 'amount' | 'status' | 'date';
export type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<string, number> = {
  draft: 0, pending_ib: 1, pending_cfo: 2, pending_ceo: 3,
  approved: 4, rejected: 5, revoked: 6,
};

const cmp = (a: string, b: string) => a.localeCompare(b, 'ru');

export const sortPayments = (list: Payment[], key: SortKey, dir: SortDir): Payment[] => {
  const sorted = [...list].sort((a, b) => {
    let r = 0;
    switch (key) {
      case 'category':
        r = cmp(a.category_name || '', b.category_name || '');
        break;
      case 'service':
        r = cmp(a.service_name || '', b.service_name || '');
        break;
      case 'legal_entity':
        r = cmp(a.legal_entity_name || '', b.legal_entity_name || '');
        break;
      case 'description':
        r = cmp(a.description || '', b.description || '');
        break;
      case 'amount':
        r = (a.amount || 0) - (b.amount || 0);
        break;
      case 'status':
        r = (STATUS_ORDER[a.status || 'draft'] ?? 99) - (STATUS_ORDER[b.status || 'draft'] ?? 99);
        break;
      case 'date': {
        const da = new Date(a.planned_date || a.payment_date || 0).getTime();
        const db = new Date(b.planned_date || b.payment_date || 0).getTime();
        r = da - db;
        break;
      }
    }
    return r;
  });
  return dir === 'desc' ? sorted.reverse() : sorted;
};

export const usePaymentsSorting = (payments: Payment[]) => {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(
    () => sortKey ? sortPayments(payments, sortKey, sortDir) : payments,
    [payments, sortKey, sortDir],
  );

  return { sortKey, sortDir, sorted, handleSort };
};

interface SortHeaderProps {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey | null;
  dir: SortDir;
  onClick: (k: SortKey) => void;
}

export const SortHeader = ({ label, sortKey, activeKey, dir, onClick }: SortHeaderProps) => {
  const active = activeKey === sortKey;
  return (
    <th
      className="text-left p-4 text-xs font-semibold uppercase tracking-wide text-foreground/70 select-none cursor-pointer hover:text-foreground transition-colors"
      onClick={() => onClick(sortKey)}
    >
      <div className="flex items-center gap-1.5">
        {label}
        <span style={{ opacity: active ? 1 : 0.3, transition: 'opacity 0.15s' }}>
          <Icon
            name={active ? (dir === 'asc' ? 'ArrowUp' : 'ArrowDown') : 'ArrowUpDown'}
            size={13}
          />
        </span>
      </div>
    </th>
  );
};
