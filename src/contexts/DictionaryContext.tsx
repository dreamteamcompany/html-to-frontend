import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { API_ENDPOINTS } from '@/config/api';
import { apiFetch } from '@/utils/api';
import { useAuth } from './AuthContext';

interface Category {
  id: number;
  name: string;
  icon: string;
  parent_id?: number;
  description?: string;
}

interface Contractor {
  id: number;
  name: string;
  inn?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
}

interface LegalEntity {
  id: number;
  name: string;
  inn?: string;
  kpp?: string;
  address?: string;
}

interface Department {
  id: number;
  name: string;
  description?: string;
}

interface Service {
  id: number;
  name: string;
  description?: string;
  category_id?: number;
}

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  options?: string;
  is_required?: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  is_active: boolean;
}

interface DictionaryData {
  categories: Category[];
  contractors: Contractor[];
  legalEntities: LegalEntity[];
  departments: Department[];
  services: Service[];
  customFields: CustomField[];
  users: User[];
}

interface DictionaryContextType extends DictionaryData {
  loading: {
    categories: boolean;
    contractors: boolean;
    legalEntities: boolean;
    departments: boolean;
    services: boolean;
    customFields: boolean;
    users: boolean;
  };
  refresh: (key: keyof DictionaryData) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DictionaryContext = createContext<DictionaryContextType | undefined>(undefined);

export const useDictionaryContext = () => {
  const context = useContext(DictionaryContext);
  if (!context) {
    throw new Error('useDictionaryContext must be used within DictionaryProvider');
  }
  return context;
};

interface DictionaryProviderProps {
  children: ReactNode;
}

const CACHE_DURATION = 5 * 60 * 1000;

export const DictionaryProvider = ({ children }: DictionaryProviderProps) => {
  const { token } = useAuth();
  
  const [data, setData] = useState<DictionaryData>({
    categories: [],
    contractors: [],
    legalEntities: [],
    departments: [],
    services: [],
    customFields: [],
    users: [],
  });

  const [loading, setLoading] = useState({
    categories: false,
    contractors: false,
    legalEntities: false,
    departments: false,
    services: false,
    customFields: false,
    users: false,
  });

  const lastFetchRef = useRef<Record<keyof DictionaryData, number>>({
    categories: 0,
    contractors: 0,
    legalEntities: 0,
    departments: 0,
    services: 0,
    customFields: 0,
    users: 0,
  });

  const fetchDictionary = async <K extends keyof DictionaryData>(
    key: K,
    endpoint: string,
    force = false
  ): Promise<void> => {
    if (!token) return;

    const now = Date.now();
    if (!force && now - lastFetchRef.current[key] < CACHE_DURATION && data[key].length > 0) {
      return;
    }

    setLoading(prev => ({ ...prev, [key]: true }));

    try {
      const response = await apiFetch(`${API_ENDPOINTS.main}?endpoint=${endpoint}`);
      const result = await response.json();
      
      setData(prev => ({ ...prev, [key]: Array.isArray(result) ? result : [] }));
      lastFetchRef.current[key] = now;
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
      setData(prev => ({ ...prev, [key]: [] }));
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  const refresh = async (key: keyof DictionaryData) => {
    const endpoints: Record<keyof DictionaryData, string> = {
      categories: 'categories',
      contractors: 'contractors',
      legalEntities: 'legal-entities',
      departments: 'customer-departments',
      services: 'services',
      customFields: 'custom-fields',
      users: 'users',
    };

    await fetchDictionary(key, endpoints[key], true);
  };

  const refreshAll = async () => {
    await Promise.all([
      fetchDictionary('categories', 'categories', true),
      fetchDictionary('contractors', 'contractors', true),
      fetchDictionary('legalEntities', 'legal-entities', true),
      fetchDictionary('departments', 'customer-departments', true),
      fetchDictionary('services', 'services', true),
      fetchDictionary('customFields', 'custom-fields', true),
      fetchDictionary('users', 'users', true),
    ]);
  };

  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (token && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      refreshAll();
    }
  }, [token]);

  return (
    <DictionaryContext.Provider
      value={{
        ...data,
        loading,
        refresh,
        refreshAll,
      }}
    >
      {children}
    </DictionaryContext.Provider>
  );
};
