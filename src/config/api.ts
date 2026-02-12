export const API_ENDPOINTS = {
  main: 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd',
  payments: 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd?endpoint=payments',
} as const;

export const getApiUrl = (endpoint: string): string => {
  return `${API_ENDPOINTS.main}?endpoint=${endpoint}`;
};