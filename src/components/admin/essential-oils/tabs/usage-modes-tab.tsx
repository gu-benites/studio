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
import { UsageMode } from "../essential-oil-form-types";

interface UsageModesTabProps {
  control: any; // Control object from react-hook-form
  usageModes: UsageMode[]; // List of all available usage modes
  isLoading: boolean;
  setUsageModes: (modes: UsageMode[]) => void; // Function to update the list of all usage modes
}

export function UsageModesTab({
  control,
  usageModes,
  isLoading,
  setUsageModes
}: UsageModesTabProps) {
  const supabase = createClient();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newUsageModeName, setNewUsageModeName] = useState("");
  const [newUsageModeDesc, setNewUsageModeDesc] = useState("");

  return (
    <FormField
      control={control}
      name="usage_modes" // This name must match the key in your form schema
      render={({ field }) => {
        // `field.value` will be an array of selected usage mode IDs
        // `field.onChange` will be the function to update react-hook-form's state

        const handleAddUsageMode = async () => {
          if (!newUsageModeName.trim()) {
            toast({
              title: "Error",
              description: "Usage mode name is required",
              variant: "destructive",
            });
            return;
          }
          
          try {
            const { data, error } = await supabase
              .from('usage_modes')
              .insert({ 
                name: newUsageModeName.trim(), 
                description: newUsageModeDesc.trim() || null 
                // icon_svg is not handled in this simplified popover form
              })
              .select('id, name, description, icon_svg')
              .single();
              
            if (error) throw error;
            
            if (data) {
              const newUsageModeEntry: UsageMode = {
                id: data.id,
                name: data.name,
                description: data.description,
                icon_svg: data.icon_svg
              };
              
              // Update the global list of usage modes available for selection
              setUsageModes((prevModes) => [...prevModes, newUsageModeEntry]);
              
              // Add the new usage mode's ID to the currently selected ones for this essential oil
              const currentSelectedFormValue = Array.isArray(field.value) ? field.value : [];
              const newSelectedFormValue = [...currentSelectedFormValue, data.id];
              field.onChange(newSelectedFormValue); // Update react-hook-form state
              
              toast({
                title: "Success",
                description: "Usage mode added successfully and selected.",
              });
              
              setNewUsageModeName("");
              setNewUsageModeDesc("");
              setIsPopoverOpen(false);
            }
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message || "Failed to add usage mode",
              variant: "destructive",
            });
          }
        };

        return (
          <FormItem>
            <FormLabel>Usage Modes</FormLabel>
            <div className="flex items-center gap-2">
              <FormControl className="flex-1">
                <MultiSelect
                  options={usageModes.map(mode => ({
                    label: mode.name,
                    value: mode.id,
                  }))}
                  selected={Array.isArray(field.value) ? field.value : []} // Use field.value from RHF
                  onChange={field.onChange} // Use field.onChange from RHF
                  placeholder="Select usage modes..."
                  disabled={isLoading}
                />
              </FormControl>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add Usage Mode</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Add New Usage Mode</h4>
                    <div className="grid gap-2">
                      <Input 
                        placeholder="Enter usage mode name" 
                        value={newUsageModeName}
                        onChange={(e) => setNewUsageModeName(e.target.value)}
                      />
                      <Textarea 
                        placeholder="Enter description (optional)" 
                        className="min-h-[80px]" 
                        value={newUsageModeDesc}
                        onChange={(e) => setNewUsageModeDesc(e.target.value)}
                      />
                      {/* SVG icon input can be added here if needed */}
                      <Button 
                        size="sm" 
                        className="w-full" 
                        onClick={handleAddUsageMode}
                      >
                        Add Usage Mode
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <FormDescription>
              Select how this essential oil can be used (diffusion, topical application, etc.).
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}