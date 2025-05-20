import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase, type Database } from '@/lib/supabase';

type TherapeuticProperty = Database['public']['Tables']['eo_therapeutic_properties']['Row'];

interface TherapeuticPropertiesSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  maxSelections?: number;
}

export function TherapeuticPropertiesSelect({
  value = [],
  onChange,
  className,
  placeholder = 'Search therapeutic properties...',
  disabled = false,
  maxSelections,
}: TherapeuticPropertiesSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  // Fetch all therapeutic properties
  const { data: allProperties = [], isLoading } = useQuery<TherapeuticProperty[]>({
    queryKey: ['therapeutic-properties'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eo_therapeutic_properties')
        .select('*')
        .order('property_name');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Mutation for creating a new property
  const createMutation = useMutation({
    mutationFn: async (propertyName: string) => {
      const { data, error } = await supabase
        .from('eo_therapeutic_properties')
        .insert({ property_name: propertyName })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newProperty) => {
      // Add the new property to the current selection
      if (!value.includes(newProperty.id)) {
        onChange([...value, newProperty.id]);
      }
      // Invalidate the query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['therapeutic-properties'] });
      setSearch('');
      setOpen(false);
    },
  });

  // Get selected properties
  const selectedProperties = useMemo(() => {
    return allProperties.filter(prop => value.includes(prop.id));
  }, [allProperties, value]);

  // Filter properties based on search
  const filteredProperties = useMemo(() => {
    if (!search.trim()) return allProperties;
    return allProperties.filter(prop =>
      prop.property_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [allProperties, search]);

  // Check if search matches any existing property
  const showCreateOption = useMemo(() => {
    if (!search.trim()) return false;
    return !allProperties.some(
      prop => prop.property_name.toLowerCase() === search.toLowerCase()
    );
  }, [allProperties, search]);

  const handleSelect = (propertyId: string) => {
    if (value.includes(propertyId)) {
      onChange(value.filter(id => id !== propertyId));
    } else if (!maxSelections || value.length < maxSelections) {
      onChange([...value, propertyId]);
    }
  };

  const handleCreateNew = async () => {
    if (search.trim()) {
      await createMutation.mutateAsync(search.trim());
    }
  };

  const removeProperty = (propertyId: string) => {
    onChange(value.filter(id => id !== propertyId));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap gap-2">
        {selectedProperties.map(property => (
          <Badge key={property.id} variant="secondary" className="flex items-center gap-1">
            {property.property_name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeProperty(property.id);
              }}
              className="ml-1 rounded-full hover:bg-accent hover:text-accent-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled || (maxSelections !== undefined && value.length >= maxSelections)}
          >
            {placeholder}
            <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search properties..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? 'Loading...' : 'No properties found.'}
              </CommandEmpty>
              
              {showCreateOption && (
                <CommandItem
                  onSelect={handleCreateNew}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create "{search}"
                </CommandItem>
              )}

              <CommandGroup>
                {filteredProperties.map((property) => {
                  const isSelected = value.includes(property.id);
                  return (
                    <CommandItem
                      key={property.id}
                      onSelect={() => handleSelect(property.id)}
                      className="cursor-pointer"
                    >
                      <div className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}>
                        <Check className={cn('h-4 w-4')} />
                      </div>
                      {property.property_name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
