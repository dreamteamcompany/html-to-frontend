import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

type TabType = 'contests' | 'applications' | 'results' | 'reviews' | 'certificates' | 'settings';

interface AdminNavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  applicationsCount: number;
  deletedApplicationsCount: number;
  resultsCount: number;
  reviewsCount: number;
  certificatesLogLength: number;
  onCertificatesClick: () => void;
  handleLogout: () => void;
}

const AdminNavbar = ({
  activeTab,
  setActiveTab,
  applicationsCount,
  deletedApplicationsCount,
  resultsCount,
  reviewsCount,
  onCertificatesClick,
  handleLogout,
}: AdminNavbarProps) => {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md shadow-md bg-gradient-to-r from-primary to-secondary">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-heading font-bold text-white">Админ-панель</h1>
          <Button onClick={handleLogout} variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
            <Icon name="LogOut" className="mr-2" />
            Выйти
          </Button>
        </div>
      </div>
    </nav>
  );
};

interface AdminTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  applicationsCount: number;
  deletedApplicationsCount: number;
  resultsCount: number;
  reviewsCount: number;
  onCertificatesClick: () => void;
}

export const AdminTabs = ({
  activeTab,
  setActiveTab,
  applicationsCount,
  deletedApplicationsCount,
  resultsCount,
  reviewsCount,
  onCertificatesClick,
}: AdminTabsProps) => {
  return (
    <div className="flex gap-2 sm:gap-4 mb-8 border-b overflow-x-auto [&::-webkit-scrollbar]:h-0">
      <Button
        variant={activeTab === 'contests' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('contests')}
        className="rounded-t-xl rounded-b-none"
      >
        <Icon name="Trophy" className="mr-2" />
        Конкурсы
      </Button>
      <Button
        variant={activeTab === 'applications' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('applications')}
        className="rounded-t-xl rounded-b-none"
      >
        <Icon name="FileText" className="mr-2" />
        Заявки ({applicationsCount + deletedApplicationsCount})
      </Button>
      <Button
        variant={activeTab === 'results' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('results')}
        className="rounded-t-xl rounded-b-none"
      >
        <Icon name="Award" className="mr-2" />
        Результаты ({resultsCount})
      </Button>
      <Button
        variant={activeTab === 'reviews' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('reviews')}
        className="rounded-t-xl rounded-b-none"
      >
        <Icon name="MessageSquare" className="mr-2" />
        Отзывы ({reviewsCount})
      </Button>
      <Button
        variant={activeTab === 'certificates' ? 'default' : 'ghost'}
        onClick={onCertificatesClick}
        className="rounded-t-xl rounded-b-none"
      >
        <Icon name="ScrollText" className="mr-2" />
        Выданные справки
      </Button>
      <Button
        variant={activeTab === 'settings' ? 'default' : 'ghost'}
        onClick={() => setActiveTab('settings')}
        className="rounded-t-xl rounded-b-none"
      >
        <Icon name="Settings" className="mr-2" />
        Настройки
      </Button>
    </div>
  );
};

export default AdminNavbar;