import { TextInput, TextArea } from '../primitives';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from 'react';
import { BasicInfoFields } from '../../OilForm';

interface BasicInfoSectionProps {
  formData: BasicInfoFields;
  setFormData: React.Dispatch<React.SetStateAction<BasicInfoFields>>;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, setFormData }) => {
  const handleInputChange = (field: keyof BasicInfoSectionProps['formData'], value: string) => {
    setFormData((prev: BasicInfoFields) => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <TextInput
            label="English Name *"
            id="name_english"
            value={formData.name_english}
            onChange={(value: string) => handleInputChange('name_english', value)}
            required
          />
          
          <TextInput
            label="Scientific Name *"
            id="name_scientific"
            value={formData.name_scientific}
            onChange={(value) => handleInputChange('name_scientific', value)}
            required
          />
          
          <TextInput
            label="Portuguese Name *"
            id="name_portuguese"
            value={formData.name_portuguese}
            onChange={(value) => handleInputChange('name_portuguese', value)}
            required
          />
          
          <TextArea
            label="General Description"
            id="general_description"
            value={formData.general_description}
            onChange={(value) => handleInputChange('general_description', value)}
            rows={4}
          />
          
          <TextInput
            label="Image URL/Upload"
            id="image_url"
            value={formData.image_url}
            onChange={(value) => handleInputChange('image_url', value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
