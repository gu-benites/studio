import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { FormData } from '../../types';

interface ExtractionAndOriginSectionProps {
  formData: {
    extraction_method: string;
    plant_part: string;
    origin: string;
    cultivation: string;
  };
  setFormData: (field: keyof FormData, value: any) => void;
}

export function ExtractionAndOriginSection({ formData, setFormData }: ExtractionAndOriginSectionProps) {
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(field, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Extraction and Origin</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="extraction_method">Extraction Method</Label>
            <Input
              id="extraction_method"
              value={formData.extraction_method}
              onChange={(e) => handleInputChange('extraction_method', e.target.value)}
              placeholder="Enter extraction method..."
            />
          </div>
          <div>
            <Label htmlFor="plant_part">Plant Part</Label>
            <Input
              id="plant_part"
              value={formData.plant_part}
              onChange={(e) => handleInputChange('plant_part', e.target.value)}
              placeholder="Enter plant part..."
            />
          </div>
          <div>
            <Label htmlFor="origin">Origin</Label>
            <Input
              id="origin"
              value={formData.origin}
              onChange={(e) => handleInputChange('origin', e.target.value)}
              placeholder="Enter origin..."
            />
          </div>
          <div>
            <Label htmlFor="cultivation">Cultivation</Label>
            <Textarea
              id="cultivation"
              value={formData.cultivation}
              onChange={(e) => handleInputChange('cultivation', e.target.value)}
              placeholder="Enter cultivation details..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
