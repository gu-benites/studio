// src/components/admin/essential-oils/essential-oil-form-chemical-tab.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/components/ui/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Slider } from "@/components/ui/slider";
import { ChemicalCompoundEntry, ChemicalFormProps, ChemicalCompound } from "./essential-oil-form-types";


export function ChemicalCompoundsTab({
  compounds, // This is the list of ALL available compounds
  selectedCompounds, // This is the list of compounds linked TO THIS ESSENTIAL OIL
  setSelectedCompounds, // This updates the linked compounds for THIS ESSENTIAL OIL
  onChange, // RHF onChange for the chemical_compounds field
  isLoading,
  setCompounds // This updates the list of ALL available compounds in the parent form
}: ChemicalFormProps) {
  const supabase = createClient();
  const [currentSelectedCompoundId, setCurrentSelectedCompoundId] = useState<string>("");
  const [minPercentage, setMinPercentage] = useState<number>(0);
  const [maxPercentage, setMaxPercentage] = useState<number>(0);
  const [typicalPercentage, setTypicalPercentage] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [newCompoundName, setNewCompoundName] = useState("");
  const [newCompoundDesc, setNewCompoundDesc] = useState("");

  const handleAddCompoundToEssentialOil = () => {
    if (!currentSelectedCompoundId) {
      toast({
        title: "Error",
        description: "Please select a chemical compound",
        variant: "destructive",
      });
      return;
    }

    if (minPercentage > maxPercentage) {
      toast({
        title: "Error",
        description: "Minimum percentage cannot be greater than maximum percentage",
        variant: "destructive",
      });
      return;
    }

    if (typicalPercentage < minPercentage || typicalPercentage > maxPercentage) {
      toast({
        title: "Error",
        description: "Typical percentage must be between minimum and maximum values",
        variant: "destructive",
      });
      return;
    }

    if (selectedCompounds.some(c => c.compound_id === currentSelectedCompoundId)) {
      toast({
        title: "Error",
        description: "This compound is already added to this essential oil",
        variant: "destructive",
      });
      return;
    }

    const compoundDetails = compounds.find(c => c.id === currentSelectedCompoundId);
    const newLinkedCompound: ChemicalCompoundEntry = {
      compound_id: currentSelectedCompoundId,
      min_percentage: minPercentage,
      max_percentage: maxPercentage,
      typical_percentage: typicalPercentage,
      notes: notes || undefined, // Ensure empty strings become undefined for Supabase
      compoundName: compoundDetails?.name || "Unknown Compound"
    };

    const updatedLinkedCompounds = [...selectedCompounds, newLinkedCompound];
    setSelectedCompounds(updatedLinkedCompounds); // Update local state for this tab
    onChange(updatedLinkedCompounds); // Update RHF form state

    // Reset form for adding another compound to this essential oil
    setCurrentSelectedCompoundId("");
    setMinPercentage(0);
    setMaxPercentage(0);
    setTypicalPercentage(0);
    setNotes("");
  };

  const handleRemoveCompoundFromEssentialOil = (compoundIdToRemove: string) => {
    const updatedLinkedCompounds = selectedCompounds.filter(c => c.compound_id !== compoundIdToRemove);
    setSelectedCompounds(updatedLinkedCompounds);
    onChange(updatedLinkedCompounds);
  };

  const handleAddNewCompoundToDatabase = async () => {
    if (!newCompoundName.trim()) {
      toast({
        title: "Error",
        description: "Compound name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data: newCompoundData, error } = await supabase
        .from('chemical_compounds')
        .insert({ 
          name: newCompoundName.trim(), 
          description: newCompoundDesc.trim() || null 
        })
        .select('id, name, description') // Ensure you select all necessary fields
        .single();
        
      if (error) throw error;
      
      if (newCompoundData) {
        // Create a new ChemicalCompound object matching the type
        const newlyAddedCompound: ChemicalCompound = {
          id: newCompoundData.id,
          name: newCompoundData.name,
          description: newCompoundData.description || null,
        };

        // Update the list of all available compounds in the parent form
        setCompounds([...compounds, newlyAddedCompound]); 
        
        // Optionally, select the newly added compound in the dropdown
        setCurrentSelectedCompoundId(newlyAddedCompound.id);
        
        toast({
          title: "Success",
          description: "Chemical compound added to database successfully",
        });
        
        // Clear popover form and close popover
        setNewCompoundName("");
        setNewCompoundDesc("");
        setIsAddPopoverOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add chemical compound to database",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="compound">Select Chemical Compound</Label>
                <div className="flex space-x-2">
                  <Select
                    value={currentSelectedCompoundId}
                    onValueChange={setCurrentSelectedCompoundId}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="compound" className="w-full">
                      <SelectValue placeholder="Select compound" />
                    </SelectTrigger>
                    <SelectContent>
                      {compounds.map((compound) => (
                        <SelectItem key={compound.id} value={compound.id}>
                          {compound.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Popover open={isAddPopoverOpen} onOpenChange={setIsAddPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="flex-shrink-0">
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Add New Compound to Database</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Add New Chemical Compound</h4>
                        <div className="grid gap-2">
                          <Input 
                            placeholder="Enter compound name" 
                            value={newCompoundName}
                            onChange={(e) => setNewCompoundName(e.target.value)}
                          />
                          <Textarea 
                            placeholder="Enter description (optional)" 
                            className="min-h-[80px]" 
                            value={newCompoundDesc}
                            onChange={(e) => setNewCompoundDesc(e.target.value)}
                          />
                          <Button 
                            size="sm" 
                            className="w-full" 
                            onClick={handleAddNewCompoundToDatabase}
                          >
                            Add Compound to Database
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <div className="w-full space-y-5 mt-4 sm:mt-0">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="min-percentage">Minimum Percentage</Label>
                    <div className="w-20"> {/* Increased width slightly */}
                      <Input
                        id="min-percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01" // Finer step
                        value={minPercentage}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            setMinPercentage(value);
                            if (value > maxPercentage) setMaxPercentage(value);
                            if (value > typicalPercentage) setTypicalPercentage(value);
                          } else if (e.target.value === "") {
                            setMinPercentage(0); // Reset if empty
                          }
                        }}
                        className="text-right"
                      />
                    </div>
                  </div>
                  <Slider 
                    id="min-percentage-slider"
                    min={0}
                    max={100}
                    step={0.01}
                    value={[minPercentage]}
                    onValueChange={(values) => {
                      setMinPercentage(values[0]);
                      if (values[0] > maxPercentage) setMaxPercentage(values[0]);
                      if (values[0] > typicalPercentage) setTypicalPercentage(values[0]);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="max-percentage">Maximum Percentage</Label>
                    <div className="w-20">
                      <Input
                        id="max-percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={maxPercentage}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                           if (!isNaN(value)) {
                            setMaxPercentage(value);
                            if (value < minPercentage) setMinPercentage(value);
                            if (value < typicalPercentage) setTypicalPercentage(value);
                          } else if (e.target.value === "") {
                            setMaxPercentage(0);
                          }
                        }}
                        className="text-right"
                      />
                    </div>
                  </div>
                  <Slider 
                    id="max-percentage-slider"
                    min={0}
                    max={100}
                    step={0.01}
                    value={[maxPercentage]}
                    onValueChange={(values) => {
                      setMaxPercentage(values[0]);
                      if (values[0] < minPercentage) setMinPercentage(values[0]);
                      if (values[0] < typicalPercentage) setTypicalPercentage(values[0]);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="typical-percentage">Typical Percentage</Label>
                    <div className="w-20">
                      <Input
                        id="typical-percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={typicalPercentage}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            setTypicalPercentage(value);
                          } else if (e.target.value === "") {
                            setTypicalPercentage(0);
                          }
                        }}
                        className="text-right"
                      />
                    </div>
                  </div>
                  <Slider 
                    id="typical-percentage-slider"
                    min={minPercentage}
                    max={maxPercentage}
                    step={0.01}
                    value={[typicalPercentage]}
                    onValueChange={(values) => {
                      setTypicalPercentage(values[0]);
                    }}
                    disabled={minPercentage === maxPercentage && minPercentage === 0 && maxPercentage === 0} // More robust disable
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional information about this compound in this essential oil..."
                className="mt-2"
              />
            </div>
            
            <Button
              type="button"
              onClick={handleAddCompoundToEssentialOil}
              className="w-full sm:w-auto"
              disabled={isLoading || !currentSelectedCompoundId}
            >
              Add Compound to Essential Oil
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {selectedCompounds.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Compound Name</TableHead>
              <TableHead className="w-48 text-center">Percentage Range</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="w-10 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedCompounds.map((compound) => (
              <TableRow key={compound.compound_id}>
                <TableCell className="font-medium">
                  {compound.compoundName}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col space-y-1 text-center">
                    <div className="flex justify-between text-xs px-1">
                      <span>Min: {compound.min_percentage?.toFixed(2)}%</span>
                      <span>Max: {compound.max_percentage?.toFixed(2)}%</span>
                    </div>
                    <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden mx-auto max-w-[150px]">
                      <div 
                        className="absolute h-full bg-primary/30 rounded-l-full" 
                        style={{
                          left: `0%`, // Min bar always starts from left
                          width: `${(compound.min_percentage || 0)}%`,
                        }}
                      />
                       <div 
                        className="absolute h-full bg-primary/50" 
                        style={{
                          left: `${(compound.min_percentage || 0)}%`,
                          width: `${(compound.max_percentage || 0) - (compound.min_percentage || 0)}%`,
                        }}
                      />
                      {compound.typical_percentage !== undefined && compound.typical_percentage >= (compound.min_percentage || 0) && compound.typical_percentage <= (compound.max_percentage || 0) && (
                        <div 
                          className="absolute top-0 h-full w-1 bg-primary rounded-full"
                          style={{
                            left: `calc(${compound.typical_percentage}% - 2px)`, // Adjust for centered tick
                          }}
                          title={`Typical: ${compound.typical_percentage?.toFixed(2)}%`}
                        />
                      )}
                    </div>
                    {compound.typical_percentage !== undefined && (
                      <div className="text-xs text-center">
                        Typical: {compound.typical_percentage?.toFixed(2)}%
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  {compound.notes || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveCompoundFromEssentialOil(compound.compound_id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                    <span className="sr-only">Remove</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No chemical compounds added to this essential oil. Add compounds using the form above.
          </p>
        </div>
      )}
    </div>
  );
}
