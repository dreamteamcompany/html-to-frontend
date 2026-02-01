export const API_ENDPOINTS = {
  // Auth API
  auth: 'https://functions.poehali.dev/cc3b9628-07ec-420e-b340-1c20cad986da',
  
  // Payments API
  payments: 'https://functions.poehali.dev/7f682e02-1640-40e7-8e2a-7a4e7723b309',
  
  // Dictionaries API
  dictionaries: 'https://functions.poehali.dev/4bd5899c-9f5b-4ac9-866e-8f4236f5c09c',
  
  // Tickets API
  tickets: 'https://functions.poehali.dev/36ca4c35-8625-4e62-b383-d5feac4de266',
  
  // Approvals API
  approvals: 'https://functions.poehali.dev/28de9a43-6aa7-491b-a20e-7a2e9ecebe49',
  
  // Savings API
  savings: 'https://functions.poehali.dev/97e7934f-259b-404b-9eae-6de53448c8c2',
  
  // Users API
  users: 'https://functions.poehali.dev/e779e7ac-e5aa-4f88-b2dc-e856132ad15d',
  
  // Stats API
  stats: 'https://functions.poehali.dev/d0eab1c3-6c38-45d7-bbb4-71f9163a691f',
  
  // Notifications API
  notifications: 'https://functions.poehali.dev/3e531873-80bf-4d1f-bf41-1900d639b186',
  
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

const APPROVALS_ENDPOINTS = ['approvals', 'approvers'];
const SAVINGS_ENDPOINTS = ['savings', 'saving-reasons'];
const USERS_ENDPOINTS = ['users', 'roles', 'permissions', 'users-list'];
const STATS_ENDPOINTS = ['stats', 'dashboard-stats', 'budget-breakdown', 'dashboard-layout', 'savings-dashboard'];
const NOTIFICATIONS_ENDPOINTS = ['notifications'];

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
  
  // Approvals endpoints
  if (APPROVALS_ENDPOINTS.includes(endpoint)) {
    return `${API_ENDPOINTS.approvals}?endpoint=${endpoint}`;
  }
  
  // Savings endpoints
  if (SAVINGS_ENDPOINTS.includes(endpoint)) {
    return `${API_ENDPOINTS.savings}?endpoint=${endpoint}`;
  }
  
  // Users endpoints
  if (USERS_ENDPOINTS.includes(endpoint)) {
    return `${API_ENDPOINTS.users}?endpoint=${endpoint}`;
  }
  
  // Stats endpoints
  if (STATS_ENDPOINTS.includes(endpoint)) {
    return `${API_ENDPOINTS.stats}?endpoint=${endpoint}`;
  }
  
  // Notifications endpoints
  if (NOTIFICATIONS_ENDPOINTS.includes(endpoint)) {
    return `${API_ENDPOINTS.notifications}?endpoint=${endpoint}`;
  }
  
  // All other endpoints go to main API
  return `${API_ENDPOINTS.main}?endpoint=${endpoint}`;
};