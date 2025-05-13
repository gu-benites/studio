"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { EssentialOilsList } from "@/components/admin/essential-oils/essential-oils-list";
import { SemanticSearch } from "@/components/admin/essential-oils/semantic-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from '@/lib/supabase/client';

export default function EssentialOilsAdminPage() {
  const [essentialOils, setEssentialOils] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEssentialOils = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('essential_oils')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEssentialOils(data || []);
    } catch (error) {
      console.error('Error fetching essential oils:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEssentialOils();
  }, [fetchEssentialOils]);

  const handleSearchResults = useCallback((results: any[]) => {
    setEssentialOils(results);
    setIsLoading(false);
  }, []);

  const memoizedSearchProps = useMemo(() => ({
    onSearchResults: handleSearchResults
  }), [handleSearchResults]);

  const memoizedListProps = useMemo(() => ({
    essentialOils, 
    isLoading
  }), [essentialOils, isLoading]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Essential Oils Search</CardTitle>
          </CardHeader>
          <CardContent>
            <SemanticSearch {...memoizedSearchProps} />
          </CardContent>
        </Card>
        
        <EssentialOilsList {...memoizedListProps} />
      </div>
    </div>
  );
}
