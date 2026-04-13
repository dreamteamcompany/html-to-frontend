export const InfoRow = ({ label, value }: { label: string; value?: string | number | null }) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right break-anywhere min-w-0">{value}</span>
    </div>
  );
};

export const SelectField = ({
  label, value, onChange, options, placeholder = 'Не выбрано', required = false,
}: {
  label: string;
  value: number | string | undefined;
  onChange: (val: number | undefined) => void;
  options: { id: number; name: string }[];
  placeholder?: string;
  required?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="text-sm font-medium text-foreground">{label}{required ? ' *' : ''}</label>
    <select
      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      value={value ?? ''}
      onChange={(ev) => onChange(ev.target.value ? Number(ev.target.value) : undefined)}
      required={required}
    >
      {!required && <option value="">{placeholder}</option>}
      {required && <option value="">Выберите...</option>}
      {options.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
    </select>
  </div>
);