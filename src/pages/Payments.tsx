import { useEffect, useState } from 'react';
import PaymentsSidebar from '@/components/payments/PaymentsSidebar';
import PaymentsHeader from '@/components/payments/PaymentsHeader';
import PaymentForm from '@/components/payments/PaymentForm';
import PaymentsList from '@/components/payments/PaymentsList';

interface Payment {
  id: number;
  category_id: number;
  category_name: string;
  category_icon: string;
  description: string;
  amount: number;
  payment_date: string;
  legal_entity_id?: number;
  legal_entity_name?: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
}

interface LegalEntity {
  id: number;
  name: string;
  inn: string;
  kpp: string;
  address: string;
}

interface Contractor {
  id: number;
  name: string;
  inn: string;
}

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  options: string;
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dictionariesOpen, setDictionariesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      setMenuOpen(false);
    }
  };
  const [formData, setFormData] = useState<Record<string, string | undefined>>({
    category_id: undefined,
    description: '',
    amount: '',
    legal_entity_id: undefined,
    contractor_id: undefined,
  });

  const loadPayments = () => {
    fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=payments')
      .then(res => res.json())
      .then(data => {
        setPayments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load payments:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadPayments();
    fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=categories')
      .then(res => res.json())
      .then(setCategories)
      .catch(err => console.error('Failed to load categories:', err));
    fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=legal-entities')
      .then(res => res.json())
      .then(setLegalEntities)
      .catch(err => console.error('Failed to load legal entities:', err));
    fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=contractors')
      .then(res => res.json())
      .then(setContractors)
      .catch(err => console.error('Failed to load contractors:', err));
    fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=custom-fields')
      .then(res => res.json())
      .then((fields) => {
        setCustomFields(fields);
        const initialData: Record<string, string | undefined> = {
          category_id: undefined,
          description: '',
          amount: '',
          legal_entity_id: undefined,
          contractor_id: undefined,
        };
        fields.forEach((field: CustomField) => {
          initialData[`custom_field_${field.id}`] = undefined;
        });
        setFormData(initialData);
      })
      .catch(err => console.error('Failed to load custom fields:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('https://functions.poehali.dev/9b5d4fbf-1bb7-4ccf-9295-fed67458d202?endpoint=payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: formData.category_id ? parseInt(formData.category_id) : 0,
          description: formData.description || '',
          amount: formData.amount ? parseFloat(formData.amount) : 0,
          legal_entity_id: formData.legal_entity_id ? parseInt(formData.legal_entity_id) : null,
          contractor_id: formData.contractor_id ? parseInt(formData.contractor_id) : null,
        }),
      });

      if (response.ok) {
        setDialogOpen(false);
        const resetData: Record<string, string | undefined> = {
          category_id: undefined,
          description: '',
          amount: '',
          legal_entity_id: undefined,
          contractor_id: undefined,
        };
        customFields.forEach(field => {
          resetData[`custom_field_${field.id}`] = undefined;
        });
        setFormData(resetData);
        loadPayments();
      }
    } catch (err) {
      console.error('Failed to add payment:', err);
    }
  };

  return (
    <div className="flex min-h-screen">
      <PaymentsSidebar
        menuOpen={menuOpen}
        dictionariesOpen={dictionariesOpen}
        setDictionariesOpen={setDictionariesOpen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={handleTouchEnd}
      />

      {menuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="lg:ml-[250px] p-4 md:p-6 lg:p-[30px] min-h-screen flex-1">
        <PaymentsHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

        <PaymentForm
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          legalEntities={legalEntities}
          contractors={contractors}
          customFields={customFields}
          handleSubmit={handleSubmit}
        />

        <PaymentsList payments={payments} loading={loading} />
      </main>
    </div>
  );
};

export default Payments;