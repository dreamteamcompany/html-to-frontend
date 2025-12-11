import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface PaymentsSidebarProps {
  menuOpen: boolean;
  dictionariesOpen: boolean;
  setDictionariesOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

const PaymentsSidebar = ({
  menuOpen,
  dictionariesOpen,
  setDictionariesOpen,
  settingsOpen,
  setSettingsOpen,
  handleTouchStart,
  handleTouchMove,
  handleTouchEnd,
}: PaymentsSidebarProps) => {
  return (
    <aside 
      className={`w-[250px] bg-[#1b254b] border-r border-white/10 fixed left-0 top-0 h-screen z-50 transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <a href="/" className="flex items-center gap-3 px-5 py-5 pb-[30px] border-b border-white/10">
        <div className="w-8 h-8 bg-primary rounded-[10px] flex items-center justify-center font-bold text-white">
          V
        </div>
        <span className="text-white font-semibold">Vision UI</span>
      </a>
      <ul className="px-[15px] py-5 space-y-1">
        <li>
          <Link to="/" className="flex items-center gap-3 px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
            <Icon name="Home" size={20} />
            <span>Дашборд</span>
          </Link>
        </li>
        <li>
          <Link to="/payments" className="flex items-center gap-3 px-[15px] py-3 rounded-lg bg-primary text-white">
            <Icon name="CreditCard" size={20} />
            <span>Платежи</span>
          </Link>
        </li>
        <li>
          <button 
            onClick={() => setDictionariesOpen(!dictionariesOpen)}
            className="w-full flex items-center justify-between px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon name="BookOpen" size={20} />
              <span>Справочники</span>
            </div>
            <Icon 
              name="ChevronDown" 
              size={16} 
              className={`transition-transform ${dictionariesOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {dictionariesOpen && (
            <div className="mt-1 space-y-1">
              <Link 
                to="/legal-entities" 
                className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Icon name="Building2" size={18} />
                <span>Юридические лица</span>
              </Link>
              <Link 
                to="/categories" 
                className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Icon name="Tag" size={18} />
                <span>Категории платежей</span>
              </Link>
              <Link 
                to="/custom-fields" 
                className="flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <Icon name="Settings" size={18} />
                <span>Дополнительные поля</span>
              </Link>
            </div>
          )}
        </li>
        <li>
          <a href="#" className="flex items-center gap-3 px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
            <Icon name="Box" size={20} />
            <span>Сервисы</span>
          </a>
        </li>
        <li>
          <button 
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex items-center justify-between px-[15px] py-3 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <div className="flex items-center gap-3">
              <Icon name="Settings" size={20} />
              <span>Настройки</span>
            </div>
            <Icon 
              name="ChevronDown" 
              size={16} 
              className={`transition-transform ${settingsOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {settingsOpen && (
            <div className="mt-1 space-y-1">
              <button
                disabled
                className="w-full flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground/50 cursor-not-allowed"
              >
                <Icon name="Sliders" size={18} />
                <span>Основные настройки</span>
              </button>
              <button
                disabled
                className="w-full flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground/50 cursor-not-allowed"
              >
                <Icon name="Users" size={18} />
                <span>Пользователи</span>
              </button>
              <button
                disabled
                className="w-full flex items-center gap-3 px-[15px] py-2 ml-[35px] rounded-lg text-muted-foreground/50 cursor-not-allowed"
              >
                <Icon name="Shield" size={18} />
                <span>Права доступа</span>
              </button>
            </div>
          )}
        </li>
      </ul>
    </aside>
  );
};

export default PaymentsSidebar;