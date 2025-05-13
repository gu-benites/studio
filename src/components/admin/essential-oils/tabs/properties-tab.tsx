"use client";

import { useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MultiSelect } from "@/components/ui/multi-select";
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Property } from "../essential-oil-form-types";

interface PropertiesTabProps {
  control: any; // Control object from react-hook-form
  properties: Property[]; // List of all available properties
  isLoading: boolean;
  setProperties: (properties: Property[]) => void; // Function to update the list of all properties
}

export function PropertiesTab({
  control,
  properties,
  isLoading,
  setProperties
}: PropertiesTabProps) {
  const supabase = createClient();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newPropertyDesc, setNewPropertyDesc] = useState("");

  return (
    <FormField
      control={control}
      name="properties" // This name must match the key in your form schema
      render={({ field }) => {
        // `field.value` will be an array of selected property IDs
        // `field.onChange` will be the function to update react-hook-form's state

        const handleAddProperty = async () => {
          if (!newPropertyName.trim()) {
            toast({
              title: "Error",
              description: "Property name is required",
              variant: "destructive",
            });
            return;
          }
          
          try {
            const { data, error } = await supabase
              .from('properties')
              .insert({ 
                name: newPropertyName.trim(), 
                description: newPropertyDesc.trim() || null 
              })
              .select('id, name, description')
              .single();
              
            if (error) throw error;
            
            if (data) {
              const newPropertyEntry: Property = {
                id: data.id,
                name: data.name,
                description: data.description
              };
              
              // Update the global list of properties available for selection
              setProperties((prevGlobalProperties) => [...prevGlobalProperties, newPropertyEntry]);
              
              // Add the new property's ID to the currently selected ones for this essential oil
              const currentSelectedFormValue = Array.isArray(field.value) ? field.value : [];
              const newSelectedFormValue = [...currentSelectedFormValue, data.id];
              field.onChange(newSelectedFormValue); // Update react-hook-form state
              
              toast({
                title: "Success",
                description: "Property added successfully and selected.",
              });
              
              setNewPropertyName("");
              setNewPropertyDesc("");
              setIsPopoverOpen(false);
            }
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message || "Failed to add property",
              variant: "destructive",
            });
          }
        };

        return (
          <FormItem>
            <FormLabel>Properties</FormLabel>
            <div className="flex items-center gap-2">
              <FormControl className="flex-1">
                <MultiSelect
                  options={properties.map(property => ({
                    label: property.name,
                    value: property.id,
                  }))}
                  selected={Array.isArray(field.value) ? field.value : []} // Use field.value from RHF
                  onChange={field.onChange} // Use field.onChange from RHF
                  placeholder="Select properties..."
                  disabled={isLoading}
                />
              </FormControl>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add Property</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Add New Property</h4>
                    <div className="grid gap-2">
                      <Input 
                        placeholder="Enter property name" 
                        value={newPropertyName}
                        onChange={(e) => setNewPropertyName(e.target.value)}
                      />
                      <Textarea 
                        placeholder="Enter property description (optional)" 
                        className="min-h-[80px]" 
                        value={newPropertyDesc}
                        onChange={(e) => setNewPropertyDesc(e.target.value)}
                      />
                      <Button 
                        size="sm" 
                        className="w-full" 
                        onClick={handleAddProperty}
                      >
                        Add Property
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <FormDescription>
              Select the therapeutic properties of this essential oil.
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}