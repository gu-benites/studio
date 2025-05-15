import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { FormData } from '../../types';

interface DetailedUsageInstructionsSectionProps {
  formData: {
    usage_instructions: string;
    storage_instructions: string;
    shelf_life: string;
  };
  setFormData: (field: keyof FormData, value: any) => void;
}

export function DetailedUsageInstructionsSection({ formData, setFormData }: DetailedUsageInstructionsSectionProps) {
  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(field, value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Usage Instructions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="usage_instructions">Usage Instructions</Label>
            <Textarea
              id="usage_instructions"
              value={formData.usage_instructions}
              onChange={(e) => handleInputChange('usage_instructions', e.target.value)}
              placeholder="Enter detailed usage instructions..."
            />
          </div>
          <div>
            <Label htmlFor="storage_instructions">Storage Instructions</Label>
            <Textarea
              id="storage_instructions"
              value={formData.storage_instructions}
              onChange={(e) => handleInputChange('storage_instructions', e.target.value)}
              placeholder="Enter storage instructions..."
            />
          </div>
          <div>
            <Label htmlFor="shelf_life">Shelf Life</Label>
            <Textarea
              id="shelf_life"
              value={formData.shelf_life}
              onChange={(e) => handleInputChange('shelf_life', e.target.value)}
              placeholder="Enter shelf life information..."
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
