import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Category {
  id: number;
  name: string;
  description?: string;
  icon: string;
}

interface Priority {
  id: number;
  name: string;
  level: number;
  color: string;
}

interface Status {
  id: number;
  name: string;
  color: string;
  is_closed: boolean;
}

interface Department {
  id: number;
  name: string;
  description?: string;
}

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  options?: string;
  is_required: boolean;
  value?: string;
}

interface Ticket {
  id: number;
  title: string;
  description?: string;
  category_id?: number;
  category_name?: string;
  category_icon?: string;
  priority_id?: number;
  priority_name?: string;
  priority_color?: string;
  status_id?: number;
  status_name?: string;
  status_color?: string;
  department_id?: number;
  department_name?: string;
  created_by: number;
  assigned_to?: number;
  due_date?: string;
  created_at?: string;
  updated_at?: string;
  closed_at?: string;
  custom_fields?: CustomField[];
}

export const useTicketsData = () => {
  const { token } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTickets = async () => {
    if (!token) return;

    try {
      const mainUrl = 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd';
      const response = await fetch(`${mainUrl}?endpoint=tickets-api`, {
        headers: {
          'X-Auth-Token': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      } else {
        console.error('Response not OK:', response.status, await response.text());
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  };

  const loadDictionaries = async () => {
    if (!token) return;

    try {
      const mainUrl = 'https://functions.poehali.dev/8f2170d4-9167-4354-85a1-4478c2403dfd';
      const response = await fetch(`${mainUrl}?endpoint=ticket-dictionaries-api`, {
        headers: {
          'X-Auth-Token': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
        setPriorities(data.priorities || []);
        setStatuses(data.statuses || []);
        setDepartments(data.departments || []);
        setCustomFields(data.custom_fields || []);
      } else {
        console.error('Dictionaries response not OK:', response.status, await response.text());
        // Fallback данные
        setPriorities([
          { id: 1, name: 'Низкий', level: 1 },
          { id: 2, name: 'Средний', level: 2 },
          { id: 3, name: 'Высокий', level: 3 },
          { id: 4, name: 'Критический', level: 4 }
        ]);
        setStatuses([
          { id: 1, name: 'Новая', color: 'blue', is_closed: false },
          { id: 2, name: 'В работе', color: 'orange', is_closed: false },
          { id: 3, name: 'Ожидание', color: 'yellow', is_closed: false },
          { id: 4, name: 'Решена', color: 'green', is_closed: true },
          { id: 5, name: 'Закрыта', color: 'gray', is_closed: true }
        ]);
      }
    } catch (err) {
      console.error('Failed to load dictionaries:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadTickets(), loadDictionaries()]);
      setLoading(false);
    };

    loadData();
  }, [token]);

  return {
    tickets,
    categories,
    priorities,
    statuses,
    departments,
    customFields,
    loading,
    loadTickets,
  };
};