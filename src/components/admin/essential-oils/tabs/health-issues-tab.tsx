// src/components/admin/essential-oils/tabs/health-issues-tab.tsx
"use client";

import { useState, useCallback } from "react";
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
import { HealthIssue } from "../essential-oil-form-types";
import { Control } from "react-hook-form";

interface HealthIssuesTabProps {
  control: Control<any>; // Control object from react-hook-form
  healthIssues: HealthIssue[]; // List of all available health issues from parent
  isLoading: boolean;
  setHealthIssues: (issues: HealthIssue[]) => void; // Function to update the list of all health issues in the parent
}

export function HealthIssuesTab({
  control,
  healthIssues, // This is the global list of available options
  isLoading,
  setHealthIssues // This updates the global list of available options
}: HealthIssuesTabProps) {
  const supabase = createClient();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [newHealthIssueName, setNewHealthIssueName] = useState("");
  const [newHealthIssueDesc, setNewHealthIssueDesc] = useState("");

  return (
    <FormField
      control={control}
      name="health_issues" // This name must match the key in your form schema
      render={({ field }) => {
        // field.value is expected to be an array of selected health issue IDs from RHF
        // field.onChange is the function to update RHF's state for this field

        const handleAddNewHealthIssueViaPopover = async () => {
          if (!newHealthIssueName.trim()) {
            toast({
              title: "Error",
              description: "Health issue name is required",
              variant: "destructive",
            });
            return;
          }
          
          try {
            const { data: newDbEntry, error } = await supabase
              .from('health_issues')
              .insert({ 
                name: newHealthIssueName.trim(), 
                description: newHealthIssueDesc.trim() || null 
              })
              .select('id, name, description')
              .single();
              
            if (error) throw error;
            
            if (newDbEntry) {
              const newHealthIssueForGlobalList: HealthIssue = {
                id: newDbEntry.id,
                name: newDbEntry.name,
                description: newDbEntry.description
              };
              
              // 1. Update the global list of available health issues
              setHealthIssues((prevGlobalIssues) => {
                const updatedList = [...prevGlobalIssues, newHealthIssueForGlobalList];
                console.log("[HealthIssuesTab] Updated global health issues list:", updatedList);
                return updatedList;
              });
              
              // 2. Add the new health issue's ID to the RHF field for this essential oil
              const currentSelectedIdsInForm = Array.isArray(field.value) ? field.value : [];
              const newSelectedIdsForForm = [...currentSelectedIdsInForm, newDbEntry.id];
              field.onChange(newSelectedIdsForForm); // Update react-hook-form state
              console.log("[HealthIssuesTab] Updated RHF 'health_issues' field with new ID:", newSelectedIdsForForm);
              
              toast({
                title: "Success",
                description: "Health issue added successfully and selected for this oil.",
              });
              
              setNewHealthIssueName("");
              setNewHealthIssueDesc("");
              setIsPopoverOpen(false);
            }
          } catch (error: any) {
            toast({
              title: "Error Adding Health Issue",
              description: error.message || "Failed to add health issue to database.",
              variant: "destructive",
            });
            console.error("[HealthIssuesTab] Error adding new health issue:", error);
          }
        };

        return (
          <FormItem>
            <FormLabel>Health Issues Addressed</FormLabel>
            <div className="flex items-center gap-2">
              <FormControl className="flex-1">
                <MultiSelect
                  // `options` prop should use the `healthIssues` state from EssentialOilForm,
                  // which is updated by the popover.
                  options={healthIssues.map(issue => ({
                    label: issue.name,
                    value: issue.id,
                  }))}
                  // `selected` prop directly uses `field.value` from RHF.
                  // `field.value` is expected to be an array of IDs.
                  selected={Array.isArray(field.value) ? field.value : []}
                  // `onChange` prop directly uses `field.onChange` from RHF.
                  // MultiSelect should call this with the new array of selected IDs.
                  onChange={field.onChange}
                  placeholder="Select health issues..."
                  disabled={isLoading}
                  mode="multiple" // Ensure mode is multiple
                />
              </FormControl>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="flex-shrink-0" disabled={isLoading}>
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add New Health Issue</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Add New Health Issue</h4>
                    <div className="grid gap-2">
                      <Input 
                        placeholder="Enter health issue name" 
                        value={newHealthIssueName}
                        onChange={(e) => setNewHealthIssueName(e.target.value)}
                      />
                      <Textarea 
                        placeholder="Description (optional)" 
                        className="min-h-[80px]" 
                        value={newHealthIssueDesc}
                        onChange={(e) => setNewHealthIssueDesc(e.target.value)}
                      />
                      <Button 
                        size="sm" 
                        className="w-full" 
                        onClick={handleAddNewHealthIssueViaPopover}
                      >
                        Add Health Issue
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <FormDescription>
              Select the health issues that this essential oil can help address.
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
