import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/config/api';
import { useToast } from '@/hooks/use-toast';
import { invalidatePaymentsCache } from '@/contexts/PaymentsCacheContext';
import { Payment } from './ApprovedPaymentInfo';

interface LegalEntity {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface ApprovedPaymentEditModalProps {
  open: boolean;
  payment: Payment;
  onClose: () => void;
  onSaved: (updates: Partial<Payment>) => void;
}

const ApprovedPaymentEditModal = ({ open, payment, onClose, onSaved }: ApprovedPaymentEditModalProps) => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [isLoadingDicts, setIsLoadingDicts] = useState(false);

  const [selectedDeptId, setSelectedDeptId] = useState<string>('');
  const [selectedLeId, setSelectedLeId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelectedDeptId(payment.department_id ? String(payment.department_id) : 'none');
    setSelectedLeId(payment.legal_entity_id ? String(payment.legal_entity_id) : 'none');
    setInvoiceNumber(payment.invoice_number || '');
    loadDictionaries();
  }, [open]);

  const loadDictionaries = async () => {
    setIsLoadingDicts(true);
    try {
      const [deptRes, leRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=customer-departments`, {
          headers: { 'X-Auth-Token': token || '' },
        }),
        fetch(`${API_ENDPOINTS.dictionariesApi}?endpoint=legal-entities`, {
          headers: { 'X-Auth-Token': token || '' },
        }),
      ]);
      if (deptRes.ok) {
        const data = await deptRes.json();
        setDepartments(Array.isArray(data) ? data : []);
      }
      if (leRes.ok) {
        const data = await leRes.json();
        setLegalEntities(Array.isArray(data) ? data : []);
      }
    } catch {
      // не критично
    } finally {
      setIsLoadingDicts(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const body: Record<string, unknown> = {
        payment_id: payment.id,
        department_id: selectedDeptId === 'none' ? null : Number(selectedDeptId),
        legal_entity_id: selectedLeId === 'none' ? null : Number(selectedLeId),
        invoice_number: invoiceNumber.trim() || null,
      };

      const res = await fetch(API_ENDPOINTS.paymentsApi, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Auth-Token': token || '',
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Не удалось сохранить изменения');
      }

      const result = await res.json();

      invalidatePaymentsCache();

      toast({ title: 'Сохранено', description: 'Изменения в платеже зафиксированы в журнале аудита' });

      onSaved({
        department_id: result.department_id,
        department_name: result.department_name ?? undefined,
        legal_entity_id: result.legal_entity_id,
        legal_entity_name: result.legal_entity_name ?? undefined,
        invoice_number: result.invoice_number ?? undefined,
      });

      onClose();
    } catch (e) {
      toast({
        title: 'Ошибка',
        description: e instanceof Error ? e.message : 'Ошибка сохранения',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isSaving) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Редактировать платёж #{payment.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Отдел-заказчик</Label>
            <Select value={selectedDeptId} onValueChange={setSelectedDeptId} disabled={isLoadingDicts}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingDicts ? 'Загрузка...' : 'Не указан'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не указан</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Юридическое лицо</Label>
            <Select value={selectedLeId} onValueChange={setSelectedLeId} disabled={isLoadingDicts}>
              <SelectTrigger>
                <SelectValue placeholder={isLoadingDicts ? 'Загрузка...' : 'Не указано'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Не указано</SelectItem>
                {legalEntities.map((le) => (
                  <SelectItem key={le.id} value={String(le.id)}>{le.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Номер счёта</Label>
            <Input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="Введите номер счёта"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoadingDicts}>
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovedPaymentEditModal;
