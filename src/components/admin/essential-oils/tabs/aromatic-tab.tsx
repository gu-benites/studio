"use client";

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
import { useState } from "react";
import { AromaticDescriptor } from "../essential-oil-form-types";

interface AromaticTabProps {
  control: any;
  aromaticDescriptors: AromaticDescriptor[];
  selectedAromaticDescriptors: string[];
  setSelectedAromaticDescriptors: (selected: string[]) => void;
  isLoading: boolean;
  setAromaticDescriptors: (descriptors: AromaticDescriptor[]) => void;
}

export function AromaticTab({
  control,
  aromaticDescriptors,
  selectedAromaticDescriptors,
  setSelectedAromaticDescriptors,
  isLoading,
  setAromaticDescriptors
}: AromaticTabProps) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newDescriptorName, setNewDescriptorName] = useState("");
  const [newDescriptorDesc, setNewDescriptorDesc] = useState("");

  const handleAddAromaticDescriptor = async () => {
    if (!newDescriptorName.trim()) {
      toast({
        title: "Error",
        description: "Descriptor name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('aromatic_descriptors')
        .insert({ 
          name: newDescriptorName.trim(), 
          description: newDescriptorDesc.trim() || null 
        })
        .select('id, name, description')
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Ensure the new aromatic descriptor has all required properties
        const newDescriptor: AromaticDescriptor = {
          id: data.id,
          name: data.name,
          description: data.description
        };
        
        setAromaticDescriptors([...aromaticDescriptors, newDescriptor]);
        const newSelected = [...selectedAromaticDescriptors, data.id];
        setSelectedAromaticDescriptors(newSelected);
        
        toast({
          title: "Success",
          description: "Aromatic descriptor added successfully",
        });
        
        // Clear form and close popover
        setNewDescriptorName("");
        setNewDescriptorDesc("");
        setIsOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add descriptor",
        variant: "destructive",
      });
    }
  };

  return (
    <FormField
      control={control}
      name="aromatic_descriptors"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Aromatic Descriptors</FormLabel>
          <div className="flex items-center gap-2">
            <FormControl className="flex-1">
              <MultiSelect
                options={aromaticDescriptors.map(descriptor => ({
                  label: descriptor.name,
                  value: descriptor.id,
                }))}
                selected={selectedAromaticDescriptors}
                onChange={(selected) => {
                  setSelectedAromaticDescriptors(selected);
                  field.onChange(selected);
                }}
                placeholder="Select aromatic descriptors..."
                disabled={isLoading}
              />
            </FormControl>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="flex-shrink-0">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Add Descriptor</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Add New Aromatic Descriptor</h4>
                  <div className="grid gap-2">
                    <Input 
                      placeholder="Enter descriptor name" 
                      value={newDescriptorName}
                      onChange={(e) => setNewDescriptorName(e.target.value)}
                    />
                    <Textarea 
                      placeholder="Enter description (optional)" 
                      className="min-h-[80px]" 
                      value={newDescriptorDesc}
                      onChange={(e) => setNewDescriptorDesc(e.target.value)}
                    />
                    <Button 
                      size="sm" 
                      className="w-full" 
                      onClick={handleAddAromaticDescriptor}
                    >
                      Add Descriptor
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <FormDescription>
            Select the aromatic characteristics that describe this essential oil.
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
