// Единая типографика для всех компонентов Dashboard2
export const dashboardTypography = {
  // Заголовки карточек
  cardTitle: 'text-base sm:text-lg font-bold',
  
  // Подзаголовки / описания
  cardSubtitle: 'text-xs sm:text-sm font-medium text-[#a3aed0]',
  
  // Основные цифры / метрики
  cardValue: 'text-2xl sm:text-3xl font-extrabold',
  
  // Вторичный текст
  cardSecondary: 'text-xs sm:text-sm font-medium text-[#a3aed0]',
  
  // Статус / бейджи
  cardBadge: 'text-xs sm:text-sm font-semibold',
  
  // Мелкий текст (labels, hints)
  cardSmall: 'text-[10px] sm:text-xs font-medium text-[#a3aed0]',
  
  // Очень мелкий текст
  cardTiny: 'text-[8px] sm:text-[10px] font-medium text-[#a3aed0]',
} as const;

// Цвета для единообразия
export const dashboardColors = {
  textPrimary: '#fff',
  textSecondary: '#a3aed0',
  textMuted: '#8f9bba',
  
  purple: '#7551e9',
  blue: '#3965ff',
  green: '#01b574',
  orange: '#ffb547',
  red: '#ff6b6b',
  cyan: '#2CD9FF',
} as const;
