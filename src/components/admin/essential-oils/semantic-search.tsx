'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { SearchIcon, FilterIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';

interface SemanticSearchProps {
  onSearchResults: (results: any[]) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function SemanticSearch({
  onSearchResults,
  className,
  placeholder = 'Search essential oils...',
  disabled = false,
}: SemanticSearchProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState<'text' | 'semantic'>('text');
  const [threshold, setThreshold] = useState(0.3);
  const [error, setError] = useState<string | null>(null);
  const debouncedQuery = useDebounce(query, 500);
  const abortControllerRef = useRef<AbortController | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      onSearchResults([]);
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    setIsSearching(true);
    setError(null);

    try {
      // If semantic search is selected but query is very short, automatically fall back to text search
      const effectiveMode = searchMode === 'semantic' && searchQuery.length < 3 ? 'text' : searchMode;
      
      const response = await fetch('/api/essential-oils/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          mode: effectiveMode,
          threshold: threshold,
          limit: 20,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const result = await response.json();
      
      // Handle warnings from API
      if (result.warning && searchMode === 'semantic') {
        // API fell back to text search, show a warning
        setError("Semantic search unavailable. Using standard search instead.");
        // If in semantic mode, also switch back to text mode UI
        setSearchMode('text');
      }
      
      onSearchResults(result.data || []);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Search error:', err);
        
        // If semantic search fails, automatically fall back to text search
        if (searchMode === 'semantic') {
          setSearchMode('text');
          setError("Semantic search failed. Switched to standard search.");
          // Retry with standard search
          setTimeout(() => {
            if (searchQuery.trim()) {
              performSearch(searchQuery);
            }
          }, 500);
        } else {
          setError(err.message || 'An error occurred during search');
          onSearchResults([]);
        }
      }
    } finally {
      setIsSearching(false);
    }
  }, [searchMode, threshold, onSearchResults]);

  useEffect(() => {
    const searchIfNeeded = () => {
      if (debouncedQuery) {
        performSearch(debouncedQuery);
      } else {
        onSearchResults([]);
      }
    };

    searchIfNeeded();

    // Cleanup function to abort any ongoing search
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery, performSearch, onSearchResults]);

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={cn("pl-9 pr-12", isSearching && "pr-12")}
            disabled={disabled}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 rounded-md border px-3 py-1.5">
                  <Switch
                    id="semantic-mode"
                    checked={searchMode === 'semantic'}
                    onCheckedChange={(checked) => setSearchMode(checked ? 'semantic' : 'text')}
                  />
                  <Label htmlFor="semantic-mode" className="text-xs cursor-pointer">
                    AI Search
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Toggle between normal text search and AI-powered semantic search</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" disabled={searchMode !== 'semantic'}>
                <FilterIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">Semantic Search Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="similarity-threshold">Similarity Threshold</Label>
                    <span className="text-sm text-muted-foreground">{(threshold * 100).toFixed(0)}%</span>
                  </div>
                  <Slider
                    id="similarity-threshold"
                    defaultValue={[threshold]}
                    min={0.1}
                    max={0.9}
                    step={0.05}
                    onValueChange={(values) => setThreshold(values[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    Higher values require closer matches. Lower values find more results but may be less relevant.
                  </p>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
