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
  ChemicalCompoundEntry
} from "./essential-oil-form-types";

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
  const [safetyCharacteristics, setSafetyCharacteristics] = useState<any[]>([]);
  
  // Selected values
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [selectedExtractionMethods, setSelectedExtractionMethods] = useState<string[]>([]);
  const [selectedAromaticDescriptors, setSelectedAromaticDescriptors] = useState<string[]>([]);
  const [selectedChemicalCompounds, setSelectedChemicalCompounds] = useState<ChemicalCompoundEntry[]>([]);
  const [selectedHealthIssues, setSelectedHealthIssues] = useState<string[]>([]);
  const [selectedPlantParts, setSelectedPlantParts] = useState<string[]>([]);
  const [selectedUsageModes, setSelectedUsageModes] = useState<string[]>([]);
  const [selectedSafetyCharacteristics, setSelectedSafetyCharacteristics] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);

  // Custom setIsLoading wrapper for logging
  const customSetIsLoading = (value: boolean) => {
    console.log(`[EssentialOilForm] customSetIsLoading CALLED with: ${value}. Current isLoading BEFORE set: ${isLoading}`);
    setIsLoading(value);
    console.log(`[EssentialOilForm] customSetIsLoading: isLoading AFTER set: ${value}`);
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
      health_issues: [],
      usage_modes: [],
      safety_characteristics: [],
    },
  });
  
  // Debug form values
  useEffect(() => {
    const subscription = form.watch((value) => {
      console.log('Form values updated:', value);
      console.log('Plant parts in form:', value.plant_parts);
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  // Function to fetch all data needed for the form
  useEffect(() => {
    const fetchRelatedData = async () => {
      customSetIsLoading(true);
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
          // Fetch properties
          supabase.from("properties").select("*").order("name"),
          
          // Fetch countries
          supabase.from("countries").select("id, name, iso_code_2, iso_code_3").order("name"),
          
          // Fetch extraction methods
          supabase.from("extraction_methods").select("*").order("name"),
          
          // Fetch aromatic descriptors
          supabase.from("aromatic_descriptors").select("*").order("name"),
          
          // Fetch chemical compounds
          supabase.from("chemical_compounds").select("*").order("name"),
          
          // Fetch health issues
          supabase.from("health_issues").select("*").order("name"),
          
          // Fetch plant parts
          supabase.from("plant_parts").select("*").order("name"),
          
          // Fetch usage modes
          supabase.from("usage_modes").select("*").order("name"),
          
          // Fetch safety characteristics
          supabase.from("safety_characteristics").select("*").order("name"),
        ]);
        
        // Set state with retrieved data
        if (propertiesResponse.data) setProperties(propertiesResponse.data);
        if (countriesResponse.data) {
          // Map database fields to frontend model
          const mappedCountries = countriesResponse.data.map(country => ({
            id: country.id,
            name: country.name,
            code: country.iso_code_2 || "",
            iso_code_2: country.iso_code_2,
            iso_code_3: country.iso_code_3
          }));
          setCountries(mappedCountries);
        }
        if (extractionMethodsResponse.data) setExtractionMethods(extractionMethodsResponse.data);
        if (aromaticDescriptorsResponse.data) setAromaticDescriptors(aromaticDescriptorsResponse.data);
        if (chemicalCompoundsResponse.data) setChemicalCompounds(chemicalCompoundsResponse.data);
        if (healthIssuesResponse.data) setHealthIssues(healthIssuesResponse.data);
        if (plantPartsResponse.data) setPlantParts(plantPartsResponse.data);
        if (usageModesResponse.data) setUsageModes(usageModesResponse.data);
        if (safetyCharacteristicsResponse.data) setSafetyCharacteristics(safetyCharacteristicsResponse.data);

        // If we have initialData, fetch the related entities
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
            .from("essential_oil_countries")
            .select("country_id")
            .eq("essential_oil_id", initialData.id);

          if (assignedCountries && assignedCountries.length > 0) {
            const countryIds = assignedCountries.map(c => c.country_id);
            form.setValue("extraction_countries", countryIds);
          }

          // Fetch assigned aromatic descriptors
          const { data: assignedAromaticDescriptors } = await supabase
            .from("essential_oil_aromatic_descriptors")
            .select("aromatic_descriptor_id")
            .eq("essential_oil_id", initialData.id);

          if (assignedAromaticDescriptors && assignedAromaticDescriptors.length > 0) {
            const descriptorIds = assignedAromaticDescriptors.map(d => d.aromatic_descriptor_id);
            setSelectedAromaticDescriptors(descriptorIds);
            form.setValue("aromatic_descriptors", descriptorIds);
          }
          
          // Fetch assigned health issues
          const { data: assignedHealthIssues } = await supabase
            .from("essential_oil_health_issues")
            .select("health_issue_id")
            .eq("essential_oil_id", initialData.id);

          if (assignedHealthIssues && assignedHealthIssues.length > 0) {
            const healthIssueIds = assignedHealthIssues.map(h => h.health_issue_id);
            setSelectedHealthIssues(healthIssueIds);
            form.setValue("health_issues", healthIssueIds);
          }
          
          // Fetch assigned usage modes
          const { data: assignedUsageModes } = await supabase
            .from("essential_oil_usage_modes")
            .select("usage_mode_id")
            .eq("essential_oil_id", initialData.id);

          if (assignedUsageModes && assignedUsageModes.length > 0) {
            const usageModeIds = assignedUsageModes.map(u => u.usage_mode_id);
            setSelectedUsageModes(usageModeIds);
            form.setValue("usage_modes", usageModeIds);
          }
          
          // Fetch assigned plant parts
          const { data: assignedPlantParts } = await supabase
            .from("essential_oil_plant_parts")
            .select("plant_part_id")
            .eq("essential_oil_id", initialData.id);

          if (assignedPlantParts && assignedPlantParts.length > 0) {
            const plantPartIds = assignedPlantParts.map(p => p.plant_part_id);
            setSelectedPlantParts(plantPartIds);
            form.setValue("plant_parts", plantPartIds);
          }
          
          // Fetch chemical compounds with percentages
          const { data: assignedChemicalCompounds } = await supabase
            .from("essential_oil_chemical_compounds")
            .select("id, chemical_compound_id, percentage, notes, chemical_compounds(id, name)")
            .eq("essential_oil_id", initialData.id);

          if (assignedChemicalCompounds && assignedChemicalCompounds.length > 0) {
            const compoundsWithData = assignedChemicalCompounds.map(c => {
              // Handle the case where chemical_compounds is returned as an array or object
              let compoundName = "Unknown Compound";
              
              if (c.chemical_compounds) {
                if (Array.isArray(c.chemical_compounds) && c.chemical_compounds.length > 0) {
                  compoundName = c.chemical_compounds[0].name || "Unknown Compound";
                } else if (typeof c.chemical_compounds === 'object' && c.chemical_compounds !== null) {
                  compoundName = (c.chemical_compounds as { name?: string }).name || "Unknown Compound";
                }
              }
              
              return {
                id: c.id,
                compound_id: c.chemical_compound_id,
                percentage: c.percentage || 0,
                notes: c.notes || "",
                compoundName: compoundName
              };
            });
            setSelectedChemicalCompounds(compoundsWithData);
            form.setValue("chemical_compounds", compoundsWithData);
          }
        }
      } catch (error) {
        console.error("Error fetching related data:", error);
      } finally {
        customSetIsLoading(false);
      }
    };

    fetchRelatedData();
  }, [supabase, initialData, form]);

  useEffect(() => {
    if (initialData) {
      form.reset({
        name_english: initialData.name_english || "",
        name_scientific: initialData.name_scientific || "",
        name_portuguese: initialData.name_portuguese || "",
        general_description: initialData.general_description || "",
      });
    }
  }, [form, initialData]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Separate basic data from relations
      const basicData = {
        name_english: values.name_english,
        name_scientific: values.name_scientific,
        name_portuguese: values.name_portuguese || "",
        general_description: values.general_description || "",
      };
      
      // Store relations in a separate object
      const relations = {
        properties: values.properties || [],
        extraction_methods: values.extraction_methods || [],
        extraction_countries: values.extraction_countries || [],
        plant_parts: values.plant_parts || [],
        aromatic_descriptors: values.aromatic_descriptors || [],
        chemical_compounds: values.chemical_compounds || [],
        health_issues: values.health_issues || [],
        usage_modes: values.usage_modes || [],
        safety_characteristics: values.safety_characteristics || [],
      };
      
      // Pass both objects to the parent component for handling
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
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start mb-6 flex-wrap">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="properties">Properties</TabsTrigger>
                <TabsTrigger value="extraction">Extraction</TabsTrigger>
                <TabsTrigger value="aromatic">Aromatic Profile</TabsTrigger>
                <TabsTrigger value="chemical">Chemical Compounds</TabsTrigger>
                <TabsTrigger value="health">Health Issues</TabsTrigger>
                <TabsTrigger value="usage">Usage Modes</TabsTrigger>
              </TabsList>
              
              {/* Basic Information Tab */}
              <TabsContent value="basic" className="space-y-6">
                <BasicInfoTab
                  control={form.control}
                  plantParts={plantParts}
                  selectedPlantParts={selectedPlantParts}
                  setSelectedPlantParts={setSelectedPlantParts}
                  isLoading={isLoading}
                  setPlantParts={setPlantParts}
                />
              </TabsContent>
              
              {/* Properties Tab */}
              <TabsContent value="properties" className="space-y-6">
                <PropertiesTab
                  control={form.control}
                  properties={properties}
                  selectedProperties={selectedProperties}
                  setSelectedProperties={setSelectedProperties}
                  isLoading={isLoading}
                  setProperties={setProperties}
                />
              </TabsContent>
              
              {/* Extraction Methods Tab */}
              <TabsContent value="extraction" className="space-y-6">
                {console.log("[EssentialOilForm] isLoading before rendering ExtractionTab:", isLoading)}
                <ExtractionTab
                  control={form.control}
                  setValue={form.setValue}
                  getValues={form.getValues}
                  extractionMethods={extractionMethods}
                  selectedExtractionMethods={selectedExtractionMethods}
                  setSelectedExtractionMethods={setSelectedExtractionMethods}
                  countries={countries}
                  isLoading={isLoading}
                  setExtractionMethods={setExtractionMethods}
                  setCountries={setCountries}
                />
              </TabsContent>
              
              {/* Aromatic Profile Tab */}
              <TabsContent value="aromatic" className="space-y-6">
                <AromaticTab
                  control={form.control}
                  aromaticDescriptors={aromaticDescriptors}
                  selectedAromaticDescriptors={selectedAromaticDescriptors}
                  setSelectedAromaticDescriptors={setSelectedAromaticDescriptors}
                  isLoading={isLoading}
                  setAromaticDescriptors={setAromaticDescriptors}
                />
              </TabsContent>
              
              {/* Chemical Compounds Tab */}
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
                        onChange={field.onChange}
                        isLoading={isLoading}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Health Issues Tab */}
              <TabsContent value="health" className="space-y-6">
                <HealthIssuesTab
                  control={form.control}
                  healthIssues={healthIssues}
                  selectedHealthIssues={selectedHealthIssues}
                  setSelectedHealthIssues={setSelectedHealthIssues}
                  isLoading={isLoading}
                  setHealthIssues={setHealthIssues}
                />
              </TabsContent>
              
              {/* Usage Modes Tab */}
              <TabsContent value="usage" className="space-y-6">
                <UsageModesTab
                  control={form.control}
                  usageModes={usageModes}
                  selectedUsageModes={selectedUsageModes}
                  setSelectedUsageModes={setSelectedUsageModes}
                  isLoading={isLoading}
                  setUsageModes={setUsageModes}
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
                {isSubmitting ? (
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