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

      // Process all relations
      
      // 1. Handle properties
      await supabase.from("essential_oil_properties").delete().eq("essential_oil_id", id);
      if (relations.properties && relations.properties.length > 0) {
        const propertyRelations = relations.properties.map((propertyId: string) => ({
          essential_oil_id: id, property_id: propertyId
        }));
        const { error } = await supabase.from("essential_oil_properties").insert(propertyRelations);
        if (error) throw new Error(`Error updating properties: ${error.message}`);
      }
      
      // 2. Handle extraction methods
      await supabase.from("essential_oil_extraction_methods").delete().eq("essential_oil_id", id);
      if (relations.extraction_methods && relations.extraction_methods.length > 0) {
        const methodRelations = relations.extraction_methods.map((methodId: string) => ({
          essential_oil_id: id, extraction_method_id: methodId
        }));
        const { error } = await supabase.from("essential_oil_extraction_methods").insert(methodRelations);
        if (error) throw new Error(`Error updating extraction methods: ${error.message}`);
      }
      
      // 3. Handle countries
      await supabase.from("essential_oil_extraction_countries").delete().eq("essential_oil_id", id);
      if (relations.extraction_countries && relations.extraction_countries.length > 0) {
        const countryRelations = relations.extraction_countries.map((countryId: string) => ({
          essential_oil_id: id, country_id: countryId
        }));
        const { error } = await supabase.from("essential_oil_extraction_countries").insert(countryRelations);
        if (error) throw new Error(`Error updating countries: ${error.message}`);
      }
      
      // 4. Handle plant parts
      await supabase.from("essential_oil_plant_parts").delete().eq("essential_oil_id", id);
      if (relations.plant_parts && relations.plant_parts.length > 0) {
        const plantPartRelations = relations.plant_parts.map((partId: string) => ({
          essential_oil_id: id, plant_part_id: partId
        }));
        const { error } = await supabase.from("essential_oil_plant_parts").insert(plantPartRelations);
        if (error) throw new Error(`Error updating plant parts: ${error.message}`);
      }
      
      // 5. Handle aromatic descriptors
      await supabase.from("essential_oil_aromatic_descriptors").delete().eq("essential_oil_id", id);
      if (relations.aromatic_descriptors && relations.aromatic_descriptors.length > 0) {
        const descriptorRelations = relations.aromatic_descriptors.map((descriptorId: string) => ({
          essential_oil_id: id, descriptor_id: descriptorId // Corrected from aromatic_descriptor_id to descriptor_id
        }));
        const { error } = await supabase.from("essential_oil_aromatic_descriptors").insert(descriptorRelations);
        if (error) throw new Error(`Error updating aromatic descriptors: ${error.message}`);
      }
      
      // 6. Handle health issues
      await supabase.from("essential_oil_health_issues").delete().eq("essential_oil_id", id);
      if (relations.health_issues && relations.health_issues.length > 0) {
        const healthIssueRelations = relations.health_issues.map((issueId: string) => ({
          essential_oil_id: id, health_issue_id: issueId
        }));
        const { error } = await supabase.from("essential_oil_health_issues").insert(healthIssueRelations);
        if (error) throw new Error(`Error updating health issues: ${error.message}`);
      }
      
      // 7. Handle usage modes
      await supabase.from("essential_oil_usage_modes").delete().eq("essential_oil_id", id);
      if (relations.usage_modes && relations.usage_modes.length > 0) {
        const usageModeRelations = relations.usage_modes.map((modeId: string) => ({
          essential_oil_id: id, usage_mode_id: modeId
        }));
        const { error } = await supabase.from("essential_oil_usage_modes").insert(usageModeRelations);
        if (error) throw new Error(`Error updating usage modes: ${error.message}`);
      }
      
      // 8. Handle chemical compounds
      console.log("[EditPage] Relations for chemical_compounds to be processed:", JSON.stringify(relations.chemical_compounds, null, 2));
      await supabase.from("essential_oil_chemical_compounds").delete().eq("essential_oil_id", id);
      if (relations.chemical_compounds && relations.chemical_compounds.length > 0) {
        const chemicalCompoundRelations = relations.chemical_compounds.map((compound: any) => ({
          essential_oil_id: id,
          chemical_compound_id: compound.compound_id,
          min_percentage: compound.min_percentage === undefined ? null : compound.min_percentage,
          max_percentage: compound.max_percentage === undefined ? null : compound.max_percentage,
          typical_percentage: compound.typical_percentage === undefined ? null : compound.typical_percentage,
          notes: compound.notes || null
        }));
        
        console.log("[EditPage] Attempting to insert chemicalCompoundRelations:", JSON.stringify(chemicalCompoundRelations, null, 2));
        const { error: compoundsError } = await supabase
          .from("essential_oil_chemical_compounds")
          .insert(chemicalCompoundRelations);
          
        if (compoundsError) {
            console.error("[EditPage] Supabase error inserting chemical compounds:", compoundsError);
            throw new Error(`Error updating chemical compounds: ${compoundsError.message}`);
        }
        console.log("[EditPage] Chemical compounds relations inserted successfully.");
      } else {
        console.log("[EditPage] No chemical compounds to link or all were removed.");
      }

      // 9. Handle safety characteristics
      await supabase.from("essential_oil_safety").delete().eq("essential_oil_id", id);
      if (relations.safety_characteristics && relations.safety_characteristics.length > 0) {
        const safetyRelations = relations.safety_characteristics.map((charId: string) => ({
          essential_oil_id: id, safety_characteristic_id: charId
        }));
        const { error } = await supabase.from("essential_oil_safety").insert(safetyRelations);
        if (error) throw new Error(`Error updating safety characteristics: ${error.message}`);
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
