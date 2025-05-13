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
  control: any; // Control object from react-hook-form
  aromaticDescriptors: AromaticDescriptor[]; // List of all available aromatic descriptors
  isLoading: boolean;
  setAromaticDescriptors: (descriptors: AromaticDescriptor[]) => void; // Function to update the list of all descriptors
}

export function AromaticTab({
  control,
  aromaticDescriptors,
  isLoading,
  setAromaticDescriptors
}: AromaticTabProps) {
  const supabase = createClient();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newDescriptorName, setNewDescriptorName] = useState("");
  // const [newDescriptorDesc, setNewDescriptorDesc] = useState(""); // Assuming no description for aromatic_descriptors

  return (
    <FormField
      control={control}
      name="aromatic_descriptors" // This name must match the key in your form schema
      render={({ field }) => {
        // `field.value` will be an array of selected descriptor IDs
        // `field.onChange` will be the function to update react-hook-form's state

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
                descriptor: newDescriptorName.trim(), 
                // description: newDescriptorDesc.trim() || null // Uncomment if description exists
              })
              .select('id, descriptor') // Select 'descriptor' (actual column name)
              .single();
              
            if (error) throw error;
            
            if (data) {
              const newDescriptorEntry: AromaticDescriptor = {
                id: data.id,
                name: data.descriptor, // Map 'descriptor' to 'name' for our type
                description: null // Assuming no description column for now
              };
              
              // Update the global list of descriptors available for selection
              setAromaticDescriptors((prevDescriptors) => [...prevDescriptors, newDescriptorEntry]);
              
              // Add the new descriptor's ID to the currently selected ones for this essential oil
              const currentSelectedFormValue = Array.isArray(field.value) ? field.value : [];
              const newSelectedFormValue = [...currentSelectedFormValue, data.id];
              field.onChange(newSelectedFormValue); // Update react-hook-form state
              
              toast({
                title: "Success",
                description: "Aromatic descriptor added successfully and selected.",
              });
              
              setNewDescriptorName("");
              // setNewDescriptorDesc(""); // Uncomment if description exists
              setIsPopoverOpen(false);
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
          <FormItem>
            <FormLabel>Aromatic Descriptors</FormLabel>
            <div className="flex items-center gap-2">
              <FormControl className="flex-1">
                <MultiSelect
                  options={aromaticDescriptors.map(descriptor => ({
                    label: descriptor.name, // Use 'name' from our AromaticDescriptor type
                    value: descriptor.id,
                  }))}
                  selected={Array.isArray(field.value) ? field.value : []} // Use field.value from RHF
                  onChange={field.onChange} // Use field.onChange from RHF
                  placeholder="Select aromatic descriptors..."
                  disabled={isLoading}
                />
              </FormControl>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
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
                      {/* If your DB table 'aromatic_descriptors' has a description column: */}
                      {/* <Textarea 
                        placeholder="Enter description (optional)" 
                        className="min-h-[80px]" 
                        value={newDescriptorDesc}
                        onChange={(e) => setNewDescriptorDesc(e.target.value)}
                      /> */}
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
        );
      }}
    />
  );
}