export const API_ENDPOINTS = {
  // Main API (все endpoints объединены в одном)
  main: 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd',
} as const;

export const getApiUrl = (endpoint: string): string => {
  // Payments endpoint без query parameter
  if (endpoint === 'payments') {
    return `${API_ENDPOINTS.main}?endpoint=payments`;
  }
  
  // Все остальные endpoints идут через main API
  return `${API_ENDPOINTS.main}?endpoint=${endpoint}`;
};