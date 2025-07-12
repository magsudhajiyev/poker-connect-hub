'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, Filter, X, Calendar, DollarSign, Users, Layers } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchFilters {
  searchQuery: string;
  contentType: 'all' | 'posts' | 'hands';
  gameType?: string[];
  stakes?: string[];
  positions?: string[];
  dateRange?: 'today' | 'week' | 'month' | 'year' | 'all';
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

const gameTypes = ["Texas Hold'em", 'Omaha', 'PLO', 'Stud', 'Mixed Games'];
const stakesOptions = ['Micro', 'Low', 'Mid', 'High', 'Nosebleed'];
const positionOptions = ['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'];

export const SearchBar = ({ onSearch, initialFilters }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || '');
  const [contentType, setContentType] = useState<SearchFilters['contentType']>(
    initialFilters?.contentType || 'all',
  );
  const [selectedGameTypes, setSelectedGameTypes] = useState<string[]>(
    initialFilters?.gameType || [],
  );
  const [selectedStakes, setSelectedStakes] = useState<string[]>(initialFilters?.stakes || []);
  const [selectedPositions, setSelectedPositions] = useState<string[]>(
    initialFilters?.positions || [],
  );
  const [dateRange, setDateRange] = useState<SearchFilters['dateRange']>(
    initialFilters?.dateRange || 'all',
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Count active filters
  const activeFilterCount =
    (contentType !== 'all' ? 1 : 0) +
    selectedGameTypes.length +
    selectedStakes.length +
    selectedPositions.length +
    (dateRange !== 'all' ? 1 : 0);

  // Trigger search when filters change
  useEffect(() => {
    const filters: SearchFilters = {
      searchQuery: debouncedSearchQuery,
      contentType,
      ...(selectedGameTypes.length > 0 && { gameType: selectedGameTypes }),
      ...(selectedStakes.length > 0 && { stakes: selectedStakes }),
      ...(selectedPositions.length > 0 && { positions: selectedPositions }),
      ...(dateRange !== 'all' && { dateRange }),
    };
    onSearch(filters);
  }, [
    debouncedSearchQuery,
    contentType,
    selectedGameTypes,
    selectedStakes,
    selectedPositions,
    dateRange,
    onSearch,
  ]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleClearAllFilters = useCallback(() => {
    setContentType('all');
    setSelectedGameTypes([]);
    setSelectedStakes([]);
    setSelectedPositions([]);
    setDateRange('all');
    setIsFilterOpen(false);
  }, []);

  const toggleGameType = (gameType: string) => {
    setSelectedGameTypes((prev) =>
      prev.includes(gameType) ? prev.filter((g) => g !== gameType) : [...prev, gameType],
    );
  };

  const toggleStakes = (stakes: string) => {
    setSelectedStakes((prev) =>
      prev.includes(stakes) ? prev.filter((s) => s !== stakes) : [...prev, stakes],
    );
  };

  const togglePosition = (position: string) => {
    setSelectedPositions((prev) =>
      prev.includes(position) ? prev.filter((p) => p !== position) : [...prev, position],
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search posts, hands, or users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-400"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filter Button */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-700"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-slate-900 border-slate-800 text-slate-200 w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle className="text-slate-200">Filter Content</SheetTitle>
              <SheetDescription className="text-slate-400">
                Refine your search with specific filters
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Content Type */}
              <div>
                <Label className="text-slate-200 mb-3 block">Content Type</Label>
                <RadioGroup
                  value={contentType}
                  onValueChange={(value) => setContentType(value as SearchFilters['contentType'])}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="font-normal cursor-pointer">
                      All Content
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="posts" id="posts" />
                    <Label htmlFor="posts" className="font-normal cursor-pointer">
                      Posts Only
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hands" id="hands" />
                    <Label htmlFor="hands" className="font-normal cursor-pointer">
                      Hands Only
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Game Types */}
              <div>
                <Label className="text-slate-200 mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Game Types
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {gameTypes.map((gameType) => (
                    <label key={gameType} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGameTypes.includes(gameType)}
                        onChange={() => toggleGameType(gameType)}
                        className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-sm">{gameType}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stakes */}
              <div>
                <Label className="text-slate-200 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Stakes Level
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {stakesOptions.map((stakes) => (
                    <label key={stakes} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStakes.includes(stakes)}
                        onChange={() => toggleStakes(stakes)}
                        className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-sm">{stakes}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Positions */}
              <div>
                <Label className="text-slate-200 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Positions
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {positionOptions.map((position) => (
                    <label key={position} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPositions.includes(position)}
                        onChange={() => togglePosition(position)}
                        className="rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                      />
                      <span className="text-sm">{position}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <Label className="text-slate-200 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Date Range
                </Label>
                <RadioGroup
                  value={dateRange}
                  onValueChange={(value) => setDateRange(value as SearchFilters['dateRange'])}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="today" id="today" />
                      <Label htmlFor="today" className="font-normal cursor-pointer">
                        Today
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="week" id="week" />
                      <Label htmlFor="week" className="font-normal cursor-pointer">
                        This Week
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="month" id="month" />
                      <Label htmlFor="month" className="font-normal cursor-pointer">
                        This Month
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="year" id="year" />
                      <Label htmlFor="year" className="font-normal cursor-pointer">
                        This Year
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Clear Filters Button */}
              {activeFilterCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleClearAllFilters}
                  className="w-full border-slate-700 text-slate-200 hover:bg-slate-800"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {contentType !== 'all' && (
            <Badge variant="secondary" className="bg-slate-800 text-slate-200">
              {contentType === 'posts' ? 'Posts Only' : 'Hands Only'}
            </Badge>
          )}
          {selectedGameTypes.map((gameType) => (
            <Badge key={gameType} variant="secondary" className="bg-slate-800 text-slate-200">
              {gameType}
            </Badge>
          ))}
          {selectedStakes.map((stakes) => (
            <Badge key={stakes} variant="secondary" className="bg-slate-800 text-slate-200">
              {stakes} Stakes
            </Badge>
          ))}
          {selectedPositions.map((position) => (
            <Badge key={position} variant="secondary" className="bg-slate-800 text-slate-200">
              {position}
            </Badge>
          ))}
          {dateRange !== 'all' && (
            <Badge variant="secondary" className="bg-slate-800 text-slate-200">
              {dateRange === 'today' && 'Today'}
              {dateRange === 'week' && 'This Week'}
              {dateRange === 'month' && 'This Month'}
              {dateRange === 'year' && 'This Year'}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAllFilters}
            className="h-6 px-2 text-slate-400 hover:text-slate-200"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};
