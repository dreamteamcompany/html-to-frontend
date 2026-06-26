import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import UserAvatar from '@/components/ui/user-avatar';
import { useClinic } from '@/contexts/ClinicContext';
import { useDictionaryContext } from '@/contexts/DictionaryContext';

interface ClinicSidebarProps {
  menuOpen: boolean;
  dictionariesOpen: boolean;
  setDictionariesOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

const ClinicSidebar = ({
  menuOpen,
  dictionariesOpen,
  setDictionariesOpen,
  settingsOpen,
  setSettingsOpen,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
}: ClinicSidebarProps) => {
  const { user, logout, hasPermission } = useAuth();
  const { clinicId } = useClinic();
  const { clinics } = useDictionaryContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const base = `/clinics/${clinicId}`;
  const clinic = clinics.find((c) => Number(c.id) === Number(clinicId));

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
      document.documentElement.classList.toggle('dark', savedTheme !== 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const itemCls = (path: string) =>
    `flex items-center gap-3 px-[15px] py-3 rounded-lg ${
      isActive(path) ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
    } transition-colors`;

  const subCls = (path: string) =>
    `flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg ${
      isActive(path) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
    } transition-colors`;

  return (
    <aside
      className={`w-[250px] bg-card border-r border-border fixed left-0 top-0 h-screen z-50 transition-all lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="px-4 py-4 border-b border-border flex-shrink-0">
        <button
          onClick={() => navigate('/clinics')}
          className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <Icon name="ArrowLeft" size={16} />
          <span>К общей системе</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Icon name="Hospital" size={18} className="text-primary" />
          </div>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">Клиника</div>
            <div className="text-sm font-semibold text-foreground truncate">{clinic?.name || `#${clinicId}`}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted [&::-webkit-scrollbar-thumb]:rounded-full">
        <ul className="px-[15px] py-5 space-y-1 pb-4">
          <li>
            <Link to={`${base}/dashboard`} className={itemCls(`${base}/dashboard`)}>
              <Icon name="Home" size={20} />
              <span>Дашборд</span>
            </Link>
          </li>
          {hasPermission('payments', 'read') && (
            <li>
              <Link to={`${base}/payments`} className={itemCls(`${base}/payments`)}>
                <Icon name="CreditCard" size={20} />
                <span>Платежи</span>
              </Link>
            </li>
          )}
          {hasPermission('savings', 'read') && (
            <li>
              <Link to={`${base}/savings`} className={itemCls(`${base}/savings`)}>
                <Icon name="PiggyBank" size={20} />
                <span>Реестр экономии</span>
              </Link>
            </li>
          )}

          {(hasPermission('legal_entities', 'read') || hasPermission('categories', 'read') || hasPermission('custom_fields', 'read') || hasPermission('contractors', 'read') || hasPermission('customer_departments', 'read') || hasPermission('services', 'read') || hasPermission('saving_reasons', 'read')) && (
            <li>
              <button
                onClick={() => setDictionariesOpen(!dictionariesOpen)}
                className="w-full flex items-center justify-between px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon name="BookOpen" size={20} />
                  <span>Справочники</span>
                </div>
                <Icon name="ChevronDown" size={16} className={`transition-transform ${dictionariesOpen ? 'rotate-180' : ''}`} />
              </button>
              {dictionariesOpen && (
                <div className="mt-1 space-y-1">
                  {hasPermission('legal_entities', 'read') && (
                    <Link to={`${base}/legal-entities`} className={subCls(`${base}/legal-entities`)}>
                      <Icon name="Building2" size={18} />
                      <span>Юридические лица</span>
                    </Link>
                  )}
                  {hasPermission('categories', 'read') && (
                    <Link to={`${base}/categories`} className={subCls(`${base}/categories`)}>
                      <Icon name="Tag" size={18} />
                      <span>Категории платежей</span>
                    </Link>
                  )}
                  {hasPermission('custom_fields', 'read') && (
                    <Link to={`${base}/custom-fields`} className={subCls(`${base}/custom-fields`)}>
                      <Icon name="Settings" size={18} />
                      <span>Дополнительные поля</span>
                    </Link>
                  )}
                  {hasPermission('contractors', 'read') && (
                    <Link to={`${base}/contractors`} className={subCls(`${base}/contractors`)}>
                      <Icon name="Briefcase" size={18} />
                      <span>Контрагенты</span>
                    </Link>
                  )}
                  {hasPermission('customer_departments', 'read') && (
                    <Link to={`${base}/customer-departments`} className={subCls(`${base}/customer-departments`)}>
                      <Icon name="Building" size={18} />
                      <span>Отделы-заказчики</span>
                    </Link>
                  )}
                  {hasPermission('services', 'read') && (
                    <Link to={`${base}/services`} className={subCls(`${base}/services`)}>
                      <Icon name="Box" size={18} />
                      <span>Сервисы</span>
                    </Link>
                  )}
                  {hasPermission('saving_reasons', 'read') && (
                    <Link to={`${base}/saving-reasons`} className={subCls(`${base}/saving-reasons`)}>
                      <Icon name="Target" size={18} />
                      <span>Причины экономии</span>
                    </Link>
                  )}
                </div>
              )}
            </li>
          )}

          {hasPermission('users', 'read') && (
            <li>
              <Link to={`${base}/users`} className={itemCls(`${base}/users`)}>
                <Icon name="Users" size={20} />
                <span>Пользователи</span>
              </Link>
            </li>
          )}

          {hasPermission('audit_logs', 'read') && (
            <li>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center justify-between px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon name="Settings" size={20} />
                  <span>Настройки</span>
                </div>
                <Icon name="ChevronDown" size={16} className={`transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
              </button>
              {settingsOpen && (
                <div className="mt-1 space-y-1">
                  <Link to={`${base}/audit-logs`} className={subCls(`${base}/audit-logs`)}>
                    <Icon name="History" size={18} />
                    <span>История изменений</span>
                  </Link>
                </div>
              )}
            </li>
          )}
        </ul>
      </div>

      <div className="flex-shrink-0 border-t border-border p-4 space-y-3">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <div className="flex items-center gap-2">
            <Icon name={theme === 'dark' ? 'Moon' : 'Sun'} size={18} />
            <span className="text-sm">{theme === 'dark' ? 'Темная тема' : 'Светлая тема'}</span>
          </div>
          <Icon name="ChevronRight" size={16} />
        </button>
        <div className="flex items-start gap-3 px-2">
          <UserAvatar photoUrl={user?.photo_url} name={user?.full_name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground break-words">{user?.full_name}</div>
            <div className="text-xs text-muted-foreground break-words">{user?.email}</div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
          onClick={handleLogout}
        >
          <Icon name="LogOut" size={16} />
          Выйти
        </Button>
      </div>
    </aside>
  );
};

export default ClinicSidebar;