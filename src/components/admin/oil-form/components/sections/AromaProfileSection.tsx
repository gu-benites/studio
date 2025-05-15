import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { FormData } from '../../types';

interface AromaProfileSectionProps {
  formData: {
    aroma_profile: string;
    scent_characteristics: string;
    blending_notes: string;
  };
  setFormData: (field: keyof FormData, value: any) => void;
}

export function AromaProfileSection({ formData, setFormData }: AromaProfileSectionProps) {
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(field, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aroma Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="aroma_profile">Aroma Profile</Label>
            <Input
              id="aroma_profile"
              value={formData.aroma_profile}
              onChange={(e) => handleInputChange('aroma_profile', e.target.value)}
              placeholder="Enter aroma profile..."
            />
          </div>
          <div>
            <Label htmlFor="scent_characteristics">Scent Characteristics</Label>
            <Textarea
              id="scent_characteristics"
              value={formData.scent_characteristics}
              onChange={(e) => handleInputChange('scent_characteristics', e.target.value)}
              placeholder="Enter scent characteristics..."
            />
          </div>
          <div>
            <Label htmlFor="blending_notes">Blending Notes</Label>
            <Textarea
              id="blending_notes"
              value={formData.blending_notes}
              onChange={(e) => handleInputChange('blending_notes', e.target.value)}
              placeholder="Enter blending notes..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
