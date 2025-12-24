import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  is_required: boolean;
}

export const useTicketForm = (customFields: CustomField[], loadTickets: () => void) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const initialFormData = {
    title: '',
    description: '',
    category_id: '',
    priority_id: '',
    status_id: '1',
    department_id: '',
    due_date: '',
    custom_fields: {} as Record<string, string>,
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast({
        title: 'Ошибка',
        description: 'Необходима авторизация',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/tickets-api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token,
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
          priority_id: formData.priority_id ? parseInt(formData.priority_id) : undefined,
          status_id: formData.status_id ? parseInt(formData.status_id) : 1,
          department_id: formData.department_id ? parseInt(formData.department_id) : undefined,
          due_date: formData.due_date || undefined,
          custom_fields: formData.custom_fields,
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Заявка создана',
        });
        setDialogOpen(false);
        setFormData(initialFormData);
        loadTickets();
      } else {
        const error = await response.json();
        toast({
          title: 'Ошибка',
          description: error.error || 'Не удалось создать заявку',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
      toast({
        title: 'Ошибка сети',
        description: 'Проверьте подключение к интернету',
        variant: 'destructive',
      });
    }
  };

  return {
    dialogOpen,
    setDialogOpen,
    formData,
    setFormData,
    handleSubmit,
  };
};
