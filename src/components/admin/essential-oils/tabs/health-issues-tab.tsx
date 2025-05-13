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
import { HealthIssue } from "../essential-oil-form-types";

interface HealthIssuesTabProps {
  control: any; // Control object from react-hook-form
  healthIssues: HealthIssue[]; // List of all available health issues
  isLoading: boolean;
  setHealthIssues: (issues: HealthIssue[]) => void; // Function to update the list of all health issues in the parent
}

export function HealthIssuesTab({
  control,
  healthIssues,
  isLoading,
  setHealthIssues
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
        // `field.value` will be an array of selected health issue IDs
        // `field.onChange` will be the function to update react-hook-form's state

        const handleAddHealthIssue = async () => {
          if (!newHealthIssueName.trim()) {
            toast({
              title: "Error",
              description: "Health issue name is required",
              variant: "destructive",
            });
            return;
          }
          
          try {
            const { data, error } = await supabase
              .from('health_issues')
              .insert({ 
                name: newHealthIssueName.trim(), 
                description: newHealthIssueDesc.trim() || null 
              })
              .select('id, name, description')
              .single();
              
            if (error) throw error;
            
            if (data) {
              const newHealthIssueEntry: HealthIssue = {
                id: data.id,
                name: data.name,
                description: data.description
              };
              
              // Update the global list of health issues available for selection
              setHealthIssues((prevGlobalIssues) => [...prevGlobalIssues, newHealthIssueEntry]);
              
              // Add the new health issue's ID to the currently selected ones for this essential oil
              const currentSelectedFormValue = Array.isArray(field.value) ? field.value : [];
              const newSelectedFormValue = [...currentSelectedFormValue, data.id];
              field.onChange(newSelectedFormValue); // Update react-hook-form state
              
              toast({
                title: "Success",
                description: "Health issue added successfully and selected.",
              });
              
              setNewHealthIssueName("");
              setNewHealthIssueDesc("");
              setIsPopoverOpen(false);
            }
          } catch (error: any) {
            toast({
              title: "Error",
              description: error.message || "Failed to add health issue",
              variant: "destructive",
            });
          }
        };

        return (
          <FormItem>
            <FormLabel>Health Issues</FormLabel>
            <div className="flex items-center gap-2">
              <FormControl className="flex-1">
                <MultiSelect
                  options={healthIssues.map(issue => ({
                    label: issue.name,
                    value: issue.id,
                  }))}
                  selected={Array.isArray(field.value) ? field.value : []} // Use field.value from RHF
                  onChange={field.onChange} // Use field.onChange from RHF
                  placeholder="Select health issues..."
                  disabled={isLoading}
                />
              </FormControl>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add Health Issue</span>
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
                        placeholder="Enter description (optional)" 
                        className="min-h-[80px]" 
                        value={newHealthIssueDesc}
                        onChange={(e) => setNewHealthIssueDesc(e.target.value)}
                      />
                      <Button 
                        size="sm" 
                        className="w-full" 
                        onClick={handleAddHealthIssue}
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