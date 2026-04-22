import { ReactNode } from 'react';

type MaxWidth = '1200px' | '1400px';
type Variant = 'sheet' | 'center' | 'center-auto';

interface DetailsModalShellProps {
  /** Содержимое шапки целиком (заголовок + доп. кнопки + крестик закрытия). */
  header: ReactNode;
  /** Тело модалки — обычно две колонки. */
  children: ReactNode;
  /** Максимальная ширина контейнера. */
  maxWidth?: MaxWidth;
  /**
   * sheet — на мобилке выезжает снизу (rounded-t-2xl, items-end), высота зависит от контента;
   * center — центрированный диалог с фиксированной высотой (95vh на мобилке, 90vh на десктопе);
   * center-auto — центрированный диалог, высота по контенту с ограничением max-h (95vh / 90vh).
   */
  variant?: Variant;
}

/**
 * Общая обёртка для модалок «Детали платежа».
 * Отвечает ТОЛЬКО за структуру: оверлей, контейнер, шапка-контейнер (flex-shrink-0)
 * и тело с корректным мобильным/десктопным скроллом.
 *
 * Содержимое шапки (заголовок, кнопки действий, кнопка закрытия) и колонок
 * передаётся через пропсы, чтобы не менять поведение каждой модалки.
 */
const DetailsModalShell = ({
  header,
  children,
  maxWidth = '1200px',
  variant = 'center',
}: DetailsModalShellProps) => {
  const overlayClass =
    variant === 'sheet'
      ? 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50'
      : 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50';

  const maxWidthClass = maxWidth === '1400px' ? 'max-w-[1400px]' : 'max-w-[1200px]';

  let containerClass: string;
  if (variant === 'sheet') {
    containerClass = `bg-card border border-border sm:rounded-xl rounded-t-2xl w-full ${maxWidthClass} h-[95dvh] sm:h-auto sm:max-h-[90vh] flex flex-col`;
  } else if (variant === 'center-auto') {
    containerClass = `bg-card border border-border rounded-xl w-full ${maxWidthClass} max-h-[95vh] sm:max-h-[90vh] flex flex-col`;
  } else {
    containerClass = `bg-card border border-border rounded-xl w-full ${maxWidthClass} h-[95vh] sm:h-[90vh] flex flex-col`;
  }

  return (
    <div className={overlayClass}>
      <div className={containerClass}>
        <div className="bg-card border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 flex-shrink-0">
          {header}
        </div>

        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DetailsModalShell;