"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { OilForm } from "@/components/admin/oil-form/index";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from '@/lib/supabase/client';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';

export default function EssentialOilsAdminPage() {
  const [essentialOils, setEssentialOils] = useState<{ id: string; name_english: string; name_scientific: string; }[]>([]);
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

  const [showForm, setShowForm] = useState(false);
  const [selectedOilId, setSelectedOilId] = useState<string | null>(null);

  const handleAddNew = () => {
    setShowForm(true);
    setSelectedOilId(null);
  };

  const handleEditOil = (oilId: string) => {
    setShowForm(true);
    setSelectedOilId(oilId);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedOilId(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Essential Oils Management</h1>
        <Button 
          onClick={handleAddNew}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Oil
        </Button>
      </div>

      <div className="grid gap-6">
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{selectedOilId ? 'Edit Oil' : 'Add New Oil'}</CardTitle>
            </CardHeader>
            <CardContent>
              <OilForm oilId={selectedOilId || undefined} onClose={handleCloseForm} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Essential Oils List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <p>Loading...</p>
              ) : (
                <div className="space-y-4">
                  {essentialOils.map((oil) => (
                    <div key={oil.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold">{oil.name_english}</h3>
                          <p className="text-sm text-gray-500">{oil.name_scientific}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOil(oil.id)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
