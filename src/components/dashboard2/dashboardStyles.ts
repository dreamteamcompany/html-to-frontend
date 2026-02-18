// Единая типографика для всех компонентов Dashboard2
// Все тексты приведены к единому размеру text-sm
export const dashboardTypography = {
  // Заголовки карточек
  cardTitle: 'text-sm font-bold',
  
  // Подзаголовки / описания
  cardSubtitle: 'text-sm font-medium text-[#a3aed0]',
  
  // Основные цифры / метрики
  cardValue: 'text-xl font-extrabold',
  
  // Вторичный текст
  cardSecondary: 'text-sm font-medium text-[#a3aed0]',
  
  // Статус / бейджи
  cardBadge: 'text-sm font-semibold',
  
  // Мелкий текст (labels, hints)
  cardSmall: 'text-sm font-medium text-[#a3aed0]',
  
  // Очень мелкий текст
  cardTiny: 'text-sm font-medium text-[#a3aed0]',
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