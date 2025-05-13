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
  control: any;
  properties: Property[];
  selectedProperties: string[];
  setSelectedProperties: (selected: string[]) => void;
  isLoading: boolean;
  setProperties: (properties: Property[]) => void;
}

export function PropertiesTab({
  control,
  properties,
  selectedProperties,
  setSelectedProperties,
  isLoading,
  setProperties
}: PropertiesTabProps) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newPropertyName, setNewPropertyName] = useState("");
  const [newPropertyDesc, setNewPropertyDesc] = useState("");

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
        // Ensure the new property has all required properties
        const newProperty: Property = {
          id: data.id,
          name: data.name,
          description: data.description
        };
        
        setProperties([...properties, newProperty]);
        const newSelected = [...selectedProperties, data.id];
        setSelectedProperties(newSelected);
        
        toast({
          title: "Success",
          description: "Property added successfully",
        });
        
        // Clear form and close popover
        setNewPropertyName("");
        setNewPropertyDesc("");
        setIsOpen(false);
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
    <FormField
      control={control}
      name="properties"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Properties</FormLabel>
          <div className="flex items-center gap-2">
            <FormControl className="flex-1">
              <MultiSelect
                options={properties.map(property => ({
                  label: property.name,
                  value: property.id,
                }))}
                selected={selectedProperties}
                onChange={(selected) => {
                  setSelectedProperties(selected);
                  field.onChange(selected);
                }}
                placeholder="Select properties..."
                disabled={isLoading}
              />
            </FormControl>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
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
      )}
    />
  );
}
