"use client";

import { useState, useEffect } from 'react';
import { createClient } from '../../../lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
import { Label } from "../../../components/ui/label";
import React from 'react';

export type OilFormData = {
  id?: string;
  name_english: string;
  name_scientific: string;
  name_portuguese: string;
  general_description: string;
  internal_use_status_id: string;
  dilution_recommendation_id: string;
  phototoxicity_status_id: string;
  application_methods: string[];
  therapeutic_properties: string[];
  health_benefits: string[];
  energetic_emotional_properties: string[];
  chakras: string[];
  extraction_methods: string[];
  extraction_countries: string[];
  plant_parts: string[];
  aroma_scents: string[];
  pet_safety: Array<{ pet_id: string; safety_notes: string }>;
  child_safety: Array<{ age_range_id: string; safety_notes: string }>;
  pregnancy_nursing_status: string[];
  image_url?: string | null;
};

export function OilForm({ oilId, onClose }: { oilId?: string; onClose: () => void }) {
  const [formData, setFormData] = useState<OilFormData>({
    name_english: '',
    name_scientific: '',
    name_portuguese: '',
    general_description: '',
    internal_use_status_id: '',
    dilution_recommendation_id: '',
    phototoxicity_status_id: '',
    application_methods: [],
    therapeutic_properties: [],
    health_benefits: [],
    energetic_emotional_properties: [],
    chakras: [],
    extraction_methods: [],
    extraction_countries: [],
    plant_parts: [],
    aroma_scents: [],
    pet_safety: [],
    child_safety: [],
    pregnancy_nursing_status: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState({
    internalUseStatuses: [] as { id: string; name: string }[],
    dilutionRecommendations: [] as { id: string; name: string }[],
    phototoxicityStatuses: [] as { id: string; name: string }[],
    applicationMethods: [] as { id: string; name: string }[],
    therapeuticProperties: [] as { id: string; property_name: string }[],
    healthBenefits: [] as { id: string; benefit_name: string }[],
    energeticProperties: [] as { id: string; property_name: string }[],
    chakras: [] as { id: string; chakra_name: string }[],
    extractionMethods: [] as { id: string; method_name: string }[],
    countries: [] as { id: string; country_name: string }[],
    plantParts: [] as { id: string; part_name: string }[],
    scents: [] as { id: string; scent_name: string }[],
    pets: [] as { id: string; animal_name: string }[],
    ageRanges: [] as { id: string; range_description: string }[],
    pregnancyStatuses: [] as { id: string; status_description: string }[]
  });

  const supabase = createClient();

  useEffect(() => {
    if (oilId) {
      fetchOilData();
    } else {
      // Initialize empty form
      setFormData({
        name_english: '',
        name_scientific: '',
        name_portuguese: '',
        general_description: '',
        internal_use_status_id: '',
        dilution_recommendation_id: '',
        phototoxicity_status_id: '',
        application_methods: [],
        therapeutic_properties: [],
        health_benefits: [],
        energetic_emotional_properties: [],
        chakras: [],
        extraction_methods: [],
        extraction_countries: [],
        plant_parts: [],
        aroma_scents: [],
        pet_safety: [],
        child_safety: [],
        pregnancy_nursing_status: []
      });
    }
    fetchOptions();
  }, [oilId]);

  const fetchOptions = async () => {
    try {
      const [statusRes, dilutionRes, phototoxRes, appMethodRes, therapyRes, healthRes, 
             energyRes, chakraRes, extractRes, countryRes, plantRes, scentRes, 
             petRes, ageRes, pregRes] = await Promise.all([
        supabase.from('eo_internal_use_statuses').select('*'),
        supabase.from('eo_dilution_recommendations').select('*'),
        supabase.from('eo_phototoxicity_statuses').select('*'),
        supabase.from('eo_application_methods').select('*'),
        supabase.from('eo_therapeutic_properties').select('*'),
        supabase.from('eo_health_benefits').select('*'),
        supabase.from('eo_energetic_emotional_properties').select('*'),
        supabase.from('eo_chakras').select('*'),
        supabase.from('eo_extraction_methods').select('*'),
        supabase.from('eo_countries').select('*'),
        supabase.from('eo_plant_parts').select('*'),
        supabase.from('eo_aroma_scents').select('*'),
        supabase.from('eo_pets').select('*'),
        supabase.from('eo_child_safety_age_ranges').select('*'),
        supabase.from('eo_pregnancy_nursing_statuses').select('*')
      ]);

      setOptions({
        internalUseStatuses: statusRes.data || [],
        dilutionRecommendations: dilutionRes.data || [],
        phototoxicityStatuses: phototoxRes.data || [],
        applicationMethods: appMethodRes.data || [],
        therapeuticProperties: therapyRes.data || [],
        healthBenefits: healthRes.data || [],
        energeticProperties: energyRes.data || [],
        chakras: chakraRes.data || [],
        extractionMethods: extractRes.data || [],
        countries: countryRes.data || [],
        plantParts: plantRes.data || [],
        scents: scentRes.data || [],
        pets: petRes.data || [],
        ageRanges: ageRes.data || [],
        pregnancyStatuses: pregRes.data || []
      });
    } catch (error) {
      console.error('Error fetching options:', error);
    }
  };

  const fetchOilData = async () => {
    try {
      const { data, error } = await supabase
        .from('v_essential_oil_full_details')
        .select('*')
        .eq('id', oilId)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          id: data.id,
          name_english: data.name_english,
          name_scientific: data.name_scientific,
          name_portuguese: data.name_portuguese,
          general_description: data.general_description,
          internal_use_status_id: data.internal_use_status_id,
          dilution_recommendation_id: data.dilution_recommendation_id,
          phototoxicity_status_id: data.phototoxicity_status_id,
          application_methods: data.application_methods || [],
          therapeutic_properties: data.therapeutic_properties || [],
          health_benefits: data.health_benefits || [],
          energetic_emotional_properties: data.energetic_emotional_properties || [],
          chakras: data.chakras || [],
          extraction_methods: data.extraction_methods || [],
          extraction_countries: data.extraction_countries || [],
          plant_parts: data.plant_parts || [],
          aroma_scents: data.aroma_scents || [],
          pet_safety: data.pet_safety || [],
          child_safety: data.child_safety || [],
          pregnancy_nursing_status: data.pregnancy_nursing_status || [],
          image_url: data.image_url
        });
      }
    } catch (error) {
      console.error('Error fetching oil data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const oilData = {
        name_english: formData.name_english,
        name_scientific: formData.name_scientific,
        name_portuguese: formData.name_portuguese,
        general_description: formData.general_description,
        internal_use_status_id: formData.internal_use_status_id,
        dilution_recommendation_id: formData.dilution_recommendation_id,
        phototoxicity_status_id: formData.phototoxicity_status_id,
        image_url: formData.image_url
        // We'll handle the relationships separately
      };

      let oilId = formData.id;

      if (oilId) {
        // Update existing oil
        const { error } = await supabase
          .from('essential_oils')
          .update(oilData)
          .eq('id', oilId);

        if (error) throw error;
      } else {
        // Create new oil
        const { data, error } = await supabase
          .from('essential_oils')
          .insert(oilData)
          .select('id')
          .single();

        if (error) throw error;
        oilId = data.id;
      }

      // Now handle all the relationships
      const joinTables = [
        { table: 'essential_oil_application_methods', field: 'application_methods', idField: 'application_method_id' },
        { table: 'essential_oil_therapeutic_properties', field: 'therapeutic_properties', idField: 'property_id' },
        { table: 'essential_oil_health_benefits', field: 'health_benefits', idField: 'health_benefit_id' },
        { table: 'essential_oil_energetic_emotional_properties', field: 'energetic_emotional_properties', idField: 'energetic_property_id' },
        { table: 'essential_oil_chakra_association', field: 'chakras', idField: 'chakra_id' },
        { table: 'essential_oil_extraction_methods', field: 'extraction_methods', idField: 'extraction_method_id' },
        { table: 'essential_oil_extraction_countries', field: 'extraction_countries', idField: 'country_id' },
        { table: 'essential_oil_plant_parts', field: 'plant_parts', idField: 'plant_part_id' },
        { table: 'essential_oil_aroma_scents', field: 'aroma_scents', idField: 'scent_id' },
        { table: 'essential_oil_pregnancy_nursing_safety', field: 'pregnancy_nursing_status', idField: 'pregnancy_nursing_status_id' }
      ];

      // Delete existing relationships and create new ones
      for (const { table, field, idField } of joinTables) {
        // Delete existing relationships
        const { error: deleteError } = await supabase
          .from(table)
          .delete()
          .eq('essential_oil_id', oilId);

        if (deleteError) {
          console.error(`Error deleting from ${table}:`, deleteError);
          continue;
        }

        const relationships = formData[field as keyof OilFormData];
        if (Array.isArray(relationships) && relationships.length > 0) {
          // Insert new relationships
          const { error: insertError } = await supabase
            .from(table)
            .insert(
              relationships.map(id => ({ 
                essential_oil_id: oilId, 
                [idField]: id 
              }))
            );

          if (insertError) {
            console.error(`Error inserting into ${table}:`, insertError);
          }
        }
      }

      // Handle pet safety separately because it has additional fields
      if (formData.pet_safety && formData.pet_safety.length > 0) {
        // Delete existing pet safety records
        const { error: petDeleteError } = await supabase
          .from('essential_oil_pet_safety')
          .delete()
          .eq('essential_oil_id', oilId);

        if (petDeleteError) {
          console.error('Error deleting pet safety:', petDeleteError);
        } else {
          // Insert new pet safety records
          const { error: petInsertError } = await supabase
            .from('essential_oil_pet_safety')
            .insert(formData.pet_safety.map(safety => ({
              essential_oil_id: oilId,
              pet_id: safety.pet_id,
              safety_notes: safety.safety_notes
            })));

          if (petInsertError) {
            console.error('Error inserting pet safety:', petInsertError);
          }
        }
      }

      // Handle child safety separately because it has additional fields
      if (formData.child_safety && formData.child_safety.length > 0) {
        // Delete existing child safety records
        const { error: childDeleteError } = await supabase
          .from('essential_oil_child_safety')
          .delete()
          .eq('essential_oil_id', oilId);

        if (childDeleteError) {
          console.error('Error deleting child safety:', childDeleteError);
        } else {
          // Insert new child safety records
          const { error: childInsertError } = await supabase
            .from('essential_oil_child_safety')
            .insert(formData.child_safety.map(safety => ({
              essential_oil_id: oilId,
              age_range_id: safety.age_range_id,
              safety_notes: safety.safety_notes
            })));

          if (childInsertError) {
            console.error('Error inserting child safety:', childInsertError);
          }
        }
      }

      // Refresh the data after save
      if (oilId) {
        const { data: refreshData, error: refreshError } = await supabase
          .from('v_essential_oil_full_details')
          .select('*')
          .eq('id', oilId)
          .single();

        if (!refreshError && refreshData) {
          console.log('Oil data refreshed successfully');
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving oil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof OilFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Name (English)</Label>
          <Input
            value={formData.name_english}
            onChange={(e) => handleChange('name_english', e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Name (Scientific)</Label>
          <Input
            value={formData.name_scientific}
            onChange={(e) => handleChange('name_scientific', e.target.value)}
            required
          />
        </div>
        <div>
          <Label>Name (Portuguese)</Label>
          <Input
            value={formData.name_portuguese}
            onChange={(e) => handleChange('name_portuguese', e.target.value)}
          />
        </div>
        <div>
          <Label>General Description</Label>
          <Textarea
            value={formData.general_description}
            onChange={(e) => handleChange('general_description', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label>Internal Use Status</Label>
        <Select
          value={formData.internal_use_status_id}
          onValueChange={(value) => handleChange('internal_use_status_id', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {options.internalUseStatuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Similar sections for other dropdowns */}

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
