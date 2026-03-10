import Icon from '@/components/ui/icon';
import { Payment, PaymentView } from './paymentDetailsTypes';

interface PaymentDetailsInfoProps {
  payment: Payment;
  views: PaymentView[];
  isPlannedPayment?: boolean;
  onEdit?: (payment: Payment) => void;
}

const PaymentDetailsInfo = ({ payment, views, isPlannedPayment, onEdit }: PaymentDetailsInfoProps) => {
  return (
    <div className="w-full lg:w-1/2 lg:border-r border-white/10 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="bg-primary/20 p-2 sm:p-3 rounded-lg">
          <Icon name={payment.category_icon} size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-base sm:text-lg font-medium mb-1">{payment.category_name}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-primary">{payment.amount.toLocaleString('ru-RU')} ₽</p>
        </div>
      </div>

      {views.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <div className="flex items-center gap-1.5 w-full mb-1">
            <Icon name="Eye" size={14} className="text-primary" />
            <span className="text-xs font-medium text-primary">Просмотрено</span>
          </div>
          {views.map((v) => (
            <div
              key={v.user_id}
              className="flex items-center gap-1.5 bg-primary/15 rounded-full px-2.5 py-1"
              title={new Date(v.viewed_at).toLocaleString('ru-RU')}
            >
              <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center text-[10px] font-bold text-primary">
                {v.full_name.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-foreground">{v.full_name}</span>
              <span className="text-[10px] text-muted-foreground">
                {new Date(v.viewed_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      )}

      {payment.rejection_comment && payment.status === 'rejected' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Icon name="AlertCircle" size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-300 mb-1">Причина отклонения</p>
              <p className="text-sm text-red-200">{payment.rejection_comment}</p>
              {payment.rejected_at && (
                <p className="text-xs text-red-300/70 mt-2">
                  {new Date(payment.rejected_at).toLocaleString('ru-RU')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {payment.description && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Описание</p>
          <p className="font-medium">{payment.description}</p>
        </div>
      )}

      {payment.category_name && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Категория</p>
          <div className="flex items-center gap-2 font-medium">
            <Icon name={payment.category_icon || 'Tag'} size={18} />
            {payment.category_name}
          </div>
        </div>
      )}

      {payment.legal_entity_name && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Юридическое лицо</p>
          <p className="font-medium">{payment.legal_entity_name}</p>
        </div>
      )}

      {payment.contractor_name && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Контрагент</p>
          <p className="font-medium">{payment.contractor_name}</p>
        </div>
      )}

      {payment.department_name && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Отдел-заказчик</p>
          <p className="font-medium">{payment.department_name}</p>
        </div>
      )}

      {(isPlannedPayment || payment.is_planned) && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Запланированный платеж</p>
          <div className="flex items-center gap-2 font-medium text-blue-300">
            <Icon name="CalendarClock" size={18} />
            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('ru-RU', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            }) : 'Дата не указана'}
          </div>
        </div>
      )}

      {payment.service_name && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Сервис</p>
          <p className="font-medium">{payment.service_name}</p>
          {payment.service_description && (
            <p className="text-sm text-muted-foreground mt-1">{payment.service_description}</p>
          )}
        </div>
      )}

      {payment.invoice_number && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Номер счёта</p>
          <p className="font-medium">{payment.invoice_number}</p>
        </div>
      )}

      {payment.created_by_name && (
        <div>
          <p className="text-sm text-muted-foreground mb-1">Создал заявку</p>
          <p className="font-medium">{payment.created_by_name}</p>
        </div>
      )}

      {payment.custom_fields && payment.custom_fields.length > 0 && (
        <>
          {payment.custom_fields.map((field) => (
            <div key={field.id}>
              <p className="text-sm text-muted-foreground mb-1">{field.name}</p>
              {field.field_type === 'file' && field.value ? (
                <div className="rounded-lg border border-white/10 p-3 bg-primary/5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon name="FileText" size={16} className="text-primary flex-shrink-0" />
                      <span className="text-sm font-medium truncate">
                        {field.value.split('/').pop()?.split('_').slice(2).join('_') || 'Файл'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={field.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Icon name="Eye" size={14} />
                        Просмотр
                      </a>
                      <a
                        href={field.value}
                        download
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <Icon name="Download" size={14} />
                        Скачать
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="font-medium">{field.value}</p>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default PaymentDetailsInfo;
