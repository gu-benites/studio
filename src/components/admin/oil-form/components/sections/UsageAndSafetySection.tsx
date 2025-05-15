import { useState, useEffect } from 'react';
import { SingleSelectDropdown, SelectOption } from '../primitives/SingleSelectDropdown';
import { MultiSelectWithCreatable } from '../primitives/MultiSelectWithCreatable';
import { TextArea } from '../primitives/TextArea';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";  
import { createClient } from '@supabase/supabase-js';
import { cn } from "@/lib/utils";
import { FormData, SetFormData, SupabaseClientType, DatabaseItem, OptionType } from '../../types';

interface UsageAndSafetySectionProps {
  formData: FormData;
  setFormData: SetFormData;
  supabase: SupabaseClientType;
}

interface SafetyNoteField {
  field: keyof FormData;
  value: string;
  label: string;
}

export const UsageAndSafetySection: React.FC<UsageAndSafetySectionProps> = ({ formData, setFormData, supabase }) => {
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(field, value);
  };

  const handleSingleSelectChange = (field: keyof FormData, value: string | null) => {
    setFormData(field, value || '');
  };

  const handleMultiSelectChange = (field: keyof FormData, values: string[]) => {
    setFormData(field, values);
  };

  const handleSafetyNoteChange = (field: keyof FormData, value: string, id: string) => {
    // Compose the new value for the field
    const notes = (formData[field] || {}) as Record<string, string>;
    setFormData(field, {
      ...notes,
      [id]: value
    });
  };

  // State for options
  const [internalUseOptions, setInternalUseOptions] = useState<SelectOption[]>([]);
  const [dilutionOptions, setDilutionOptions] = useState<SelectOption[]>([]);
  const [phototoxicityOptions, setPhototoxicityOptions] = useState<SelectOption[]>([]);
  const [applicationMethodOptions, setApplicationMethodOptions] = useState<SelectOption[]>([]);
  const [petOptions, setPetOptions] = useState<SelectOption[]>([]);
  const [ageRangeOptions, setAgeRangeOptions] = useState<SelectOption[]>([]);
  const [pregnancyOptions, setPregnancyOptions] = useState<SelectOption[]>([]);

  // Fetch options on mount
  useEffect(() => {
    const fetchAllOptions = async () => {
      try {
        // Internal Use
        const { data: internalUseData } = await supabase
          .from('internal_use_status')
          .select('*')
          .order('name');
        setInternalUseOptions(internalUseData?.map((item: DatabaseItem) => ({
          value: item.id,
          label: item.name
        })) || []);

        // Dilution
        const { data: dilutionData } = await supabase
          .from('dilution_recommendations')
          .select('*')
          .order('name');
        setDilutionOptions(dilutionData?.map((item: DatabaseItem) => ({
          value: item.id,
          label: item.name
        })) || []);

        // Phototoxicity
        const { data: phototoxicityData } = await supabase
          .from('phototoxicity_status')
          .select('*')
          .order('name');
        setPhototoxicityOptions(phototoxicityData?.map((item: DatabaseItem) => ({
          value: item.id,
          label: item.name
        })) || []);

        // Application Methods
        const { data: applicationMethodData } = await supabase
          .from('application_methods')
          .select('*')
          .order('name');
        setApplicationMethodOptions(applicationMethodData?.map((item: DatabaseItem & { id: string; name: string }) => ({
          value: item.id,
          label: item.name
        })) || []);

        // Pet Safety
        const { data: petData } = await supabase
          .from('pet_animal_names')
          .select('*')
          .order('name');
        setPetOptions(petData?.map((item: DatabaseItem & { id: string; name: string }) => ({
          value: item.id,
          label: item.name
        })) || []);

        // Age Range Safety
        const { data: ageRangeData } = await supabase
          .from('child_age_ranges')
          .select('*')
          .order('name');
        setAgeRangeOptions(ageRangeData?.map((item: DatabaseItem & { id: string; name: string }) => ({
          value: item.id,
          label: item.name
        })) || []);

        // Pregnancy Safety
        const { data: pregnancyData } = await supabase
          .from('pregnancy_safety_notes')
          .select('*')
          .order('name');
        setPregnancyOptions(pregnancyData?.map((item: DatabaseItem & { id: string; name: string }) => ({
          value: item.id,
          label: item.name
        })) || []);
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchAllOptions();
  }, [supabase]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage and Safety Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Internal Use Status */}
        <div className="space-y-2">
          <SingleSelectDropdown
            id="internal-use-status"
            label="Internal Use Status"
            options={internalUseOptions}
            value={formData.internal_use_status_id}
            onChange={(value) => handleSingleSelectChange('internal_use_status_id', value)}
            placeholder="Select internal use status"
          />
        </div>

        {/* Dilution Recommendation */}
        <div className="space-y-2">
          <SingleSelectDropdown
            id="dilution-recommendation"
            label="Dilution Recommendation"
            options={dilutionOptions}
            value={formData.dilution_recommendation_id}
            onChange={(value) => handleSingleSelectChange('dilution_recommendation_id', value)}
          />
        </div>

        {/* Phototoxicity Status */}
        <div className="space-y-2">
          <SingleSelectDropdown
            id="phototoxicity-status"
            label="Phototoxicity Status"
            options={phototoxicityOptions}
            value={formData.phototoxicity_status_id}
            onChange={(value) => handleSingleSelectChange('phototoxicity_status_id', value)}
          />
        </div>

        {/* Application Methods */}
        <div className="space-y-2">
          <MultiSelectWithCreatable
            label="Application Methods"
            options={applicationMethodOptions}
            value={formData.application_methods}
            onChange={(values) => handleMultiSelectChange('application_methods', values)}
            onCreateOption={async (value) => {
              const { data } = await supabase
                .from('application_methods')
                .insert([{ name: value }])
                .select('*')
                .single();
              return { value: data.id, label: data.name };
            }}
          />
        </div>

        {/* Pet Safety */}
        <div className="space-y-2">
          <MultiSelectWithCreatable
            label="Pet Safety"
            options={petOptions}
            value={formData.safety_pet_animal_names}
            onChange={(values) => handleMultiSelectChange('safety_pet_animal_names', values)}
          />
        </div>

        {/* Child Safety */}
        <div className="space-y-2">
          <MultiSelectWithCreatable
            label="Child Safety"
            options={ageRangeOptions}
            value={formData.safety_child_age_ranges}
            onChange={(values) => handleMultiSelectChange('safety_child_age_ranges', values)}
          />
        </div>

        {/* Safety Notes */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Safety Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pet Safety Notes */}
            {petOptions.map((pet) => (
              <div key={pet.value} className="space-y-2">
                <label className="text-sm font-medium">{pet.label} Notes</label>
                <TextArea
                  label={pet.label}
                  id={`${pet.value}-pets`}
                  value={formData.safety_notes_pets[pet.value] || ''}
                  onChange={(value) => handleSafetyNoteChange('safety_notes_pets', value, pet.value)}
                  placeholder="Enter safety notes for pets"
                  className="mt-1"
                />
              </div>
            ))}

            {/* Age Range Safety Notes */}
            {ageRangeOptions.map((ageRange) => (
              <div key={ageRange.value} className="space-y-2">
                <label className="text-sm font-medium">{ageRange.label} Notes</label>
                <TextArea
                  label={ageRange.label}
                  id={`${ageRange.value}-age`}
                  value={formData.safety_notes_age_ranges[ageRange.value] || ''}
                  onChange={(value) => handleSafetyNoteChange('safety_notes_age_ranges', value, ageRange.value)}
                  placeholder="Enter safety notes for age range"
                  className="mt-1"
                />
              </div>
            ))}

            {/* Pregnancy Safety Notes */}
            {pregnancyOptions.map((pregnancy) => (
              <div key={pregnancy.value} className="space-y-2">
                <label className="text-sm font-medium">{pregnancy.label} Notes</label>
                <TextArea
                  label={pregnancy.label}
                  id={`${pregnancy.value}-pregnancy`}
                  value={formData.safety_notes_pregnancy[pregnancy.value] || ''}
                  onChange={(value) => handleSafetyNoteChange('safety_notes_pregnancy', value, pregnancy.value)}
                  placeholder="Enter safety notes for pregnancy trimester"
                  className="mt-1"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
