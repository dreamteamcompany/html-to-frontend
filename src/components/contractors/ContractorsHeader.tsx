import Icon from '@/components/ui/icon';

interface ContractorsHeaderProps {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

const ContractorsHeader = ({ menuOpen, setMenuOpen }: ContractorsHeaderProps) => {
  return (
    <header className="flex items-center gap-4 mb-6 md:mb-[30px] px-4 md:px-[25px] py-4 md:py-[18px] bg-card dark:bg-[#1b254b]/50 backdrop-blur-[20px] rounded-[15px] border border-border dark:border-white/10">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="lg:hidden p-2 text-foreground dark:text-white"
      >
        <Icon name="Menu" size={24} />
      </button>
    </header>
  );
};

export default ContractorsHeader;