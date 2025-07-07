import { useState, useEffect, useCallback } from 'react';

interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  picture: string;
  username: string;
  matchType: 'name' | 'username' | 'both';
}

interface UseUserSearchReturn {
  results: UserSearchResult[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearResults: () => void;
}

export const useUserSearch = (debounceMs: number = 300): UseUserSearchReturn => {
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchQuery, debounceMs]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`);

        const data = await response.json();

        if (data.success) {
          setResults(data.data.users || []);
        } else {
          setError(data.error?.message || 'Failed to search users');
          setResults([]);
        }
      } catch (_err) {
        setError('Network error occurred while searching');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [debouncedQuery]);

  const clearResults = useCallback(() => {
    setResults([]);
    setSearchQuery('');
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    clearResults,
  };
};
