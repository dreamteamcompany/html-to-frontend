import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTicketsData } from '@/hooks/useTicketsData';
import { useTicketForm } from '@/hooks/useTicketForm';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import TicketsSidebar from '@/components/tickets/TicketsSidebar';
import TicketsHeader from '@/components/tickets/TicketsHeader';
import TicketsSearch from '@/components/tickets/TicketsSearch';
import TicketForm from '@/components/tickets/TicketForm';
import TicketsList from '@/components/tickets/TicketsList';
import TicketDetailsModal from '@/components/tickets/TicketDetailsModal';

interface CustomField {
  id: number;
  name: string;
  field_type: string;
  value: string;
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

const Tickets = () => {
  const { token } = useAuth();
  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    tickets,
    categories,
    priorities,
    statuses,
    departments,
    customFields,
    loading,
    loadTickets,
  } = useTicketsData();

  const {
    dialogOpen,
    setDialogOpen,
    formData,
    setFormData,
    handleSubmit,
  } = useTicketForm(customFields, loadTickets);

  const {
    menuOpen,
    setMenuOpen,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSidebarTouch();

  const filteredTickets = tickets.filter(ticket => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        ticket.title.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query) ||
        ticket.category_name?.toLowerCase().includes(query) ||
        ticket.priority_name?.toLowerCase().includes(query) ||
        ticket.department_name?.toLowerCase().includes(query)
      );
      if (!matchesSearch) return false;
    }
    return true;
  });

  return (
    <div className="flex min-h-screen">
      <TicketsSidebar
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

      <main className="flex-1 lg:ml-[250px] p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <TicketsHeader
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
          />

          <TicketsSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />

          <TicketForm
            dialogOpen={dialogOpen}
            setDialogOpen={setDialogOpen}
            formData={formData}
            setFormData={setFormData}
            categories={categories}
            priorities={priorities}
            statuses={statuses}
            departments={departments}
            customFields={customFields}
            handleSubmit={handleSubmit}
          />

          <TicketsList
            tickets={filteredTickets}
            loading={loading}
            onTicketClick={setSelectedTicket}
          />

          <TicketDetailsModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
          />
        </div>
      </main>
    </div>
  );
};

export default Tickets;
