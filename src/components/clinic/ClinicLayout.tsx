import { useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useSidebarTouch } from '@/hooks/useSidebarTouch';
import { ClinicProvider } from '@/contexts/ClinicContext';
import ClinicSidebar from '@/components/clinic/ClinicSidebar';
import Icon from '@/components/ui/icon';

/**
 * Лейаут портала клиники. Устанавливает контекст клиники (X-Clinic-Id),
 * рендерит меню клиники и вложенные страницы. Все запросы внутри
 * автоматически изолируются по clinic_id.
 */
const ClinicLayout = () => {
  const { clinicId } = useParams<{ clinicId: string }>();
  const numericClinicId = Number(clinicId);

  const {
    menuOpen,
    setMenuOpen,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useSidebarTouch();

  const [dictionariesOpen, setDictionariesOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(true);

  return (
    <ClinicProvider clinicId={Number.isFinite(numericClinicId) ? numericClinicId : null}>
      <div className="min-h-screen bg-background">
        <ClinicSidebar
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

        <div className="lg:ml-[250px]">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden p-2 m-4 text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="Menu" size={24} />
          </button>
          <Outlet />
        </div>
      </div>
    </ClinicProvider>
  );
};

export default ClinicLayout;
