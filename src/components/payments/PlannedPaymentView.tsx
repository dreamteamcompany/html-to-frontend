import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { PlannedPayment, fmt, fmtDate, recurrenceLabel } from './PlannedPaymentTypes';
import { InfoRow } from './PlannedPaymentSharedFields';

interface PlannedPaymentViewProps {
  payment: PlannedPayment;
  isAdmin: boolean;
  onEditStart: () => void;
  onDeleteRequest: () => void;
}

const PlannedPaymentView = ({ payment, isAdmin, onEditStart, onDeleteRequest }: PlannedPaymentViewProps) => (
  <div className="space-y-4 mt-1">
    <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <Icon name={payment.category_icon || 'Calendar'} size={18} className="text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold break-words">{payment.description || '—'}</p>
        <p className="text-xs text-muted-foreground break-words">{payment.category_name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-lg font-bold text-primary whitespace-nowrap">{fmt(payment.amount)}</p>
        {payment.recurrence_type && payment.recurrence_type !== 'once' && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300">
            {recurrenceLabel[payment.recurrence_type] ?? payment.recurrence_type}
          </span>
        )}
      </div>
    </div>

    <div className="px-1">
      <InfoRow label="Дата платежа"     value={fmtDate(payment.planned_date)} />
      <InfoRow label="Юридическое лицо" value={payment.legal_entity_name} />
      <InfoRow label="Контрагент"        value={payment.contractor_name} />
      <InfoRow label="Отдел-заказчик"   value={payment.department_name} />
      <InfoRow label="Сервис"            value={payment.service_name} />
      <InfoRow label="Номер счёта"       value={payment.invoice_number} />
      <InfoRow label="Дата счёта"        value={payment.invoice_date ? fmtDate(payment.invoice_date) : undefined} />
      {payment.recurrence_end_date && (
        <InfoRow label="Повторять до"    value={fmtDate(payment.recurrence_end_date)} />
      )}
      {payment.converted_at && (
        <InfoRow label="Создан платёж"  value={fmtDate(payment.converted_at)} />
      )}
    </div>

    <div className="flex gap-2 pt-2 border-t border-border">
      <Button variant="outline" className="flex-1 gap-2" onClick={onEditStart}>
        <Icon name="Pencil" size={15} />
        Редактировать
      </Button>
      {isAdmin && (
        <Button
          variant="outline"
          className="gap-2 text-red-700 dark:text-red-300 border-red-400/30 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300"
          onClick={onDeleteRequest}
        >
          <Icon name="Trash2" size={15} />
          Удалить
        </Button>
      )}
    </div>
  </div>
);

export default PlannedPaymentView;