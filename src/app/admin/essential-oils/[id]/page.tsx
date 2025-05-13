"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import EssentialOilForm from "@/components/admin/essential-oils/essential-oil-form";
import { Loader2 } from "lucide-react";

export default function EssentialOilDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [essentialOil, setEssentialOil] = useState<any>(null);
  
  useEffect(() => {
    const fetchEssentialOil = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("essential_oils")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) throw error;
        setEssentialOil(data);
      } catch (error: any) {
        console.error("Error fetching essential oil:", error.message);
        toast({
          title: "Error",
          description: "Failed to load essential oil details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEssentialOil();
  }, [id, supabase]);
  
  const handleSubmit = async ({ basicData, relations }: { basicData: any, relations: any }) => {
    setIsSubmitting(true);
    try {
      // First update the basic essential oil data
      const { error: updateError } = await supabase
        .from("essential_oils")
        .update(basicData)
        .eq("id", id);
        
      if (updateError) throw new Error(`Error updating essential oil: ${updateError.message}`);

      // Process all relations in a transaction if available or sequentially
      // Delete existing relationships and create new ones for each relation type
      
      // 1. Handle properties
      if (relations.properties && relations.properties.length > 0) {
        // Delete existing relations
        await supabase
          .from("essential_oil_properties")
          .delete()
          .eq("essential_oil_id", id);
          
        // Insert new relations
        const propertyRelations = relations.properties.map((propertyId: string) => ({
          essential_oil_id: id,
          property_id: propertyId
        }));
        
        const { error: propertiesError } = await supabase
          .from("essential_oil_properties")
          .insert(propertyRelations);
          
        if (propertiesError) throw new Error(`Error updating properties: ${propertiesError.message}`);
      }
      
      // 2. Handle extraction methods
      if (relations.extraction_methods && relations.extraction_methods.length > 0) {
        // Delete existing relations
        await supabase
          .from("essential_oil_extraction_methods")
          .delete()
          .eq("essential_oil_id", id);
          
        // Insert new relations
        const methodRelations = relations.extraction_methods.map((methodId: string) => ({
          essential_oil_id: id,
          extraction_method_id: methodId
        }));
        
        const { error: methodsError } = await supabase
          .from("essential_oil_extraction_methods")
          .insert(methodRelations);
          
        if (methodsError) throw new Error(`Error updating extraction methods: ${methodsError.message}`);
      }
      
      // 3. Handle countries
      if (relations.extraction_countries && relations.extraction_countries.length > 0) {
        // Delete existing relations
        await supabase
          .from("essential_oil_countries")
          .delete()
          .eq("essential_oil_id", id);
          
        // Insert new relations
        const countryRelations = relations.extraction_countries.map((countryId: string) => ({
          essential_oil_id: id,
          country_id: countryId
        }));
        
        const { error: countriesError } = await supabase
          .from("essential_oil_countries")
          .insert(countryRelations);
          
        if (countriesError) throw new Error(`Error updating countries: ${countriesError.message}`);
      }
      
      // 4. Handle plant parts
      if (relations.plant_parts && relations.plant_parts.length > 0) {
        // Delete existing relations
        await supabase
          .from("essential_oil_plant_parts")
          .delete()
          .eq("essential_oil_id", id);
          
        // Insert new relations
        const plantPartRelations = relations.plant_parts.map((partId: string) => ({
          essential_oil_id: id,
          plant_part_id: partId
        }));
        
        const { error: plantPartsError } = await supabase
          .from("essential_oil_plant_parts")
          .insert(plantPartRelations);
          
        if (plantPartsError) throw new Error(`Error updating plant parts: ${plantPartsError.message}`);
      }
      
      // 5. Handle aromatic descriptors
      if (relations.aromatic_descriptors && relations.aromatic_descriptors.length > 0) {
        // Delete existing relations
        await supabase
          .from("essential_oil_aromatic_descriptors")
          .delete()
          .eq("essential_oil_id", id);
          
        // Insert new relations
        const descriptorRelations = relations.aromatic_descriptors.map((descriptorId: string) => ({
          essential_oil_id: id,
          aromatic_descriptor_id: descriptorId
        }));
        
        const { error: descriptorsError } = await supabase
          .from("essential_oil_aromatic_descriptors")
          .insert(descriptorRelations);
          
        if (descriptorsError) throw new Error(`Error updating aromatic descriptors: ${descriptorsError.message}`);
      }
      
      // 6. Handle health issues
      if (relations.health_issues && relations.health_issues.length > 0) {
        // Delete existing relations
        await supabase
          .from("essential_oil_health_issues")
          .delete()
          .eq("essential_oil_id", id);
          
        // Insert new relations
        const healthIssueRelations = relations.health_issues.map((issueId: string) => ({
          essential_oil_id: id,
          health_issue_id: issueId
        }));
        
        const { error: healthIssuesError } = await supabase
          .from("essential_oil_health_issues")
          .insert(healthIssueRelations);
          
        if (healthIssuesError) throw new Error(`Error updating health issues: ${healthIssuesError.message}`);
      }
      
      // 7. Handle usage modes
      if (relations.usage_modes && relations.usage_modes.length > 0) {
        // Delete existing relations
        await supabase
          .from("essential_oil_usage_modes")
          .delete()
          .eq("essential_oil_id", id);
          
        // Insert new relations
        const usageModeRelations = relations.usage_modes.map((modeId: string) => ({
          essential_oil_id: id,
          usage_mode_id: modeId
        }));
        
        const { error: usageModesError } = await supabase
          .from("essential_oil_usage_modes")
          .insert(usageModeRelations);
          
        if (usageModesError) throw new Error(`Error updating usage modes: ${usageModesError.message}`);
      }
      
      // 8. Handle chemical compounds
      if (relations.chemical_compounds && relations.chemical_compounds.length > 0) {
        // Delete existing relations
        await supabase
          .from("essential_oil_chemical_compounds")
          .delete()
          .eq("essential_oil_id", id);
          
        // Insert new relations
        const chemicalCompoundRelations = relations.chemical_compounds.map((compound: any) => ({
          essential_oil_id: id,
          chemical_compound_id: compound.compound_id,
          percentage: compound.percentage || null,
          notes: compound.notes || null
        }));
        
        const { error: compoundsError } = await supabase
          .from("essential_oil_chemical_compounds")
          .insert(chemicalCompoundRelations);
          
        if (compoundsError) throw new Error(`Error updating chemical compounds: ${compoundsError.message}`);
      }
      
      toast({
        title: "Success",
        description: "Essential oil updated successfully.",
      });
      
      router.push("/admin/essential-oils");
    } catch (error: any) {
      console.error("Error updating essential oil:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to update essential oil.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this essential oil?")) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("essential_oils")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Essential oil deleted successfully.",
      });
      
      router.push("/admin/essential-oils");
    } catch (error: any) {
      console.error("Error deleting essential oil:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete essential oil.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Loading essential oil details...</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit Essential Oil</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push("/admin/essential-oils")}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            Delete
          </Button>
        </div>
      </div>
      
      {essentialOil ? (
        <EssentialOilForm 
          initialData={essentialOil} 
          onSubmit={handleSubmit} 
          isSubmitting={isSubmitting} 
        />
      ) : (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">Essential oil not found</p>
          <Button 
            className="mt-4" 
            onClick={() => router.push("/admin/essential-oils")}
          >
            Go Back
          </Button>
        </div>
      )}
    </div>
  );
}
