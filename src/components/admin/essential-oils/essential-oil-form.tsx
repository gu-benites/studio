// src/components/admin/essential-oils/essential-oil-form.tsx
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

// Tab components
import { ChemicalCompoundsTab } from "./essential-oil-form-chemical-tab";
import { BasicInfoTab } from "./tabs/basic-info-tab";
import { PropertiesTab } from "./tabs/properties-tab";
import { ExtractionTab } from "./tabs/extraction-tab";
import { AromaticTab } from "./tabs/aromatic-tab";
import { HealthIssuesTab } from "./tabs/health-issues-tab";
import { UsageModesTab } from "./tabs/usage-modes-tab";

// Types
import { 
  formSchema, 
  EssentialOilFormProps, 
  Property, 
  Country, 
  ExtractionMethod, 
  AromaticDescriptor, 
  ChemicalCompound, 
  HealthIssue, 
  PlantPart, 
  UsageMode, 
  ChemicalCompoundEntry,
  SafetyCharacteristic
} from "./essential-oil-form-types";
import { SafetyTab } from "./tabs/safety-tab";


const EssentialOilForm = ({ initialData, onSubmit, isSubmitting }: EssentialOilFormProps) => {
  // Entity state
  const [properties, setProperties] = useState<Property[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [extractionMethods, setExtractionMethods] = useState<ExtractionMethod[]>([]);
  const [aromaticDescriptors, setAromaticDescriptors] = useState<AromaticDescriptor[]>([]);
  const [chemicalCompounds, setChemicalCompounds] = useState<ChemicalCompound[]>([]);
  const [healthIssues, setHealthIssues] = useState<HealthIssue[]>([]);
  const [plantParts, setPlantParts] = useState<PlantPart[]>([]);
  const [usageModes, setUsageModes] = useState<UsageMode[]>([]);
  const [safetyCharacteristics, setSafetyCharacteristics] = useState<SafetyCharacteristic[]>([]);
  
  // Selected values
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedExtractionMethods, setSelectedExtractionMethods] = useState<string[]>([]);
  const [selectedAromaticDescriptors, setSelectedAromaticDescriptors] = useState<string[]>([]);
  const [selectedChemicalCompounds, setSelectedChemicalCompounds] = useState<ChemicalCompoundEntry[]>([]);
  // Removed selectedHealthIssues state and its setter, as HealthIssuesTab will use RHF field state.
  const [selectedPlantParts, setSelectedPlantParts] = useState<string[]>([]);
  const [selectedUsageModes, setSelectedUsageModes] = useState<string[]>([]);
  const [selectedSafetyCharacteristics, setSelectedSafetyCharacteristics] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);

  // Custom setIsLoading wrapper for logging
  const customSetIsLoading = (value: boolean) => {
    // console.log(`[EssentialOilForm] customSetIsLoading CALLED with: ${value}. Current isLoading BEFORE set: ${isLoading}`);
    setIsLoading(value);
    // console.log(`[EssentialOilForm] customSetIsLoading: isLoading AFTER set: ${value}`);
  };

  const supabase = createClient();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name_english: initialData?.name_english || "",
      name_scientific: initialData?.name_scientific || "",
      name_portuguese: initialData?.name_portuguese || "",
      general_description: initialData?.general_description || "",
      properties: [],
      extraction_methods: [],
      extraction_countries: [],
      plant_parts: [],
      aromatic_descriptors: [],
      chemical_compounds: [],
      health_issues: [], // react-hook-form will manage this array of IDs
      usage_modes: [],
      safety_characteristics: [],
    },
  });
  
  // Function to fetch all data needed for the form
  useEffect(() => {
    const fetchRelatedData = async () => {
      console.log("[EssentialOilForm] fetchRelatedData: STARTING data fetch. Current isLoading:", isLoading);
      customSetIsLoading(true);
      console.log("[EssentialOilForm] fetchRelatedData: Set isLoading to TRUE. New isLoading:", true);
      try {
        // Fetch multiple entities in parallel
        const [
          propertiesResponse,
          countriesResponse,
          extractionMethodsResponse,
          aromaticDescriptorsResponse,
          chemicalCompoundsResponse,
          healthIssuesResponse,
          plantPartsResponse,
          usageModesResponse,
          safetyCharacteristicsResponse
        ] = await Promise.all([
          supabase.from("properties").select("*").order("name"),
          supabase.from("countries").select("id, name, iso_code_2, iso_code_3").order("name"),
          supabase.from("extraction_methods").select("*").order("name"),
          supabase.from("aromatic_descriptors").select("*").order("name"),
          supabase.from("chemical_compounds").select("*").order("name"),
          supabase.from("health_issues").select("*").order("name"),
          supabase.from("plant_parts").select("*").order("name"),
          supabase.from("usage_modes").select("*").order("name"),
          supabase.from("safety_characteristics").select("*").order("name"),
        ]);

        console.log("[EssentialOilForm] fetchRelatedData: Countries Response from Promise.all:", countriesResponse);
        if (countriesResponse.error) {
          console.error("[EssentialOilForm] fetchRelatedData: ERROR fetching countries:", countriesResponse.error);
        }
        
        // Set state with retrieved data
        if (propertiesResponse.data) setProperties(propertiesResponse.data);
        if (countriesResponse.data) {
          const mappedCountries = countriesResponse.data.map(country => ({
            id: country.id,
            name: country.name,
            code: country.iso_code_2 || "",
            iso_code_2: country.iso_code_2 || undefined, // Ensure it's undefined if null
            iso_code_3: country.iso_code_3 || undefined  // Ensure it's undefined if null
          }));
          setCountries(mappedCountries);
        }
        if (extractionMethodsResponse.data) setExtractionMethods(extractionMethodsResponse.data);
        if (aromaticDescriptorsResponse.data) {
             const mappedDescriptors = aromaticDescriptorsResponse.data.map(d => ({
                id: d.id,
                name: d.descriptor, // Map descriptor to name
                description: null // Assuming description is not in this table based on schema
            }));
            setAromaticDescriptors(mappedDescriptors);
        }
        if (chemicalCompoundsResponse.data) setChemicalCompounds(chemicalCompoundsResponse.data);
        if (healthIssuesResponse.data) setHealthIssues(healthIssuesResponse.data);
        if (plantPartsResponse.data) setPlantParts(plantPartsResponse.data);
        if (usageModesResponse.data) setUsageModes(usageModesResponse.data);
        if (safetyCharacteristicsResponse.data) setSafetyCharacteristics(safetyCharacteristicsResponse.data);


        if (initialData?.id) {
          // Fetch assigned properties
          const { data: assignedProperties } = await supabase
            .from("essential_oil_properties")
            .select("property_id")
            .eq("essential_oil_id", initialData.id);
          if (assignedProperties && assignedProperties.length > 0) {
            const propertyIds = assignedProperties.map(p => p.property_id);
            setSelectedProperties(propertyIds);
            form.setValue("properties", propertyIds);
          }

          // Fetch assigned extraction methods
          const { data: assignedExtractionMethods } = await supabase
            .from("essential_oil_extraction_methods")
            .select("extraction_method_id")
            .eq("essential_oil_id", initialData.id);
          if (assignedExtractionMethods && assignedExtractionMethods.length > 0) {
            const methodIds = assignedExtractionMethods.map(m => m.extraction_method_id);
            setSelectedExtractionMethods(methodIds);
            form.setValue("extraction_methods", methodIds);
          }

          // Fetch assigned countries
          const { data: assignedCountries } = await supabase
            .from("essential_oil_extraction_countries") 
            .select("country_id")
            .eq("essential_oil_id", initialData.id);
          if (assignedCountries && assignedCountries.length > 0) {
            const countryIds = assignedCountries.map(c => c.country_id);
            form.setValue("extraction_countries", countryIds);
          }

          // Fetch assigned aromatic descriptors
          const { data: assignedAromaticDescriptorsData } = await supabase
            .from("essential_oil_aromatic_descriptors")
            .select("descriptor_id") 
            .eq("essential_oil_id", initialData.id);
          if (assignedAromaticDescriptorsData && assignedAromaticDescriptorsData.length > 0) {
            const descriptorIds = assignedAromaticDescriptorsData.map(d => d.descriptor_id);
            setSelectedAromaticDescriptors(descriptorIds);
            form.setValue("aromatic_descriptors", descriptorIds);
          }
          
          const { data: assignedHealthIssuesData } = await supabase
            .from("essential_oil_health_issues") 
            .select("health_issue_id")
            .eq("essential_oil_id", initialData.id);
          if (assignedHealthIssuesData && assignedHealthIssuesData.length > 0) {
            const healthIssueIds = assignedHealthIssuesData.map(h => h.health_issue_id);
            // setSelectedHealthIssues(healthIssueIds); // No longer needed for this tab
            form.setValue("health_issues", healthIssueIds); // Set RHF value
          }
          
          const { data: assignedUsageModes } = await supabase
            .from("essential_oil_usage_modes") 
            .select("usage_mode_id")
            .eq("essential_oil_id", initialData.id);
          if (assignedUsageModes && assignedUsageModes.length > 0) {
            const usageModeIds = assignedUsageModes.map(u => u.usage_mode_id);
            setSelectedUsageModes(usageModeIds);
            form.setValue("usage_modes", usageModeIds);
          }
          
          const { data: assignedPlantParts } = await supabase
            .from("essential_oil_plant_parts")
            .select("plant_part_id")
            .eq("essential_oil_id", initialData.id);
          if (assignedPlantParts && assignedPlantParts.length > 0) {
            const plantPartIds = assignedPlantParts.map(p => p.plant_part_id);
            setSelectedPlantParts(plantPartIds);
            form.setValue("plant_parts", plantPartIds);
          }
          
          const { data: assignedChemicalCompoundsData } = await supabase
            .from("essential_oil_chemical_compounds")
            .select("id, chemical_compound_id, min_percentage, max_percentage, typical_percentage, notes, chemical_compounds(id, name)")
            .eq("essential_oil_id", initialData.id);

          if (assignedChemicalCompoundsData && assignedChemicalCompoundsData.length > 0) {
            const compoundsWithData: ChemicalCompoundEntry[] = assignedChemicalCompoundsData.map(c => {
              let compoundName = "Unknown Compound";
              const cc = c.chemical_compounds as { id: string; name: string } | null;
              if (cc && cc.name) {
                compoundName = cc.name;
              }
              
              return {
                id: c.id, 
                compound_id: c.chemical_compound_id, 
                min_percentage: c.min_percentage ?? undefined,
                max_percentage: c.max_percentage ?? undefined,
                typical_percentage: c.typical_percentage ?? undefined,
                notes: c.notes ?? undefined,
                compoundName: compoundName
              };
            });
            setSelectedChemicalCompounds(compoundsWithData);
            form.setValue("chemical_compounds", compoundsWithData);
          }

          const { data: assignedSafetyCharacteristicsData } = await supabase
            .from("essential_oil_safety")
            .select("safety_characteristic_id")
            .eq("essential_oil_id", initialData.id);
          if (assignedSafetyCharacteristicsData && assignedSafetyCharacteristicsData.length > 0) {
            const safetyIds = assignedSafetyCharacteristicsData.map(s => s.safety_characteristic_id);
            setSelectedSafetyCharacteristics(safetyIds);
            form.setValue("safety_characteristics", safetyIds);
          }
        }
        console.log("[EssentialOilForm] fetchRelatedData: Data fetching successful.");
      } catch (error) {
        console.error("[EssentialOilForm] fetchRelatedData: ERROR fetching related data:", error);
      } finally {
        console.log("[EssentialOilForm] fetchRelatedData: FINALLY block reached. Setting isLoading to FALSE.");
        customSetIsLoading(false);
        console.log("[EssentialOilForm] fetchRelatedData: Set isLoading to FALSE. New isLoading:", false);
      }
    };

    fetchRelatedData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase, initialData, form]); 

  useEffect(() => {
    if (initialData) {
      form.reset({
        name_english: initialData.name_english || "",
        name_scientific: initialData.name_scientific || "",
        name_portuguese: initialData.name_portuguese || "",
        general_description: initialData.general_description || "",
        // Note: relational data like properties, chemical_compounds etc., are set in fetchRelatedData
      });
    }
  }, [form, initialData]);

  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("[EssentialOilForm] handleFormSubmit: Values from RHF:", values);
      console.log("[EssentialOilForm] handleFormSubmit: Local selectedChemicalCompounds state:", selectedChemicalCompounds);

      const basicData = {
        name_english: values.name_english,
        name_scientific: values.name_scientific,
        name_portuguese: values.name_portuguese || "",
        general_description: values.general_description || "",
      };
      
      const relations = {
        properties: values.properties || [],
        extraction_methods: values.extraction_methods || [],
        extraction_countries: values.extraction_countries || [],
        plant_parts: values.plant_parts || [],
        aromatic_descriptors: values.aromatic_descriptors || [],
        chemical_compounds: selectedChemicalCompounds.map(cc => ({ 
          compound_id: cc.compound_id,
          min_percentage: cc.min_percentage,
          max_percentage: cc.max_percentage,
          typical_percentage: cc.typical_percentage,
          notes: cc.notes,
        })) || [],
        health_issues: values.health_issues || [], // This will now be an array of IDs from RHF
        usage_modes: values.usage_modes || [],
        safety_characteristics: values.safety_characteristics || [],
      };
      
      console.log("[EssentialOilForm] handleFormSubmit: Prepared relations for submission:", JSON.stringify(relations, null, 2));
      
      await onSubmit({ basicData, relations });
      
      toast({
        title: "Success",
        description: `Essential oil ${initialData ? "updated" : "created"} successfully`,
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${initialData ? "update" : "create"} essential oil`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start mb-6 flex-wrap h-auto">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="extraction">Extraction</TabsTrigger>
                <TabsTrigger value="aromatic">Aromatic Profile</TabsTrigger>
                <TabsTrigger value="chemical">Chemical Compounds</TabsTrigger>
                <TabsTrigger value="health">Health Issues</TabsTrigger>
                <TabsTrigger value="usage">Usage Modes</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="space-y-6">
                <BasicInfoTab
                  control={form.control}
                  plantParts={plantParts} // Pass the list of all available plant parts
                  // selectedPlantParts and setSelectedPlantParts are managed by RHF now for this field
                  isLoading={isLoading}
                  setPlantParts={setPlantParts} // To update the global list if a new one is added
                />
              </TabsContent>
              
              <TabsContent value="properties" className="space-y-6">
                <PropertiesTab
                  control={form.control}
                  properties={properties}
                  // selectedProperties and setSelectedProperties are managed by RHF
                  isLoading={isLoading}
                  setProperties={setProperties}
                />
              </TabsContent>
              
              <TabsContent value="extraction" className="space-y-6">
                <ExtractionTab
                  control={form.control}
                  setValue={form.setValue}
                  getValues={form.getValues}
                  extractionMethods={extractionMethods}
                  // selectedExtractionMethods and setSelectedExtractionMethods are managed by RHF
                  countries={countries}
                  isLoading={isLoading}
                  setExtractionMethods={setExtractionMethods}
                  setCountries={setCountries}
                />
              </TabsContent>
              
              <TabsContent value="aromatic" className="space-y-6">
                <AromaticTab
                  control={form.control}
                  aromaticDescriptors={aromaticDescriptors}
                  // selectedAromaticDescriptors and setSelectedAromaticDescriptors are managed by RHF
                  isLoading={isLoading}
                  setAromaticDescriptors={setAromaticDescriptors}
                />
              </TabsContent>
              
              <TabsContent value="chemical" className="space-y-6">
                <FormField
                  control={form.control}
                  name="chemical_compounds" 
                  render={({ field }) => ( 
                    <FormItem>
                      <ChemicalCompoundsTab
                        compounds={chemicalCompounds} 
                        selectedCompounds={selectedChemicalCompounds} 
                        setSelectedCompounds={setSelectedChemicalCompounds} 
                        onChange={(updatedLinkedCompounds) => {
                           field.onChange(updatedLinkedCompounds); 
                           setSelectedChemicalCompounds(updatedLinkedCompounds); 
                        }}
                        isLoading={isLoading}
                        setCompounds={setChemicalCompounds} 
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="health" className="space-y-6">
                <HealthIssuesTab
                  control={form.control}
                  healthIssues={healthIssues} // Pass the list of all available health issues
                  // selectedHealthIssues and setSelectedHealthIssues are managed by RHF via FormField
                  isLoading={isLoading}
                  setHealthIssues={setHealthIssues} // To update the global list
                />
              </TabsContent>
              
              <TabsContent value="usage" className="space-y-6">
                <UsageModesTab
                  control={form.control}
                  usageModes={usageModes}
                  // selectedUsageModes and setSelectedUsageModes are managed by RHF
                  isLoading={isLoading}
                  setUsageModes={setUsageModes}
                />
              </TabsContent>
              <TabsContent value="safety" className="space-y-6">
                <SafetyTab
                  control={form.control}
                  safetyCharacteristics={safetyCharacteristics}
                  // selectedSafetyCharacteristics and setSelectedSafetyCharacteristics are managed by RHF
                  isLoading={isLoading}
                  setSafetyCharacteristics={setSafetyCharacteristics}
                />
              </TabsContent>
            </Tabs>
            
            <Separator className="my-4" />
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="min-w-[120px]"
              >
                {isSubmitting || isLoading ? ( 
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EssentialOilForm;