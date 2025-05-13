'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import EssentialOilForm from '@/components/admin/essential-oils/essential-oil-form';

export default function NewEssentialOilPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async ({ basicData, relations }: { basicData: any, relations: any }) => {
    setIsSubmitting(true);
    
    try {
      // Insert essential oil basic data first
      const { data: newOil, error } = await supabase
        .from("essential_oils")
        .insert(basicData)
        .select()
        .single();
        
      if (error) throw new Error(`Error creating essential oil: ${error.message}`);
      if (!newOil) throw new Error("Failed to create essential oil");
      
      const essentialOilId = newOil.id;
      
      // Process all relations
      
      // 1. Handle properties
      if (relations.properties && relations.properties.length > 0) {
        const propertyRelations = relations.properties.map((propertyId: string) => ({
          essential_oil_id: essentialOilId, property_id: propertyId
        }));
        const { error: propertiesError } = await supabase.from("essential_oil_properties").insert(propertyRelations);
        if (propertiesError) throw new Error(`Error adding properties: ${propertiesError.message}`);
      }
      
      // 2. Handle extraction methods
      if (relations.extraction_methods && relations.extraction_methods.length > 0) {
        const methodRelations = relations.extraction_methods.map((methodId: string) => ({
          essential_oil_id: essentialOilId, extraction_method_id: methodId
        }));
        const { error: methodsError } = await supabase.from("essential_oil_extraction_methods").insert(methodRelations);
        if (methodsError) throw new Error(`Error adding extraction methods: ${methodsError.message}`);
      }
      
      // 3. Handle countries
      if (relations.extraction_countries && relations.extraction_countries.length > 0) {
        const countryRelations = relations.extraction_countries.map((countryId: string) => ({
          essential_oil_id: essentialOilId, country_id: countryId
        }));
        const { error: countriesError } = await supabase.from("essential_oil_extraction_countries").insert(countryRelations);
        if (countriesError) throw new Error(`Error adding countries: ${countriesError.message}`);
      }
      
      // 4. Handle plant parts
      if (relations.plant_parts && relations.plant_parts.length > 0) {
        const plantPartRelations = relations.plant_parts.map((partId: string) => ({
          essential_oil_id: essentialOilId, plant_part_id: partId
        }));
        const { error: plantPartsError } = await supabase.from("essential_oil_plant_parts").insert(plantPartRelations);
        if (plantPartsError) throw new Error(`Error adding plant parts: ${plantPartsError.message}`);
      }
      
      // 5. Handle aromatic descriptors
      if (relations.aromatic_descriptors && relations.aromatic_descriptors.length > 0) {
        const descriptorRelations = relations.aromatic_descriptors.map((descriptorId: string) => ({
          essential_oil_id: essentialOilId, descriptor_id: descriptorId // Corrected from aromatic_descriptor_id to descriptor_id
        }));
        const { error: descriptorsError } = await supabase.from("essential_oil_aromatic_descriptors").insert(descriptorRelations);
        if (descriptorsError) throw new Error(`Error adding aromatic descriptors: ${descriptorsError.message}`);
      }
      
      // 6. Handle health issues
      if (relations.health_issues && relations.health_issues.length > 0) {
        const healthIssueRelations = relations.health_issues.map((issueId: string) => ({
          essential_oil_id: essentialOilId, health_issue_id: issueId
        }));
        const { error: healthIssuesError } = await supabase.from("essential_oil_health_issues").insert(healthIssueRelations);
        if (healthIssuesError) throw new Error(`Error adding health issues: ${healthIssuesError.message}`);
      }
      
      // 7. Handle usage modes
      if (relations.usage_modes && relations.usage_modes.length > 0) {
        const usageModeRelations = relations.usage_modes.map((modeId: string) => ({
          essential_oil_id: essentialOilId, usage_mode_id: modeId
        }));
        const { error: usageModesError } = await supabase.from("essential_oil_usage_modes").insert(usageModeRelations);
        if (usageModesError) throw new Error(`Error adding usage modes: ${usageModesError.message}`);
      }
      
      // 8. Handle chemical compounds
      console.log("[NewPage] Relations for chemical_compounds to be processed:", JSON.stringify(relations.chemical_compounds, null, 2));
      if (relations.chemical_compounds && relations.chemical_compounds.length > 0) {
        const chemicalCompoundRelations = relations.chemical_compounds.map((compound: any) => ({
          essential_oil_id: essentialOilId,
          chemical_compound_id: compound.compound_id,
          min_percentage: compound.min_percentage === undefined ? null : compound.min_percentage,
          max_percentage: compound.max_percentage === undefined ? null : compound.max_percentage,
          typical_percentage: compound.typical_percentage === undefined ? null : compound.typical_percentage,
          notes: compound.notes || null
        }));
        
        console.log("[NewPage] Attempting to insert chemicalCompoundRelations:", JSON.stringify(chemicalCompoundRelations, null, 2));
        const { error: compoundsError } = await supabase
          .from("essential_oil_chemical_compounds")
          .insert(chemicalCompoundRelations);
          
        if (compoundsError) {
          console.error("[NewPage] Supabase error inserting chemical compounds:", compoundsError);
          throw new Error(`Error adding chemical compounds: ${compoundsError.message}`);
        }
        console.log("[NewPage] Chemical compounds relations inserted successfully.");
      } else {
        console.log("[NewPage] No chemical compounds to link.");
      }

      // 9. Handle safety characteristics
      if (relations.safety_characteristics && relations.safety_characteristics.length > 0) {
        const safetyRelations = relations.safety_characteristics.map((charId: string) => ({
          essential_oil_id: essentialOilId, safety_characteristic_id: charId
        }));
        const { error: safetyError } = await supabase.from("essential_oil_safety").insert(safetyRelations);
        if (safetyError) throw new Error(`Error adding safety characteristics: ${safetyError.message}`);
      }
      
      toast({
        title: "Success",
        description: `Essential oil ${basicData.name_english} created successfully.`,
      });
      
      router.push('/admin/essential-oils');
    } catch (error: any) {
      console.error('Error creating essential oil:', error);
      
      toast({
        title: "Error",
        description: error.message || "There was a problem creating the essential oil. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/essential-oils">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Essential Oils</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add Essential Oil</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Essential Oil Details</CardTitle>
          <CardDescription>
            Enter information about the essential oil. All fields marked with an asterisk (*) are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EssentialOilForm 
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
