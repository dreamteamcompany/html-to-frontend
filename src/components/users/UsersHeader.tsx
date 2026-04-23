import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

interface UsersHeaderProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const UsersHeader = ({ menuOpen, setMenuOpen }: UsersHeaderProps) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-[30px] px-4 md:px-[25px] py-4 md:py-[18px] bg-card dark:bg-[#1b254b]/50 backdrop-blur-[20px] rounded-[15px] border border-border dark:border-white/10">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="lg:hidden p-2 text-foreground dark:text-white"
      >
        <Icon name="Menu" size={24} />
      </button>
      <div className="flex items-center gap-3 bg-card border border-border dark:border-white/10 rounded-[15px] px-4 md:px-5 py-2 md:py-[10px] w-full">
        <Icon name="Search" size={20} className="text-muted-foreground" />
        <Input 
          type="text" 
          placeholder="Поиск пользователей..." 
          className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
        />
      </div>
    </header>
  );
};

export default UsersHeader;