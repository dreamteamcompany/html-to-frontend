import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import FUNC2URL from '@/../backend/func2url.json';
import { CustomField, FormDataValue } from './types';

interface PaymentFormCustomFieldsProps {
  customFields: CustomField[];
  formData: FormDataValue;
  setFormData: (data: FormDataValue) => void;
}

const PaymentFormCustomFields = ({ customFields, formData, setFormData }: PaymentFormCustomFieldsProps) => {
  if (customFields.length === 0) return null;

  return (
    <div className="border-t border-white/10 pt-4 space-y-4">
      <h4 className="text-sm font-semibold text-muted-foreground">Дополнительные поля</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {customFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={`custom_field_${field.id}`}>{field.name}</Label>
            {field.field_type === 'text' && (
              <Input
                id={`custom_field_${field.id}`}
                value={formData[`custom_field_${field.id}`] || ''}
                onChange={(e) => setFormData({ ...formData, [`custom_field_${field.id}`]: e.target.value })}
                placeholder={`Введите ${field.name.toLowerCase()}`}
              />
            )}
            {(field.field_type === 'select' || field.field_type === 'toggle') && (
              <Input
                id={`custom_field_${field.id}`}
                value={formData[`custom_field_${field.id}`] || ''}
                readOnly
                className="bg-muted/50 cursor-default"
                placeholder="Заполнится автоматически"
              />
            )}
            {field.field_type === 'file' && (
              <div>
                <Input
                  id={`custom_field_${field.id}`}
                  type="file"
                  accept={field.options ? field.options.split(',').map(ext => `.${ext.trim()}`).join(',') : '*'}
                  className="cursor-pointer file:mr-4 file:py-2.5 file:px-5 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer file:shadow-sm"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const allowedExtensions = field.options?.split(',').map(ext => ext.trim().toLowerCase()) || [];
                    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

                    if (allowedExtensions.length > 0 && !allowedExtensions.includes(fileExtension)) {
                      alert(`Недопустимый формат файла. Разрешены: ${field.options}`);
                      e.target.value = '';
                      return;
                    }

                    const reader = new FileReader();
                    reader.onload = async () => {
                      const base64 = (reader.result as string).split(',')[1];

                      try {
                        const response = await fetch(FUNC2URL['invoice-ocr'], {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            file: base64,
                            fileName: file.name,
                            contentType: file.type
                          })
                        });

                        const data = await response.json();
                        if (data.url) {
                          setFormData({ ...formData, [`custom_field_${field.id}`]: data.url });
                        }
                      } catch (err) {
                        console.error('Upload failed:', err);
                        alert('Ошибка загрузки файла');
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
                {formData[`custom_field_${field.id}`] && (
                  <p className="text-xs text-green-500 mt-1">Файл загружен</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentFormCustomFields;
