// src/components/admin/essential-oils/tabs/safety-tab.tsx
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
import { SafetyCharacteristic } from "../essential-oil-form-types";

interface SafetyTabProps {
  control: any; // Control object from react-hook-form
  safetyCharacteristics: SafetyCharacteristic[]; // List of all available safety characteristics
  isLoading: boolean;
  setSafetyCharacteristics: (characteristics: SafetyCharacteristic[]) => void; // Function to update the list
}

export function SafetyTab({
  control,
  safetyCharacteristics,
  isLoading,
  setSafetyCharacteristics
}: SafetyTabProps) {
  const supabase = createClient();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newSafetyCharacteristicName, setNewSafetyCharacteristicName] = useState("");
  const [newSafetyCharacteristicDesc, setNewSafetyCharacteristicDesc] = useState("");
  const [newSeverityLevel, setNewSeverityLevel] = useState<number | undefined>(undefined);

  return (
    <FormField
      control={control}
      name="safety_characteristics" // This name must match the key in your form schema
      render={({ field }) => {
        // `field.value` will be an array of selected characteristic IDs
        // `field.onChange` will be the function to update react-hook-form's state

        const handleAddSafetyCharacteristic = async () => {
          if (!newSafetyCharacteristicName.trim()) {
            toast({
              title: "Error",
              description: "Safety characteristic name is required",
              variant: "destructive",
            });
            return;
          }
          
          try {
            const { data, error } = await supabase
              .from('safety_characteristics')
              .insert({ 
                name: newSafetyCharacteristicName.trim(), 
                description: newSafetyCharacteristicDesc.trim() || null,
                severity_level: newSeverityLevel ?? null, // Use null if undefined
              })
              .select('id, name, description, severity_level')
              .single();
              
            if (error) throw error;
            
            if (data) {
              const newCharacteristic: SafetyCharacteristic = {
                id: data.id,
                name: data.name,
                description: data.description,
                severity_level: data.severity_level
              };
              
              // Update the global list of safety characteristics available for selection
              setSafetyCharacteristics((prevChars) => [...prevChars, newCharacteristic]);
              
              // Add the new characteristic's ID to the currently selected ones
              const currentSelectedFormValue = Array.isArray(field.value) ? field.value : [];
              const newSelectedFormValue = [...currentSelectedFormValue, data.id];
              field.onChange(newSelectedFormValue); // Update react-hook-form state
              
              toast({
                title: "Success",
                description: "Safety characteristic added successfully and selected.",
              });
              
              setNewSafetyCharacteristicName("");
              setNewSafetyCharacteristicDesc("");
              setNewSeverityLevel(undefined);
              setIsPopoverOpen(false);
            }
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message || "Failed to add safety characteristic",
              variant: "destructive",
            });
          }
        };

        return (
          <FormItem>
            <FormLabel>Safety Characteristics</FormLabel>
            <div className="flex items-center gap-2">
              <FormControl className="flex-1">
                <MultiSelect
                  options={safetyCharacteristics.map(char => ({
                    label: char.name + (char.severity_level ? ` (Severity: ${char.severity_level})` : ''),
                    value: char.id,
                  }))}
                  selected={Array.isArray(field.value) ? field.value : []} // Use field.value from RHF
                  onChange={field.onChange} // Use field.onChange from RHF
                  placeholder="Select safety characteristics..."
                  disabled={isLoading}
                />
              </FormControl>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add Safety Characteristic</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Add New Safety Characteristic</h4>
                    <div className="grid gap-2">
                      <Input 
                        placeholder="Enter characteristic name" 
                        value={newSafetyCharacteristicName}
                        onChange={(e) => setNewSafetyCharacteristicName(e.target.value)}
                      />
                      <Textarea 
                        placeholder="Enter description (optional)" 
                        className="min-h-[80px]" 
                        value={newSafetyCharacteristicDesc}
                        onChange={(e) => setNewSafetyCharacteristicDesc(e.target.value)}
                      />
                      <Input
                          type="number"
                          placeholder="Severity level (optional, 1-3)"
                          value={newSeverityLevel === undefined ? '' : newSeverityLevel.toString()}
                          onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setNewSeverityLevel(isNaN(val) ? undefined : Math.max(1, Math.min(3, val)));
                          }}
                          min="1"
                          max="3"
                      />
                      <Button 
                        size="sm" 
                        className="w-full" 
                        onClick={handleAddSafetyCharacteristic}
                      >
                        Add Characteristic
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <FormDescription>
              Select relevant safety warnings or guidelines for this essential oil.
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}