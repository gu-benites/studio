import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { OilFormHeader } from './components/OilFormHeader';
import { BasicInfoSection } from './components/sections/BasicInfoSection';
import { UsageAndSafetySection } from './components/sections/UsageAndSafetySection';
import { TherapeuticInformationSection } from './components/sections/TherapeuticInformationSection';
import { ExtractionAndOriginSection } from './components/sections/ExtractionAndOriginSection';
import { AromaProfileSection } from './components/sections/AromaProfileSection';
import { DetailedUsageInstructionsSection } from './components/sections/DetailedUsageInstructionsSection';
import { SetFormData } from './types';

import { BasicInfoFields, FormData } from './types';

interface OilFormProps {
  oilId?: string;
  onClose?: () => void;
}

export const OilForm: React.FC<OilFormProps> = ({ oilId, onClose }: OilFormProps) => {
  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );
  const [formData, setFormData] = useState<FormData>({
    basic_info: {
      name_english: '',
      name_scientific: '',
      name_portuguese: '',
      general_description: '',
      image_url: '',
    },
    internal_use_status_id: '',
    dilution_recommendation_id: '',
    phototoxicity_status_id: '',
    therapeutic_properties: '',
    chemical_composition: '',
    safety_precautions: '',
    extraction_method: '',
    plant_part: '',
    origin: '',
    cultivation: '',
    aroma_profile: '',
    scent_characteristics: '',
    blending_notes: '',
    usage_instructions: '',
    storage_instructions: '',
    shelf_life: '',
    safety_notes_pets: {},
    safety_notes_age_ranges: {},
    safety_notes_pregnancy: {},
    application_methods: [],
    safety_pet_animal_names: [],
    safety_child_age_ranges: []
  });

  // Memoize the setFormData handler to prevent unnecessary re-renders
  const memoizedSetFormData = React.useCallback((field: keyof FormData, value: any) => {
  setFormData(prev => {
    if (field === 'basic_info') {
      if (prev.basic_info === value) return prev;
      return { ...prev, basic_info: value };
    } else if (prev[field] === value) {
      return prev;
    } else {
      return { ...prev, [field]: value };
    }
  });
}, []);

  const router = useRouter();

  // Load existing oil data if editing
  // Define loadOilData as a function in the component scope
  const loadOilData = async () => {
    const { data, error } = await supabaseClient
      .from('essential_oils')
      .select('*')
      .eq('id', oilId)
      .single();

    if (error) throw error;
    if (!data) return;
    setFormData({
      basic_info: {
        name_english: data.name_english || '',
        name_scientific: data.name_scientific || '',
        name_portuguese: data.name_portuguese || '',
        general_description: data.general_description || '',
        image_url: data.image_url || '',
      },
      internal_use_status_id: data.internal_use_status_id || '',
      dilution_recommendation_id: data.dilution_recommendation_id || '',
      phototoxicity_status_id: data.phototoxicity_status_id || '',
      therapeutic_properties: data.therapeutic_properties || '',
      chemical_composition: data.chemical_composition || '',
      safety_precautions: data.safety_precautions || '',
      extraction_method: data.extraction_method || '',
      plant_part: data.plant_part || '',
      origin: data.origin || '',
      cultivation: data.cultivation || '',
      aroma_profile: data.aroma_profile || '',
      scent_characteristics: data.scent_characteristics || '',
      blending_notes: data.blending_notes || '',
      usage_instructions: data.usage_instructions || '',
      storage_instructions: data.storage_instructions || '',
      shelf_life: data.shelf_life || '',
      safety_notes_pets: data.safety_notes_pets || {},
      safety_notes_age_ranges: data.safety_notes_age_ranges || {},
      safety_notes_pregnancy: data.safety_notes_pregnancy || {},
      application_methods: data.application_methods || [],
      safety_pet_animal_names: data.safety_pet_animal_names || [],
      safety_child_age_ranges: data.safety_child_age_ranges || []
    });
  };

  useEffect(() => {
    if (oilId) {
      loadOilData();
    }
  }, [oilId, supabaseClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate form data
      // TODO: Add proper validation

      const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
      if (authError) throw authError;

      if (!user) {
        throw new Error('Not authenticated');
      }

      if (oilId) {
        // Update existing oil
        await supabaseClient
          .from('essential_oils')
          .update({ ...formData, updated_by: user.id })
          .eq('id', oilId);
      } else {
        // Create new oil
        await supabaseClient.from('essential_oils').insert([
          { ...formData, created_by: user.id, updated_by: user.id }
        ]);
      }

      router.push('/admin/essential-oils');
      onClose?.();
    } catch (error) {
      console.error('Error saving oil:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <OilFormHeader oilId={oilId} />
      <BasicInfoSection 
        formData={formData.basic_info}
        setFormData={(data: BasicInfoFields) => {
          memoizedSetFormData('basic_info', data);
        }}
      />
      <UsageAndSafetySection 
        formData={formData}
        setFormData={memoizedSetFormData}
        supabase={supabaseClient} />
      <TherapeuticInformationSection 
        formData={formData}
        setFormData={memoizedSetFormData} />
      <ExtractionAndOriginSection 
        formData={formData}
        setFormData={memoizedSetFormData} />
      <AromaProfileSection 
        formData={formData}
        setFormData={memoizedSetFormData} />
      <DetailedUsageInstructionsSection 
        formData={formData}
        setFormData={memoizedSetFormData} />
    </div>
  );
};
