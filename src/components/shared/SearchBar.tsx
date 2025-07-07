'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useUserSearch } from '@/hooks/useUserSearch';
import { useRouter } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onUserSelect?: (userId: string) => void;
  autoFocus?: boolean;
}

export const SearchBar = ({
  placeholder = 'Search users...',
  className = '',
  onUserSelect,
  autoFocus = false,
}: SearchBarProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, loading, error, searchQuery, setSearchQuery, clearResults } = useUserSearch();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open dropdown when there are results or loading
  useEffect(() => {
    setIsOpen(results.length > 0 || loading || Boolean(error));
  }, [results.length, loading, error]);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleUserClick = (userId: string) => {
    setIsOpen(false);
    clearResults();

    if (onUserSelect) {
      onUserSelect(userId);
    } else {
      router.push(`/profile/${userId}`);
    }
  };

  const handleClear = () => {
    clearResults();
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case 'both':
        return '🎯';
      case 'username':
        return '📧';
      case 'name':
        return '👤';
      default:
        return '';
    }
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-md ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          autoFocus={autoFocus}
          className="pl-10 pr-10 bg-slate-800/50 border-slate-700/30 text-slate-200 placeholder-slate-400 focus:border-emerald-500/50 focus:ring-emerald-500/20"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-700/50"
          >
            <X className="w-4 h-4 text-slate-400" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/30 rounded-lg shadow-2xl max-h-80 overflow-y-auto z-50">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-500 mr-2" />
              <span className="text-slate-400 text-sm">Searching...</span>
            </div>
          )}

          {error && <div className="px-4 py-3 text-red-400 text-sm">{error}</div>}

          {!loading && !error && results.length === 0 && searchQuery.length >= 2 && (
            <div className="px-4 py-3 text-slate-400 text-sm">
              No users found for "{searchQuery}"
            </div>
          )}

          {!loading && results.length > 0 && (
            <>
              <div className="px-3 py-2 border-b border-slate-700/30">
                <span className="text-xs text-slate-500">
                  {results.length} user{results.length !== 1 ? 's' : ''} found
                </span>
              </div>

              {results.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserClick(user.id)}
                  className="w-full px-4 py-3 hover:bg-slate-800/50 transition-colors flex items-center gap-3 text-left"
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={user.picture} />
                    <AvatarFallback className="bg-slate-700 text-slate-200">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-200 truncate">{user.name}</span>
                      <span className="text-xs">{getMatchTypeIcon(user.matchType)}</span>
                    </div>
                    <div className="text-sm text-slate-400 truncate">{user.username}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <div className="px-4 py-3 text-slate-400 text-sm">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
};
