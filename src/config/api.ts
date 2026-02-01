export const API_ENDPOINTS = {
  // Auth API
  auth: 'https://functions.poehali.dev/cc3b9628-07ec-420e-b340-1c20cad986da',
  
  // Payments API
  payments: 'https://functions.poehali.dev/7f682e02-1640-40e7-8e2a-7a4e7723b309',
  
  // Main API (все остальные endpoints)
  main: 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd',
} as const;

export const getApiUrl = (endpoint: 'login' | 'me' | 'health' | 'payments' | string): string => {
  if (endpoint === 'login' || endpoint === 'me' || endpoint === 'health') {
    return `${API_ENDPOINTS.auth}?endpoint=${endpoint}`;
  }
  
  if (endpoint === 'payments') {
    return API_ENDPOINTS.payments;
  }
  
  return `${API_ENDPOINTS.main}?endpoint=${endpoint}`;
};
