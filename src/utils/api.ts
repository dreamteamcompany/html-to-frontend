const getAuthToken = (): string | null => {
  const rememberMe = localStorage.getItem('remember_me') === 'true';
  return rememberMe 
    ? localStorage.getItem('auth_token')
    : sessionStorage.getItem('auth_token');
};

export const translateApiError = (errorText: string | undefined): string => {
  if (!errorText) return 'Произошла ошибка';
  const map: Record<string, string> = {
    'Unauthorized': 'Сессия истекла. Пожалуйста, войдите снова',
    'Token expired': 'Сессия истекла. Пожалуйста, войдите снова',
    'Invalid token': 'Ошибка авторизации. Пожалуйста, войдите снова',
    'Forbidden': 'У вас нет прав для выполнения этого действия',
  };
  return map[errorText] ?? errorText;
};

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    ...options.headers,
  };
  
  if (token) {
    headers['X-Auth-Token'] = token;
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
};
