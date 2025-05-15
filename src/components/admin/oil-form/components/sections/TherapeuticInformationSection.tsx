import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { FormData } from '../../types';

interface TherapeuticInformationSectionProps {
  formData: {
    therapeutic_properties: string;
    chemical_composition: string;
    safety_precautions: string;
  };
  setFormData: (field: keyof FormData, value: any) => void;
}

export function TherapeuticInformationSection({ formData, setFormData }: TherapeuticInformationSectionProps) {
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(field, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Therapeutic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="therapeutic_properties">Therapeutic Properties</Label>
            <Textarea
              id="therapeutic_properties"
              value={formData.therapeutic_properties}
              onChange={(e) => handleInputChange('therapeutic_properties', e.target.value)}
              placeholder="Enter therapeutic properties..."
            />
          </div>
          <div>
            <Label htmlFor="chemical_composition">Chemical Composition</Label>
            <Textarea
              id="chemical_composition"
              value={formData.chemical_composition}
              onChange={(e) => handleInputChange('chemical_composition', e.target.value)}
              placeholder="Enter chemical composition..."
            />
          </div>
          <div>
            <Label htmlFor="safety_precautions">Safety Precautions</Label>
            <Textarea
              id="safety_precautions"
              value={formData.safety_precautions}
              onChange={(e) => handleInputChange('safety_precautions', e.target.value)}
              placeholder="Enter safety precautions..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
