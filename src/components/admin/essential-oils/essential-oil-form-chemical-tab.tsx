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
import { Plus, Trash2, Minus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ChemicalCompoundEntry } from "./essential-oil-form-types";

interface ChemicalFormProps {
  compounds: any[];
  selectedCompounds: ChemicalCompoundEntry[];
  setSelectedCompounds: (compounds: ChemicalCompoundEntry[]) => void;
  onChange: (compounds: ChemicalCompoundEntry[]) => void;
  isLoading: boolean;
}

export function ChemicalCompoundsTab({
  compounds,
  selectedCompounds,
  setSelectedCompounds,
  onChange,
  isLoading
}: ChemicalFormProps) {
  const supabase = createClient();
  const [selectedCompound, setSelectedCompound] = useState<string>("");
  const [minPercentage, setMinPercentage] = useState<number>(0);
  const [maxPercentage, setMaxPercentage] = useState<number>(0);
  const [typicalPercentage, setTypicalPercentage] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");
  const [isAddPopoverOpen, setIsAddPopoverOpen] = useState(false);
  const [newCompoundName, setNewCompoundName] = useState("");
  const [newCompoundDesc, setNewCompoundDesc] = useState("");

  const handleAddCompound = () => {
    if (!selectedCompound) {
      toast({
        title: "Error",
        description: "Please select a chemical compound",
        variant: "destructive",
      });
      return;
    }

    // Validate percentage ranges
    if (minPercentage > maxPercentage) {
      toast({
        title: "Error",
        description: "Minimum percentage cannot be greater than maximum percentage",
        variant: "destructive",
      });
      return;
    }

    // Check if typical percentage is within range
    if (typicalPercentage < minPercentage || typicalPercentage > maxPercentage) {
      toast({
        title: "Error",
        description: "Typical percentage must be between minimum and maximum values",
        variant: "destructive",
      });
      return;
    }

    // Check if compound is already added
    if (selectedCompounds.some(c => c.compound_id === selectedCompound)) {
      toast({
        title: "Error",
        description: "This compound is already added",
        variant: "destructive",
      });
      return;
    }

    const compound = compounds.find(c => c.id === selectedCompound);
    const newCompound: ChemicalCompoundEntry = {
      compound_id: selectedCompound,
      min_percentage: minPercentage,
      max_percentage: maxPercentage,
      typical_percentage: typicalPercentage,
      notes: notes || "",
      compoundName: compound?.name || "Unknown Compound"
    };

    const updatedCompounds = [...selectedCompounds, newCompound];
    setSelectedCompounds(updatedCompounds);
    onChange(updatedCompounds);

    // Reset form
    setSelectedCompound("");
    setMinPercentage(0);
    setMaxPercentage(0);
    setTypicalPercentage(0);
    setNotes("");
  };

  const handleRemoveCompound = (compoundId: string) => {
    const updatedCompounds = selectedCompounds.filter(c => c.compound_id !== compoundId);
    setSelectedCompounds(updatedCompounds);
    onChange(updatedCompounds);
  };

  const handleAddNewCompound = async () => {
    if (!newCompoundName.trim()) {
      toast({
        title: "Error",
        description: "Compound name is required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('chemical_compounds')
        .insert({ 
          name: newCompoundName.trim(), 
          description: newCompoundDesc.trim() || null 
        })
        .select('id, name')
        .single();
        
      if (error) throw error;
      
      if (data) {
        // Update the compounds list
        const updatedCompounds = [...compounds, data];
        
        // Select the new compound
        setSelectedCompound(data.id);
        
        toast({
          title: "Success",
          description: "Chemical compound added successfully",
        });
        
        // Clear form and close popover
        setNewCompoundName("");
        setNewCompoundDesc("");
        setIsAddPopoverOpen(false);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add chemical compound",
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
                    value={selectedCompound}
                    onValueChange={setSelectedCompound}
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
                        <span className="sr-only">Add Compound</span>
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
                            onClick={handleAddNewCompound}
                          >
                            Add Compound
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="min-percentage">Minimum Percentage</Label>
                    <div className="w-16">
                      <Input
                        id="min-percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.05"
                        value={minPercentage}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            setMinPercentage(value);
                            // Adjust other values if needed
                            if (value > maxPercentage) {
                              setMaxPercentage(value);
                            }
                            if (value > typicalPercentage) {
                              setTypicalPercentage(value);
                            }
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
                    step={0.05}
                    value={[minPercentage]}
                    onValueChange={(values) => {
                      setMinPercentage(values[0]);
                      // Adjust other values if needed
                      if (values[0] > maxPercentage) {
                        setMaxPercentage(values[0]);
                      }
                      if (values[0] > typicalPercentage) {
                        setTypicalPercentage(values[0]);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="max-percentage">Maximum Percentage</Label>
                    <div className="w-16">
                      <Input
                        id="max-percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.05"
                        value={maxPercentage}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            setMaxPercentage(value);
                            // Adjust other values if needed
                            if (value < minPercentage) {
                              setMinPercentage(value);
                            }
                            if (value < typicalPercentage) {
                              setTypicalPercentage(value);
                            }
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
                    step={0.05}
                    value={[maxPercentage]}
                    onValueChange={(values: number[]) => {
                      const value = values[0];
                      setMaxPercentage(value);
                      // Adjust other values if needed
                      if (value < minPercentage) {
                        setMinPercentage(value);
                      }
                      if (value < typicalPercentage) {
                        setTypicalPercentage(value);
                      }
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="typical-percentage">Typical Percentage</Label>
                    <div className="w-16">
                      <Input
                        id="typical-percentage"
                        type="number"
                        min="0"
                        max="100"
                        step="0.05"
                        value={typicalPercentage}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            setTypicalPercentage(value);
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
                    step={0.05}
                    value={[typicalPercentage]}
                    onValueChange={(values: number[]) => {
                      setTypicalPercentage(values[0]);
                    }}
                    disabled={minPercentage === maxPercentage}
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
                placeholder="Add any additional information about this compound..."
                className="mt-2"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddCompound}
              className="w-full sm:w-auto"
            >
              Add Chemical Compound
            </Button>
          </div>
        </CardContent>
      </Card>
      {selectedCompounds.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Compound Name</TableHead>
              <TableHead className="w-40">Percentage Range</TableHead>
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
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Min: {compound.min_percentage?.toFixed(2)}%</span>
                      <span>Max: {compound.max_percentage?.toFixed(2)}%</span>
                    </div>
                    <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className="absolute h-full bg-primary/30 rounded-full" 
                        style={{
                          left: `${(compound.min_percentage || 0)}%`,
                          width: `${(compound.max_percentage || 0) - (compound.min_percentage || 0)}%`,
                        }}
                      />
                      {compound.typical_percentage !== undefined && (
                        <div 
                          className="absolute h-full w-1 bg-primary rounded-full"
                          style={{
                            left: `${compound.typical_percentage}%`,
                          }}
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
                    onClick={() => handleRemoveCompound(compound.compound_id)}
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
            No chemical compounds added. Add compounds using the form above.
          </p>
        </div>
      )}
    </div>
  );
}
