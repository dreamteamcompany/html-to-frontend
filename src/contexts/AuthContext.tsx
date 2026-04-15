import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { API_ENDPOINTS } from '@/config/api';

interface Permission {
  name: string;
  resource: string;
  action: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
  last_login: string | null;
  photo_url?: string;
  roles: Role[];
  permissions: Permission[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<User>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  checkAuth: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setToken: (token: string) => void;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const getStorageToken = (): string | null => {
  const rememberMe = localStorage.getItem('remember_me') === 'true';
  return rememberMe 
    ? localStorage.getItem('auth_token')
    : sessionStorage.getItem('auth_token');
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return getStorageToken();
  });
  const [loading, setLoading] = useState(true);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cache-busting fix for production deployment
  
  const logout = useCallback(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('remember_me');
  }, []);
  
  const refreshToken = useCallback(async () => {
    const currentToken = getStorageToken();
    
    if (!currentToken) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.tokenRefresh}?action=refresh`, {
        headers: {
          'X-Auth-Token': currentToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const rememberMe = localStorage.getItem('remember_me') === 'true';
        setToken(data.token);
        if (data.user) {
          setUser(prev => ({
            ...data.user,
            photo_url: data.user.photo_url || prev?.photo_url || '',
          }));
        }
        
        if (rememberMe) {
          localStorage.setItem('auth_token', data.token);
        } else {
          sessionStorage.setItem('auth_token', data.token);
        }
      }
    } catch { /* network error */ }
  }, []);

  const checkAuth = async () => {
    const savedToken = getStorageToken();

    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_ENDPOINTS.main}?endpoint=me`, {
        headers: {
          'X-Auth-Token': savedToken,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        if (!userData.photo_url && userData.id) {
          try {
            const usersResp = await fetch(`${API_ENDPOINTS.main}?endpoint=users`, {
              headers: { 'X-Auth-Token': savedToken },
            });
            if (usersResp.ok) {
              const usersList = await usersResp.json();
              const found = (Array.isArray(usersList) ? usersList : []).find((u: { id: number }) => u.id === userData.id);
              if (found?.photo_url) {
                userData.photo_url = found.photo_url;
              }
            }
          } catch { /* network error */ }
        }
        setUser(userData);
        setToken(savedToken);
      } else {
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        localStorage.removeItem('remember_me');
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_token');
      localStorage.removeItem('remember_me');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && token) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      
      const doRefresh = async () => {
        const currentToken = getStorageToken();
        
        if (!currentToken) return;

        try {
          const response = await fetch(`${API_ENDPOINTS.tokenRefresh}?action=refresh`, {
            headers: {
              'X-Auth-Token': currentToken,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const rememberMe = localStorage.getItem('remember_me') === 'true';
            setToken(data.token);
            if (data.user) {
              setUser(prev => ({
                ...data.user,
                photo_url: data.user.photo_url || prev?.photo_url || '',
              }));
            }
            
            if (rememberMe) {
              localStorage.setItem('auth_token', data.token);
            } else {
              sessionStorage.setItem('auth_token', data.token);
            }
          }
        } catch {
          // silent: network error during token refresh
        }
      };
      
      refreshIntervalRef.current = setInterval(() => {
        doRefresh();
      }, 6 * 60 * 60 * 1000);
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [user, token]);

  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    const response = await fetch(`${API_ENDPOINTS.main}?endpoint=login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка входа');
    }

    const data = await response.json();
    const loginUser = data.user;
    if (!loginUser.photo_url && loginUser.id) {
      try {
        const usersResp = await fetch(`${API_ENDPOINTS.main}?endpoint=users`, {
          headers: { 'X-Auth-Token': data.token },
        });
        if (usersResp.ok) {
          const usersList = await usersResp.json();
          const found = (Array.isArray(usersList) ? usersList : []).find((u: { id: number }) => u.id === loginUser.id);
          if (found?.photo_url) {
            loginUser.photo_url = found.photo_url;
          }
        }
      } catch { /* network error */ }
    }
    setToken(data.token);
    setUser(loginUser);
    
    if (rememberMe) {
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('remember_me', 'true');
    } else {
      sessionStorage.setItem('auth_token', data.token);
      localStorage.removeItem('remember_me');
    }
    
    return loginUser;
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    // Если у пользователя есть роль "Администратор", даём полный доступ
    if (user.roles?.some(role => role.name === 'Администратор' || role.name === 'Admin')) {
      return true;
    }
    
    if (!user.permissions) return false;
    return user.permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasPermission, checkAuth, refreshToken, setToken, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};