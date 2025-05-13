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
  control: any;
  usageModes: UsageMode[];
  selectedUsageModes: string[];
  setSelectedUsageModes: (selected: string[]) => void;
  isLoading: boolean;
  setUsageModes: (modes: UsageMode[]) => void;
}

export function UsageModesTab({
  control,
  usageModes,
  selectedUsageModes,
  setSelectedUsageModes,
  isLoading,
  setUsageModes
}: UsageModesTabProps) {
  const supabase = createClient();
  const [isOpen, setIsOpen] = useState(false);
  const [newUsageModeName, setNewUsageModeName] = useState("");
  const [newUsageModeDesc, setNewUsageModeDesc] = useState("");

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
        })
        .select('id, name, description, icon_svg')
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Ensure the new usage mode has all required properties
        const newUsageMode: UsageMode = {
          id: data.id,
          name: data.name,
          description: data.description,
          icon_svg: data.icon_svg
        };
        
        setUsageModes([...usageModes, newUsageMode]);
        const newSelected = [...selectedUsageModes, data.id];
        setSelectedUsageModes(newSelected);
        
        toast({
          title: "Success",
          description: "Usage mode added successfully",
        });
        
        // Clear form and close popover
        setNewUsageModeName("");
        setNewUsageModeDesc("");
        setIsOpen(false);
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
    <FormField
      control={control}
      name="usage_modes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Usage Modes</FormLabel>
          <div className="flex items-center gap-2">
            <FormControl className="flex-1">
              <MultiSelect
                options={usageModes.map(mode => ({
                  label: mode.name,
                  value: mode.id,
                }))}
                selected={selectedUsageModes}
                onChange={(selected) => {
                  setSelectedUsageModes(selected);
                  field.onChange(selected);
                }}
                placeholder="Select usage modes..."
                disabled={isLoading}
              />
            </FormControl>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
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
      )}
    />
  );
}
