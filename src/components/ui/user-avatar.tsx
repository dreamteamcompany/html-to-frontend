import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface UserAvatarProps {
  photoUrl?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  xs: { container: 'w-5 h-5', text: 'text-[10px]', icon: 12 },
  sm: { container: 'w-8 h-8 sm:w-10 sm:h-10', text: 'text-xs sm:text-sm', icon: 16 },
  md: { container: 'w-10 h-10', text: 'text-sm', icon: 18 },
  lg: { container: 'w-12 h-12', text: 'text-base', icon: 24 },
};

const UserAvatar = ({ photoUrl, name, size = 'md', className = '' }: UserAvatarProps) => {
  const [imgError, setImgError] = useState(false);
  const s = sizeMap[size];
  const initial = name?.charAt(0)?.toUpperCase() || '';

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={name || ''}
        className={`${s.container} rounded-full object-cover border-2 border-white/10 flex-shrink-0 ${className}`}
        onError={() => setImgError(true)}
        loading="lazy"
      />
    );
  }

  if (initial) {
    return (
      <div className={`${s.container} rounded-full bg-primary/20 flex items-center justify-center ${s.text} font-bold text-primary flex-shrink-0 ${className}`}>
        {initial}
      </div>
    );
  }

  return (
    <div className={`${s.container} rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0 ${className}`}>
      <Icon name="User" size={s.icon} />
    </div>
  );
};

export default UserAvatar;
