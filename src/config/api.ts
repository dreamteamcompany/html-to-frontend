export const API_ENDPOINTS = {
  // Auth API
  auth: 'https://functions.poehali.dev/cc3b9628-07ec-420e-b340-1c20cad986da',
  
  // Payments API
  payments: 'https://functions.poehali.dev/7f682e02-1640-40e7-8e2a-7a4e7723b309',
  
  // Dictionaries API
  dictionaries: 'https://functions.poehali.dev/4bd5899c-9f5b-4ac9-866e-8f4236f5c09c',
  
  // Tickets API
  tickets: 'https://functions.poehali.dev/36ca4c35-8625-4e62-b383-d5feac4de266',
  
  // Main API (все остальные endpoints)
  main: 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd',
} as const;

const DICTIONARY_ENDPOINTS = [
  'categories', 'legal-entities', 'contractors', 
  'customer-departments', 'customer_departments', 'departments',
  'services', 'custom-fields'
];

const TICKET_ENDPOINTS = [
  'tickets', 'tickets-api', 'ticket-dictionaries-api', 
  'ticket-comments-api', 'ticket-history'
];

export const getApiUrl = (endpoint: string): string => {
  // Auth endpoints
  if (endpoint === 'login' || endpoint === 'me' || endpoint === 'health') {
    return `${API_ENDPOINTS.auth}?endpoint=${endpoint}`;
  }
  
  // Payments endpoint
  if (endpoint === 'payments') {
    return API_ENDPOINTS.payments;
  }
  
  // Dictionary endpoints
  if (DICTIONARY_ENDPOINTS.includes(endpoint)) {
    return `${API_ENDPOINTS.dictionaries}?endpoint=${endpoint}`;
  }
  
  // Ticket endpoints
  if (TICKET_ENDPOINTS.includes(endpoint)) {
    return `${API_ENDPOINTS.tickets}?endpoint=${endpoint}`;
  }
  
  // All other endpoints go to main API
  return `${API_ENDPOINTS.main}?endpoint=${endpoint}`;
};