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
      const response = await fetch('https://functions.poehali.dev/tickets-api', {
        headers: {
          'X-Auth-Token': token,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  };

  const loadDictionaries = async () => {
    if (!token) return;

    try {
      const response = await fetch('https://functions.poehali.dev/ticket-dictionaries-api', {
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
