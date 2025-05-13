'use client';

import { Control, Controller, FieldValues } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from '@/components/ui/multi-select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';
import { PlantPart } from '../essential-oil-form-types';


interface BasicInfoTabProps {
  control: Control<any>; // Use 'any' or a more specific form values type if available
  plantParts: PlantPart[];
  isLoading: boolean;
  setPlantParts: (parts: PlantPart[]) => void;
  // Remove selectedPlantParts and setSelectedPlantParts if RHF handles it via 'field'
}

export function BasicInfoTab({ 
  control, 
  plantParts,
  isLoading,
  setPlantParts
}: BasicInfoTabProps) {
  const supabase = createClient();
  const [isPlantPartPopoverOpen, setIsPlantPartPopoverOpen] = useState(false);
  const [newPlantPartName, setNewPlantPartName] = useState("");
  const [newPlantPartDesc, setNewPlantPartDesc] = useState("");

  return (
    <>
      <FormField
        control={control}
        name="name_english"
        render={({ field }) => (
          <FormItem>
            <FormLabel>English Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter essential oil name in English" {...field} />
            </FormControl>
            <FormDescription>
              Provide the common or commercial name of the essential oil.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="name_scientific"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Scientific Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter scientific botanical name" {...field} />
            </FormControl>
            <FormDescription>
              Provide the precise botanical/Latin name of the plant.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="name_portuguese"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Portuguese Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter essential oil name in Portuguese" {...field} />
            </FormControl>
            <FormDescription>
              Provide the name of the essential oil in Portuguese.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="plant_parts"
        render={({ field }) => {
          const handleAddPlantPart = async () => {
            if (!newPlantPartName.trim()) {
              toast({ title: "Error", description: "Plant part name is required", variant: "destructive" });
              return;
            }
            try {
              const { data, error } = await supabase
                .from('plant_parts')
                .insert({ name: newPlantPartName.trim(), description: newPlantPartDesc.trim() || null })
                .select('id, name, description').single();
              if (error) throw error;
              if (data) {
                const newPart: PlantPart = { id: data.id, name: data.name, description: data.description };
                setPlantParts((prev) => [...prev, newPart]);
                const currentSelected = Array.isArray(field.value) ? field.value : [];
                field.onChange([...currentSelected, newPart.id]);
                toast({ title: "Success", description: "Plant part added and selected." });
                setNewPlantPartName("");
                setNewPlantPartDesc("");
                setIsPlantPartPopoverOpen(false);
              }
            } catch (e: any) {
              toast({ title: "Error", description: e.message || "Failed to add plant part", variant: "destructive" });
            }
          };

          return (
            <FormItem>
              <FormLabel>Plant Parts Used</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl className="flex-1">
                  <MultiSelect
                    options={plantParts.map(part => ({ label: part.name, value: part.id }))}
                    selected={Array.isArray(field.value) ? field.value : []}
                    onChange={field.onChange}
                    placeholder="Select plant parts used"
                    disabled={isLoading}
                  />
                </FormControl>
                <Popover open={isPlantPartPopoverOpen} onOpenChange={setIsPlantPartPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="flex-shrink-0">
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add Plant Part</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Add New Plant Part</h4>
                      <div className="grid gap-2">
                        <Input placeholder="Enter plant part name" value={newPlantPartName} onChange={(e) => setNewPlantPartName(e.target.value)} />
                        <Textarea placeholder="Description (optional)" className="min-h-[80px]" value={newPlantPartDesc} onChange={(e) => setNewPlantPartDesc(e.target.value)} />
                        <Button size="sm" className="w-full" onClick={handleAddPlantPart}>Add Plant Part</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <FormDescription>
                Select the parts of the plant used in this essential oil extraction.
              </FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      <FormField
        control={control}
        name="general_description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>General Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Provide a comprehensive description of the essential oil"
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Write a detailed description about the essential oil, its origin, and characteristics.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}