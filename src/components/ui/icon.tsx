import * as LucideIcons from 'lucide-react';
import { LucideProps } from 'lucide-react';

interface IconProps extends LucideProps {
  name: string;
  fallback?: string;
}

const Icon = ({ name, fallback = 'CircleAlert', ...props }: IconProps) => {
  const icons = LucideIcons as Record<string, React.ComponentType<LucideProps>>;
  const IconComponent = icons[name];

  if (IconComponent && typeof IconComponent === 'function') {
    return <IconComponent {...props} />;
  }

  const FallbackIcon = icons[fallback];
  if (FallbackIcon && typeof FallbackIcon === 'function') {
    return <FallbackIcon {...props} />;
  }

  return null;
};

export default Icon;