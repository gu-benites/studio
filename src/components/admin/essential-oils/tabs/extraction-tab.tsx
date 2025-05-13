"use client";

import { useState } from "react";
import { UseFormGetValues, UseFormSetValue } from "react-hook-form"; 
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// MultiSelect is used for countries, Select for extraction_methods (single select)
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CountrySelect } from "@/components/ui/country-select"; // Keep using CountrySelect for countries
import { Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { ExtractionMethod, Country } from "../essential-oil-form-types";
import { EssentialOilFormValues } from "../essential-oil-form-types"; 

interface ExtractionTabProps {
  control: any;
  setValue: UseFormSetValue<EssentialOilFormValues>; 
  getValues: UseFormGetValues<EssentialOilFormValues>; 
  extractionMethods: ExtractionMethod[];
  // selectedExtractionMethods and setSelectedExtractionMethods removed as RHF will manage "extraction_methods" field
  countries: Country[];
  isLoading: boolean;
  setExtractionMethods: (methods: ExtractionMethod[]) => void;
  setCountries: (countries: Country[]) => void;
}

export function ExtractionTab({
  control,
  setValue, 
  getValues, 
  extractionMethods,
  countries,
  isLoading, 
  setExtractionMethods,
  setCountries
}: ExtractionTabProps) {
  console.log(`[ExtractionTab] Props received - isLoading: ${isLoading}`);
  const supabase = createClient();
  
  const [isMethodPopoverOpen, setIsMethodPopoverOpen] = useState(false);
  const [newMethodName, setNewMethodName] = useState("");
  const [newMethodDesc, setNewMethodDesc] = useState("");
  
  const [isCountryPopoverOpen, setIsCountryPopoverOpen] = useState(false);
  const [newCountryName, setNewCountryName] = useState("");
  const [newCountryCode, setNewCountryCode] = useState("");

  const handleAddExtractionMethod = async () => {
    if (!newMethodName.trim()) {
      toast({ title: "Error", description: "Method name is required", variant: "destructive" });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('extraction_methods')
        .insert({ name: newMethodName.trim(), description: newMethodDesc.trim() || null })
        .select('id, name, description').single();
      if (error) throw error;
      if (data) {
        const newMethod: ExtractionMethod = { id: data.id, name: data.name, description: data.description };
        setExtractionMethods((prevMethods) => [...prevMethods, newMethod]);
        // Assuming extraction_methods is single select, directly set the value for RHF
        setValue('extraction_methods', [data.id], { shouldValidate: true, shouldDirty: true });
        toast({ title: "Success", description: "Extraction method added successfully and selected." });
        setNewMethodName("");
        setNewMethodDesc("");
        setIsMethodPopoverOpen(false);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add extraction method", variant: "destructive" });
    }
  };

  const handleAddCountry = async () => {
    if (!newCountryName.trim()) {
      toast({ title: "Error", description: "Country name is required", variant: "destructive" });
      return;
    }
    try {
      const { data: existingCountry } = await supabase
        .from('countries').select('id').ilike('name', newCountryName.trim()).maybeSingle();
      if (existingCountry) {
        toast({ title: "Country Already Exists", description: "This country already exists.", variant: "destructive" });
        return;
      }
      const { data, error } = await supabase
        .from('countries')
        .insert({ name: newCountryName.trim(), iso_code_2: newCountryCode.trim() || null })
        .select('id, name, iso_code_2').single();
      if (error) throw error;
      if (data) {
        const newCountry: Country = { id: data.id, name: data.name, code: data.iso_code_2 || "" };
        const updatedCountries = [...countries, newCountry].sort((a, b) => a.name.localeCompare(b.name));
        setCountries(updatedCountries);
        const currentFormCountries = getValues('extraction_countries') || [];
        setValue('extraction_countries', [...currentFormCountries, String(data.id)], { shouldValidate: true, shouldDirty: true });
        toast({ title: "Success", description: "Country added successfully and selected." });
        setNewCountryName("");
        setNewCountryCode("");
        setIsCountryPopoverOpen(false);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add country", variant: "destructive" });
    }
  };

  return (
    <>
      <FormField
        control={control}
        name="extraction_methods" // This is an array of IDs for RHF
        render={({ field }) => (
          <FormItem>
            <FormLabel>Extraction Methods</FormLabel>
            <div className="flex items-center gap-2">
              <FormControl>
                <Select
                  disabled={isLoading}
                  // RHF value for single select is just the ID string, not an array of one ID
                  onValueChange={(value) => field.onChange(value ? [value] : [])} // Adapt for MultiSelect array format if it must be array
                  value={field.value && field.value.length > 0 ? field.value[0] : ""} // Take first item for Select
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select extraction method" />
                  </SelectTrigger>
                  <SelectContent>
                    {extractionMethods.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <Popover open={isMethodPopoverOpen} onOpenChange={setIsMethodPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="flex-shrink-0">
                    <Plus className="h-4 w-4" /> <span className="sr-only">Add Method</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Add New Extraction Method</h4>
                    <div className="grid gap-2">
                      <Input placeholder="Method name" value={newMethodName} onChange={(e) => setNewMethodName(e.target.value)} />
                      <Textarea placeholder="Description (optional)" className="min-h-[80px]" value={newMethodDesc} onChange={(e) => setNewMethodDesc(e.target.value)} />
                      <Button size="sm" className="w-full" onClick={handleAddExtractionMethod}>Add Method</Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <FormDescription>Select the method used for extraction.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="extraction_countries"
        render={({ field }) => (
            <FormItem>
              <FormLabel>Origin Countries</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl className="flex-1">
                  <CountrySelect
                    ref={field.ref} 
                    options={countries.map(country => ({
                      label: country.code ? `${country.name} (${country.code})` : country.name,
                      value: String(country.id),
                    }))}
                    selected={Array.isArray(field.value) ? field.value : []} 
                    onChange={field.onChange} 
                    placeholder="Select countries of origin..."
                    disabled={isLoading}
                    onBlur={field.onBlur} 
                  />
                </FormControl>
                <Popover open={isCountryPopoverOpen} onOpenChange={setIsCountryPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" className="flex-shrink-0">
                      <Plus className="h-4 w-4" /> <span className="sr-only">Add Country</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Add New Country</h4>
                      <div className="grid gap-2">
                        <Input placeholder="Country name" value={newCountryName} onChange={(e) => setNewCountryName(e.target.value)} />
                        <Input placeholder="2-letter ISO (optional)" maxLength={2} value={newCountryCode} onChange={(e) => setNewCountryCode(e.target.value.toUpperCase())} />
                        <Button size="sm" className="w-full" onClick={handleAddCountry}>Add Country</Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <FormDescription>Select countries where this oil is produced.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
      />
    </>
  );
}