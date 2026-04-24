export interface ValidationError {
  title: string;
  description: string;
}

/**
 * Проверка обязательных полей формы платежа.
 * Возвращает первую найденную ошибку или null, если всё корректно.
 * Порядок проверок строго соответствует прежней логике handleSubmit.
 */
export const validatePaymentForm = (formData: Record<string, string | undefined>): ValidationError | null => {
  if (!formData.service_id) {
    return { title: 'Ошибка', description: 'Выберите сервис из списка' };
  }

  if (!formData.category_id) {
    return { title: 'Ошибка', description: 'Выберите категорию из списка' };
  }

  if (!formData.legal_entity_id) {
    return { title: 'Ошибка', description: 'Выберите юридическое лицо' };
  }

  if (!formData.department_id) {
    return { title: 'Ошибка', description: 'Выберите отдел-заказчик' };
  }

  if (!formData.description || !formData.description.trim()) {
    return { title: 'Ошибка', description: 'Укажите назначение платежа' };
  }

  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    return { title: 'Ошибка', description: 'Укажите корректную сумму' };
  }

  if (formData.invoice_date) {
    const year = new Date(formData.invoice_date).getFullYear();
    if (year < 2000 || year > 2099) {
      return { title: 'Ошибка', description: 'Дата должна быть между 2000 и 2099 годом' };
    }
  }

  return null;
};