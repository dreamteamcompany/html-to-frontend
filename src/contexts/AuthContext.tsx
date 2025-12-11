import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  email: string;
  full_name: string;
  is_active: boolean;
  last_login: string | null;
  roles: Role[];
  permissions: Permission[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
  checkAuth: () => Promise<void>;
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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    const savedToken = localStorage.getItem('auth_token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/597de3a8-5db2-4e46-8835-5a37042b00f1?action=me', {
        headers: {
          'X-Auth-Token': savedToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setToken(savedToken);
      } else {
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch('https://functions.poehali.dev/597de3a8-5db2-4e46-8835-5a37042b00f1?action=login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка входа');
    }

    const data = await response.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('auth_token', data.token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user || !user.permissions) return false;
    return user.permissions.some(
      (p) => p.resource === resource && p.action === action
    );
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasPermission, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
