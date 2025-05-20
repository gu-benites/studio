# Essential Oil Form Behavior Specification

## TypeScript Types

All database types are defined in `src/types/supabase.ts` and should be used throughout the application for type safety. These types are automatically generated from your database schema and provide full TypeScript support.

### Key Type Definitions

```typescript
import { Database } from '@/types/supabase';

// Main table types
type EssentialOil = Database['public']['Tables']['essential_oils']['Row'];
type EssentialOilInsert = Database['public']['Tables']['essential_oils']['Insert'];
type EssentialOilUpdate = Database['public']['Tables']['essential_oils']['Update'];

// Reference table types
type InternalUseStatus = Database['public']['Tables']['eo_internal_use_statuses']['Row'];
type DilutionRecommendation = Database['public']['Tables']['eo_dilution_recommendations']['Row'];
type PhototoxicityStatus = Database['public']['Tables']['eo_phototoxicity_statuses']['Row'];
type ApplicationMethod = Database['public']['Tables']['eo_application_methods']['Row'];
type TherapeuticProperty = Database['public']['Tables']['eo_therapeutic_properties']['Row'];
type HealthBenefit = Database['public']['Tables']['eo_health_benefits']['Row'];

// Join table types
type EssentialOilTherapeuticProperty = Database['public']['Tables']['essential_oil_therapeutic_properties']['Row'];
type EssentialOilHealthBenefit = Database['public']['Tables']['essential_oil_health_benefits']['Row'];
// Add other join table types as needed
```

### Form State Type

```typescript
interface FormState {
  // Basic Info
  basic_info: Pick<EssentialOil, 
    'name_english' | 
    'name_scientific' | 
    'name_portuguese' | 
    'general_description' | 
    'image_url'
  >;
  
  // Dropdown Selections
  internal_use_status_id: string;
  dilution_recommendation_id: string;
  phototoxicity_status_id: string;
  
  // Relationships
  application_methods: string[];
  therapeutic_properties: string[];
  health_benefits: string[];
  // ... other relationships
}
```

## Data Structure

## Overview
This document outlines the expected behavior and data flow for the Essential Oil administration form, including how it handles relationships with other entities in the database.

## Data Structure

### Main Entity
- **Table**: `essential_oils`
- **Key Fields**: 
  - `id` (UUID)
  - `name_english`
  - `name_scientific`
  - `name_portuguese`
  - `general_description`
  - `image_url`
  - `internal_use_status_id`
  - `dilution_recommendation_id`
  - `phototoxicity_status_id`
  - `created_at`
  - `updated_at`

### Relationship Tables

#### Simple Many-to-Many (Array of UUIDs)
- Application Methods
- Therapeutic Properties
- Health Benefits
- Energetic/Emotional Properties
- Chakras
- Extraction Methods
- Extraction Countries
- Plant Parts
- Aroma Scents

#### Complex Relationships (With Additional Data)
- **Pet Safety**
  - Table: `essential_oil_pet_safety`
  - Fields: `essential_oil_id`, `pet_id`, `safety_notes`
  
- **Child Safety**
  - Table: `essential_oil_child_safety`
  - Fields: `essential_oil_id`, `age_range_id`, `safety_notes`

- **Pregnancy/Nursing**
  - Table: `essential_oil_pregnancy_nursing_safety`
  - Fields: `essential_oil_id`, `pregnancy_nursing_status_id`

- **Chemical Compounds**
  - Table: `essential_oil_chemical_compounds`
  - Fields: `essential_oil_id`, `chemical_compound_id`, `min_percentage`, `max_percentage`, `typical_percentage`, `notes`

## Form State Structure

