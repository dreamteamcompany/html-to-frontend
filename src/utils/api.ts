const getAuthToken = (): string | null => {
  const rememberMe = localStorage.getItem('remember_me') === 'true';
  return rememberMe 
    ? localStorage.getItem('auth_token')
    : sessionStorage.getItem('auth_token');
};

/**
 * Текущая клиника («портал в портале»). Когда задана — все запросы через
 * apiFetch получают заголовок X-Clinic-Id, и backend изолирует данные.
 * null — общий портал (clinic_id IS NULL).
 */
let currentClinicId: number | null = null;

export const setCurrentClinicId = (clinicId: number | null) => {
  currentClinicId = clinicId;
};

export const getCurrentClinicId = (): number | null => currentClinicId;

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

export const translateFetchError = (e: unknown, fallback = 'Произошла ошибка. Попробуйте позже'): string => {
  if (!(e instanceof Error)) return fallback;
  if (
    e.message === 'Failed to fetch' ||
    e.message.includes('NetworkError') ||
    e.message.includes('Network request failed') ||
    e.message.includes('ERR_NETWORK') ||
    e.message.includes('ERR_INTERNET_DISCONNECTED')
  ) {
    return 'Ошибка соединения с сервером. Проверьте интернет и попробуйте позже';
  }
  return translateApiError(e.message);
};

export const apiFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    ...options.headers,
  };
  
  if (token) {
    headers['X-Auth-Token'] = token;
  }

  if (currentClinicId != null) {
    headers['X-Clinic-Id'] = String(currentClinicId);
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
};