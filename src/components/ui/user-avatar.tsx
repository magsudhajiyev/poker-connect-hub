'use client';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

const iconSizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

export const UserAvatar = ({ src, name, size = 'md', className, onClick }: UserAvatarProps) => {
  // Get initials from name
  const getInitials = (name: string | null | undefined) => {
    if (!name) {
      return '';
    }
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <Avatar className={cn(sizeClasses[size], className)} onClick={onClick}>
      {src && <AvatarImage src={src} alt={name || 'User avatar'} />}
      <AvatarFallback className="bg-slate-700 text-slate-300">
        {initials || <User className={cn(iconSizes[size], 'text-slate-400')} />}
      </AvatarFallback>
    </Avatar>
  );
};