```typescript
interface FormData {
  // Basic Info
  basic_info: {
    name_english: string;
    name_scientific: string;
    name_portuguese: string;
    general_description: string;
    image_url: string;
  };
  
  // Dropdown Selections
  internal_use_status_id: string;
  dilution_recommendation_id: string;
  phototoxicity_status_id: string;
  
  // Simple Many-to-Many (Array of UUIDs)
  application_methods: string[];
  therapeutic_properties: string[];
  health_benefits: string[];
  energetic_emotional_properties: string[];
  chakras: string[];
  extraction_methods: string[];
  extraction_countries: string[];
  plant_parts: string[];
  aroma_scents: string[];
  
  // Complex Relationships
  pet_safety: Array<{
    pet_id: string;
    safety_notes: string;
  }>;
  
  child_safety: Array<{
    age_range_id: string;
    safety_notes: string;
  }>;
  
  pregnancy_nursing_status: string[];
  
  chemical_compounds: Array<{
    compound_id: string;
    min_percentage?: number;
    max_percentage?: number;
    typical_percentage?: number;
    notes?: string;
  }>;
  
  // Text Areas
  therapeutic_properties_text: string;
  chemical_composition: string;
  safety_precautions: string;
  extraction_method: string;
  plant_part: string;
  origin: string;
  cultivation: string;
  aroma_profile: string;
  scent_characteristics: string;
  blending_notes: string;
  usage_instructions: string;
  storage_instructions: string;
  shelf_life: string;
}
```

## Save Operation Flow

1. **Validate Form Data**
   - Ensure required fields are filled
   - Validate field formats (URLs, numbers, etc.)
   - Validate relationship constraints

2. **Start Transaction**
   - Begin a database transaction to ensure data consistency

3. **Save Main Record**
   - For new records: Insert into `essential_oils`
   - For updates: Update existing record in `essential_oils`
   - Get the `essential_oil_id`

4. **Handle Relationships**
   For each relationship type:
   1. Delete existing relationships for this oil
   2. Insert new relationships from form data

   Example for Therapeutic Properties:
   ```typescript
   // 1. Delete existing
   await supabase
     .from('essential_oil_therapeutic_properties')
     .delete()
     .eq('essential_oil_id', oilId);
   
   // 2. Insert new
   if (formData.therapeutic_properties.length > 0) {
     const therapeuticPropertiesData = formData.therapeutic_properties.map(propertyId => ({
       essential_oil_id: oilId,
       property_id: propertyId
     }));
     
     await supabase
       .from('essential_oil_therapeutic_properties')
       .insert(therapeuticPropertiesData);
   }
   ```

5. **Handle Special Cases**
   - For pet safety, child safety, and chemical compounds, include the additional data
   - Example for Pet Safety:
     ```typescript
     // Delete existing
     await supabase
       .from('essential_oil_pet_safety')
       .delete()
       .eq('essential_oil_id', oilId);
     
     // Insert new
     if (formData.pet_safety.length > 0) {
       const petSafetyData = formData.pet_safety.map(pet => ({
         essential_oil_id: oilId,
         pet_id: pet.pet_id,
         safety_notes: pet.safety_notes
       }));
       
       await supabase
         .from('essential_oil_pet_safety')
         .insert(petSafetyData);
     }
     ```

6. **Commit Transaction**
   - If all operations succeed, commit the transaction
   - If any operation fails, rollback all changes

7. **Handle Success/Error**
   - Show success message
   - Redirect or update UI as needed
   - Log errors for debugging

## Loading Data

When loading an existing oil:
1. Fetch the main record from `essential_oils`
2. Fetch all related data using the `v_essential_oil_full_details` view
3. Transform the data to match the form state structure
4. Set the form state with the loaded data

## Validation Rules

1. **Required Fields**
   - `name_english`
   - `name_scientific`
   - `internal_use_status_id`
   - `dilution_recommendation_id`
   - `phototoxicity_status_id`

2. **Field Validation**
   - URLs must be valid
   - Percentages must be between 0 and 1 (0-100%)
   - Dates must be in valid format

## Error Handling

1. **Form Validation Errors**
   - Display inline error messages
   - Scroll to first error field

2. **API Errors**
   - Log detailed error information
   - Show user-friendly error message
   - Maintain form state to prevent data loss

3. **Network Errors**
   - Implement retry logic
   - Show offline indicator
   - Queue changes if offline

## Performance Considerations

1. **Data Loading**
   - Only load necessary data
   - Implement pagination for large lists
   - Cache frequently accessed data

2. **Form Updates**
   - Use React.memo for form components
   - Implement proper dependency arrays for effects
   - Debounce rapid state updates

## Accessibility

1. **Form Controls**
   - All form controls must have proper labels
   - Use ARIA attributes where appropriate
   - Support keyboard navigation

2. **Error Handling**
   - Associate error messages with form controls
   - Use ARIA live regions for dynamic content updates

## Browser Support

- Latest versions of Chrome, Firefox, Safari, and Edge
- Mobile Safari and Chrome for mobile
- Graceful degradation for older browsers
