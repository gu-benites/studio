import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, type Database } from '@/lib/supabase';

export type TherapeuticProperty = Database['public']['Tables']['eo_therapeutic_properties']['Row'];

type UseTherapeuticPropertiesReturn = {
  // Data
  properties: TherapeuticProperty[];
  isLoading: boolean;
  error: Error | null;
  
  // Methods
  createProperty: (name: string) => Promise<TherapeuticProperty>;
  isCreating: boolean;
  getPropertyById: (id: string) => TherapeuticProperty | undefined;
  getSelectedProperties: (ids: string[]) => TherapeuticProperty[];
  searchProperties: (searchTerm: string) => TherapeuticProperty[];
  propertyExists: (name: string) => boolean;
  refetch: () => Promise<unknown>;
};

export function useTherapeuticProperties(): UseTherapeuticPropertiesReturn {
  const queryClient = useQueryClient();

  // Fetch all therapeutic properties
  const {
    data: properties = [],
    isLoading,
    error,
    refetch,
  } = useQuery<TherapeuticProperty[], Error>({
    queryKey: ['therapeutic-properties'],
    queryFn: async (): Promise<TherapeuticProperty[]> => {
      const { data, error: queryError } = await supabase
        .from('eo_therapeutic_properties')
        .select('*')
        .order('property_name');
      
      if (queryError) {
        console.error('Error fetching therapeutic properties:', queryError);
        throw queryError;
      }
      
      return data || [];
    },
  });

  // Mutation for creating a new property
  const createMutation = useMutation<TherapeuticProperty, Error, string>({
    mutationFn: async (propertyName: string): Promise<TherapeuticProperty> => {
      const { data, error: mutationError } = await supabase
        .from('eo_therapeutic_properties')
        .insert({ property_name: propertyName })
        .select()
        .single();
      
      if (mutationError) {
        console.error('Error creating therapeutic property:', mutationError);
        throw mutationError;
      }
      
      if (!data) {
        throw new Error('No data returned after creating property');
      }
      
      return data;
    },
    onSuccess: () => {
      // Invalidate the query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['therapeutic-properties'] });
    },
  });

  // Helper to get property by ID
  const getPropertyById = (id: string): TherapeuticProperty | undefined => {
    return properties.find(prop => prop.id === id);
  };

  // Helper to get selected properties
  const getSelectedProperties = (ids: string[]): TherapeuticProperty[] => {
    if (!ids || !Array.isArray(ids)) return [];
    return properties.filter(prop => ids.includes(prop.id));
  };

  // Helper to search properties
  const searchProperties = (searchTerm: string): TherapeuticProperty[] => {
    if (!searchTerm.trim()) return properties;
    const term = searchTerm.toLowerCase();
    return properties.filter(prop =>
      prop.property_name.toLowerCase().includes(term)
    );
  };

  // Check if property name already exists
  const propertyExists = (name: string): boolean => {
    if (!name.trim()) return false;
    return properties.some(
      prop => prop.property_name.toLowerCase() === name.toLowerCase()
    );
  };

  return {
    // Data
    properties,
    isLoading,
    error: error || null,
    
    // Methods
    createProperty: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    getPropertyById,
    getSelectedProperties,
    searchProperties,
    propertyExists,
    refetch,
  };
}

export default useTherapeuticProperties;
