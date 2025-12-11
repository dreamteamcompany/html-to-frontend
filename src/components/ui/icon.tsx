import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
  fallback?: string;
}

const Icon = ({ name, fallback = 'CircleAlert', ...props }: IconProps) => {
  const icons = LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>;
  const IconComponent = icons[name];

  if (!IconComponent || typeof IconComponent !== 'function') {
    const FallbackIcon = icons[fallback];
    
    if (!FallbackIcon || typeof FallbackIcon !== 'function') {
      return <span className="inline-block w-4 h-4" />;
    }

    return <FallbackIcon {...props} />;
  }

  return <IconComponent {...props} />;
};

export default Icon;