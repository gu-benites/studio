# Essential Oil Form - Frontend Component Structure

This document outlines the proposed frontend component structure for creating and editing essential oil entries in the database.

## Top-Level Form Component

**`OilForm`** (Manages overall state and API interactions for saving/loading an oil)
*   **Props:** `oilId` (optional, for editing an existing oil)
*   **State:** All fields for the `essential_oils` table and arrays of IDs/objects for related entities.
*   **Responsibilities:**
    *   Fetching oil data if `oilId` is provided.
    *   Fetching options for all lookup-based selectors.
    *   Handling form submission (POST for new, PUT for edit).
    *   Managing overall form validity.

## Form Sections and Sub-Components

### 1. `OilFormHeader`
*   **Purpose:** Displays the form title and main action buttons.
*   **Components:**
    *   `Typography` or `Heading` for Title (e.g., "Add New Essential Oil" or "Edit {Oil Name}")
    *   `SaveButton` (triggers form submission)
    *   `CancelButton` (navigates away or resets form)

### 2. `BasicInfoSection`
*   **Purpose:** Captures core identifying and descriptive information for the oil.
*   **Components:**
    *   `TextInput` for `name_english` (label: "English Name", required)
    *   `TextInput` for `name_scientific` (label: "Scientific Name", required)
    *   `TextInput` for `name_portuguese` (label: "Portuguese Name", required)
    *   `TextArea` for `general_description` (label: "General Description")
    *   `ImageUpload` for `image_url` (label: "Image URL/Upload", optional)

### 3. `UsageAndSafetySection`
*   **Purpose:** Groups fields related to how the oil is used and its safety considerations.
*   **Sub-Sections:**
    *   **`GeneralUsageSubSection`**
        *   `SingleSelectDropdown` for `internal_use_status_id` (label: "Internal Use", options from `eo_internal_use_statuses`)
            *   *Consider making this a `SingleSelectWithCreatable` if new statuses can be added via this form.*
        *   `SingleSelectDropdown` for `dilution_recommendation_id` (label: "Dilution Recommendation", options from `eo_dilution_recommendations`)
            *   *Consider `SingleSelectWithCreatable`.*
        *   `SingleSelectDropdown` for `phototoxicity_status_id` (label: "Phototoxicity", options from `eo_phototoxicity_statuses`)
            *   *Consider `SingleSelectWithCreatable`.*
    *   **`ApplicationMethodsSubSection`**
        *   `MultiSelectWithCreatable` for `application_methods` (label: "Application Methods")
            *   Connects to `essential_oil_application_methods` and `eo_application_methods`.
            *   Displays selected methods.
            *   Allows adding new methods to `eo_application_methods`.
    *   **`SafetyConsiderationsSubSection`**
        *   **`PetSafetyManager`**
            *   `MultiSelectWithCreatable` for `safety_pet_animal_names` (label: "Safe for Pets")
                *   Connects to `essential_oil_pet_safety` and `eo_pets`.
            *   Dynamically renders `TextArea` inputs for `safety_notes` for each selected pet (e.g., "Notes for Dog Safety").
        *   **`ChildSafetyManager`**
            *   `MultiSelectWithCreatable` for `safety_child_age_ranges` (label: "Child Safety (Age Ranges)")
                *   Connects to `essential_oil_child_safety` and `eo_child_safety_age_ranges`.
            *   Dynamically renders `TextArea` inputs for `safety_notes` for each selected age range.
        *   **`PregnancyNursingSafetySubSection`**
            *   `MultiSelectWithCreatable` for `safety_pregnancy_nursing` (label: "Pregnancy & Nursing Safety")
                *   Connects to `essential_oil_pregnancy_nursing_safety` and `eo_pregnancy_nursing_statuses`.

### 4. `TherapeuticInformationSection`
*   **Purpose:** Captures the various therapeutic aspects of the oil.
*   **Sub-Sections:**
    *   **`PropertiesSubSection`**
        *   `MultiSelectWithCreatable` for `therapeutic_properties` (label: "Therapeutic Properties")
            *   Connects to `essential_oil_therapeutic_properties` and `eo_therapeutic_properties`.
    *   **`HealthBenefitsSubSection`**
        *   `MultiSelectWithCreatable` for `therapeutic_health_benefits` (label: "Health Benefits")
            *   Connects to `essential_oil_health_benefits` and `eo_health_benefits`.
    *   **`EnergeticEmotionalSubSection`**
        *   `MultiSelectWithCreatable` for `therapeutic_energetic_emotional_properties` (label: "Energetic/Emotional Properties")
            *   Connects to `essential_oil_energetic_emotional_properties` and `eo_energetic_emotional_properties`.
    *   **`ChakraAssociationSubSection`**
        *   `MultiSelectWithCreatable` for `therapeutic_chakra_association` (label: "Chakra Association")
            *   Connects to `essential_oil_chakra_association` and `eo_chakras`.

### 5. `ExtractionAndOriginSection`
*   **Purpose:** Details about how and where the oil is extracted.
*   **Sub-Sections:**
    *   **`ExtractionDetailsSubSection`**
        *   `MultiSelectWithCreatable` for `extraction_methods` (label: "Extraction Methods")
            *   Connects to `essential_oil_extraction_methods` and `eo_extraction_methods`.
        *   `MultiSelectWithCreatable` for `extraction_partplant` (label: "Plant Parts Used")
            *   Connects to `essential_oil_plant_parts` and `eo_plant_parts`.
    *   **`OriginCountriesSubSection`**
        *   `MultiSelectWithCreatable` for `extraction_countries` (label: "Countries of Origin")
            *   Connects to `essential_oil_extraction_countries` and `eo_countries`.

### 6. `AromaProfileSection`
*   **Purpose:** Describes the aromatic characteristics of the oil.
*   **Sub-Sections:**
    *   **`AromaNotesSubSection`**
        *   `MultiSelectWithCreatable` for `aroma_notes` (label: "Aroma Notes - e.g., Top, Middle, Base")
            *   Connects to `essential_oil_aroma_notes` and `eo_aroma_notes`.
    *   **`AromaScentsSubSection`**
        *   `MultiSelectWithCreatable` for `aroma_scents` (label: "Aroma Scents - e.g., Citrus, Floral")
            *   Connects to `essential_oil_aroma_scents` and `eo_aroma_scents`.

### 7. `DetailedUsageInstructionsSection` (`UsageInstructionsManager`)
*   **Purpose:** Manages detailed usage instructions, linking oil, health benefit, and application method.
*   **Components:**
    *   `AddButton` ("Add Usage Instruction")
    *   A list/area to display multiple `UsageInstructionEntryForm` components.
    *   **`UsageInstructionEntryForm`** (Repeated for each instruction added)
        *   **Props:** `instructionData` (object with current instruction details), `onUpdate`, `onRemove`.
        *   **Internal Components:**
            *   `SingleSelectDropdown` for `health_benefit_id` (label: "For Health Benefit", options from `eo_health_benefits`)
                *   *This dropdown should ideally be populated with benefits already associated with the oil, or all available benefits. Consider creatable if needed.*
            *   `SingleSelectDropdown` for `application_method_id` (label: "Application Method (Optional)", options from `eo_application_methods`)
            *   `TextArea` for `instruction_text` (label: "Detailed Instructions", required)
            *   `TextInput` for `dilution_details` (label: "Dilution Details (Optional)")
            *   `RemoveButton` ("Remove This Instruction")

## Reusable Primitive/Base Components

These are generic components used throughout the form structure.

*   **`TextInput`**
    *   **Props:** `label`, `value`, `onChange`, `placeholder`, `isRequired`, `errorMessage`, etc.
*   **`TextArea`**
    *   **Props:** `label`, `value`, `onChange`, `placeholder`, `rows`, `isRequired`, `errorMessage`, etc.
*   **`ImageUpload`**
    *   **Props:** `label`, `currentImageUrl`, `onImageSelect`, `onImageRemove`.
    *   **Functionality:** File selection, preview, handling upload logic (potentially emitting a file object or a base64 string).
*   **`SingleSelectDropdown`**
    *   **Props:** `label`, `options` (array of `{value, label}`), `selectedValue`, `onChange`, `placeholder`, `isRequired`, `errorMessage`.
*   **`MultiSelectDropdown`** (or a component using a library like `react-select` with multi-select enabled)
    *   **Props:** `label`, `options` (array of `{value, label}`), `selectedValues` (array), `onChange`, `placeholder`, `isRequired`, `errorMessage`.
*   **`MultiSelectWithCreatable`** (Extends `MultiSelectDropdown` or uses a library feature)
    *   **Props:** Same as `MultiSelectDropdown` plus `onCreateOption` (function that takes the new option string, makes an API call to save it, and then updates the `options` and `selectedValues`).
    *   **UI:** Includes a way to input and submit a new option if it's not in the list.
*   **`SaveButton`**
    *   **Props:** `onClick`, `disabled`, `isLoading`.
*   **`CancelButton`**
    *   **Props:** `onClick`.
*   **`AddButton`**
    *   **Props:** `onClick`, `label` (e.g., "Add New").
*   **`RemoveButton`**
    *   **Props:** `onClick`, `label` (e.g., "Remove").
*   **`Typography` / `Heading` / `Label`**
    *   Standard text display components.

## Key Implementation Notes

*   **State Management:** The main `OilForm` component will be responsible for holding and managing the complete state of the oil being edited/created. Consider using a state management library (like Redux, Zustand, Context API) for complex forms if prop drilling becomes an issue.
*   **API Integration:**
    *   Data fetching for dropdown options.
    *   Fetching existing oil data for editing.
    *   Submitting new lookup values when "Add New" is used in `MultiSelectWithCreatable` components.
    *   Submitting the entire form data on save.
*   **Modularity:** Break down complex sections into smaller, manageable components.
*   **Validation:** Implement client-side and server-side validation for all required fields and data formats.
*   **User Experience:** Provide clear feedback (loading states, success/error messages), intuitive navigation, and an easy way to correct mistakes.
*   **Accessibility (a11y):** Ensure proper ARIA attributes, keyboard navigation, and semantic HTML.

# Essential Oil Form - Implementation Guide

This document provides comprehensive guidance for implementing the essential oil administration form, including component structure, data flow, and best practices for creating and editing essential oil entries in the database.

## Table of Contents
1. [Component Architecture](#component-architecture)
2. [Data Flow & State Management](#data-flow--state-management)
3. [Form Sections & Components](#form-sections--components)
4. [API Integration](#api-integration)
5. [Validation Strategy](#validation-strategy)
6. [Error Handling](#error-handling)
7. [Performance Considerations](#performance-considerations)
8. [Accessibility Guidelines](#accessibility-guidelines)
9. [Testing Strategy](#testing-strategy)
10. [Deployment & Maintenance](#deployment--maintenance)

## Component Architecture

### Top-Level Form Component

**`OilForm`**
*   **Props**
  - `oilId?: string` - For editing existing oil
  - `onSuccess?: () => void` - Callback after successful save
  - `onCancel?: () => void` - Callback when form is cancelled

*   **State**
  - Form state (as defined above)
  - API status (loading, error, success)
  - Validation state

*   **Responsibilities**
  - Initialize form state
  - Manage form submission
  - Handle API communication
  - Coordinate child components
  - Manage form-wide validation
  - Handle navigation

*   **Lifecycle**
  ```typescript
  useEffect(() => {
    const loadData = async () => {
      if (oilId) {
        await loadOilData();
      }
      await loadAllOptions();
    };
    loadData();
  }, [oilId]);
  ```

## Data Flow & State Management

### State Structure

First, import the necessary types from `src/types/supabase.ts`:

```typescript
import { Database } from '@/types/supabase';

// Re-export commonly used types for convenience
export type EssentialOil = Database['public']['Tables']['essential_oils']['Row'];
export type EssentialOilInsert = Database['public']['Tables']['essential_oils']['Insert'];

// Helper type for form state
export interface FormState {
  // Basic Info - using Pick to select only needed fields
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
  
  // Simple Many-to-Many Relationships
  application_methods: string[];
  therapeutic_properties: string[];
  health_benefits: string[];
  energetic_emotional_properties: string[];
  chakras: string[];
  extraction_methods: string[];
  extraction_countries: string[];
  plant_parts: string[];
  aroma_scents: string[];
  
  // Complex Relationships with Additional Data
  pet_safety: Array<{
    pet_id: string;
    safety_notes: string;
  }>;
  
  child_safety: Array<{
    age_range_id: string;
    safety_notes: string;
  }>;
  
  pregnancy_nursing_status: string[];
  
  // Form Metadata
  isLoading: boolean;
  isSubmitting: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Example of a type for API responses
export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

// Type for form submission response
export type FormSubmitResponse = ApiResponse<{
  oil: EssentialOil;
  message: string;
}>;
```

### State Management Approach
1. **React Context API** for global state management
2. **useReducer** for complex state updates
3. **React Query** for data fetching and caching
4. **Optimistic Updates** for better UX

### Data Flow
1. **Initial Load**
   - Fetch oil data (if editing)
   - Fetch all lookup options
   - Initialize form state
2. **User Interaction**
   - Update local state
   - Validate field(s)
   - Show feedback
3. **Form Submission**
   - Validate all fields
   - Show loading state
   - Submit data to API
   - Handle success/error
   - Update UI accordingly

## API Integration

### Data Fetching

1. **Lookup Data**
   ```typescript
   import { Database } from '@/types/supabase';
   type Tables = Database['public']['Tables'];
   
   // Type for the lookup options
   interface LookupOptions {
     applicationMethods: Tables['eo_application_methods']['Row'][];
     therapeuticProperties: Tables['eo_therapeutic_properties']['Row'][];
     healthBenefits: Tables['eo_health_benefits']['Row'][];
     // Add other lookups as needed
   }
   
   const fetchLookupOptions = async (): Promise<LookupOptions> => {
     const [methods, properties, benefits] = await Promise.all([
       supabase.from('eo_application_methods').select('*'),
       supabase.from('eo_therapeutic_properties').select('*'),
       supabase.from('eo_health_benefits').select('*')
       // Add other lookups as needed
     ]);
     
     // Handle errors
     if (methods.error) throw methods.error;
     if (properties.error) throw properties.error;
     if (benefits.error) throw benefits.error;
     
     return {
       applicationMethods: methods.data || [],
       therapeuticProperties: properties.data || [],
       healthBenefits: benefits.data || []
     };
   };
   ```

2. **Oil Data**
   ```typescript
   import { Database } from '@/types/supabase';
   
   type EssentialOilWithRelations = Database['public']['Views']['v_essential_oil_full_details']['Row'];
   
   const fetchOilData = async (id: string): Promise<EssentialOilWithRelations> => {
     const { data, error } = await supabase
       .from('v_essential_oil_full_details')
       .select('*')
       .eq('id', id)
       .single<EssentialOilWithRelations>();
     
     if (error) throw error;
     if (!data) throw new Error('Oil not found');
     
     return data;
   };

### Data Submission

1. **Save Oil**
   ```typescript
   import { Database } from '@/types/supabase';
   import { FormState } from './types';
   
   type Tables = Database['public']['Tables'];
   
   // Helper function to save many-to-many relationships
   const saveRelationships = async <T extends keyof Tables>(
     oilId: string,
     table: T,
     relatedIds: string[]
   ): Promise<void> => {
     if (!relatedIds.length) return;
     
     const { error } = await supabase
       .from(`essential_oil_${table}` as any)
       .delete()
       .eq('essential_oil_id', oilId);
     
     if (error) throw error;
     
     const { error: insertError } = await supabase
       .from(`essential_oil_${table}` as any)
       .insert(
         relatedIds.map(id => ({
           essential_oil_id: oilId,
           [`${table.slice(0, -1)}_id`]: id
         }))
       );
     
     if (insertError) throw insertError;
   };
   
   // Main save function
   export const saveOil = async (
     formData: FormState,
     currentUserId: string
   ): Promise<Tables['essential_oils']['Row']> => {
     // Start transaction
     const { data: oil, error: oilError } = await supabase
       .from('essential_oils')
       .upsert({
         id: formData.basic_info.id || undefined,
         ...formData.basic_info,
         updated_by: currentUserId,
         updated_at: new Date().toISOString(),
         created_at: formData.basic_info.id 
           ? undefined 
           : new Date().toISOString()
       })
       .select()
       .single<Tables['essential_oils']['Row']>();
     
     if (oilError) {
       console.error('Error saving oil:', oilError);
       throw new Error(`Failed to save oil: ${oilError.message}`);
     }
     
     try {
       // Save all relationships in parallel
       await Promise.all([
         saveRelationships(oil.id, 'application_methods', formData.application_methods),
         saveRelationships(oil.id, 'therapeutic_properties', formData.therapeutic_properties),
         saveRelationships(oil.id, 'health_benefits', formData.health_benefits),
         // Add other relationship saves as needed
       ]);
       
       // Save complex relationships with additional data
       await savePetSafety(oil.id, formData.pet_safety);
       await saveChildSafety(oil.id, formData.child_safety);
       
       return oil;
     } catch (error) {
       // Rollback the oil creation/update if relationship saving fails
       if (oil.id) {
         await supabase
           .from('essential_oils')
           .delete()
           .eq('id', oil.id);
       }
       throw error;
     }
   };
   
   // Example of saving pet safety with notes
   const savePetSafety = async (
     oilId: string,
     petSafety: Array<{ pet_id: string; safety_notes: string }>
   ): Promise<void> => {
     if (!petSafety.length) return;
     
     const { error: deleteError } = await supabase
       .from('essential_oil_pet_safety')
       .delete()
       .eq('essential_oil_id', oilId);
     
     if (deleteError) throw deleteError;
     
     const { error: insertError } = await supabase
       .from('essential_oil_pet_safety')
       .insert(
         petSafety.map(({ pet_id, safety_notes }) => ({
           essential_oil_id: oilId,
           pet_id,
           safety_notes,
           created_at: new Date().toISOString()
         }))
       );
     
     if (insertError) throw insertError;
   };
   
   // Similar implementation for saveChildSafety
   // ...
   ```

## Validation Strategy

### Client-Side Validation
1. **Field-Level Validation**
   - Required fields
   - Format validation (emails, URLs, numbers)
   - Custom validation rules

2. **Form-Level Validation**
   - Cross-field validation
   - Conditional requirements
   - Business rules

```typescript
const validateForm = (values: FormState) => {
  const errors: Record<string, string> = {};
  
  // Basic info validation
  if (!values.basic_info.name_english.trim()) {
    errors['basic_info.name_english'] = 'English name is required';
  }
  
  // Add other validations
  
  return errors;
};
```

### Server-Side Validation
- API returns structured error messages
- Handle 400/422 validation errors
- Show server-side errors in UI

## Error Handling

### Error Types
1. **Form Validation Errors**
   - Show inline error messages
   - Scroll to first error
   - Prevent submission

2. **API Errors**
   - Network errors
   - Validation errors
   - Authentication/authorization
   - Server errors

### Error Recovery
- Auto-save drafts
- Form state persistence
- Clear error messages on correction

## Performance Considerations

### Data Loading
- Lazy load non-critical sections
- Virtualize long lists
- Cache API responses

### Rendering
- Memoize components
- Use React.memo for expensive renders
- Optimize re-renders

## Accessibility Guidelines

### Keyboard Navigation
- All form controls keyboard accessible
- Logical tab order
- Skip links

### ARIA
- Proper roles and labels
- Live regions for dynamic updates
- Error messages associated with controls

## Testing Strategy

### Unit Tests
- Form validation
- State updates
- Component rendering

### Integration Tests
- Form submission
- API interactions
- Navigation

### E2E Tests
- User flows
- Error scenarios
- Accessibility

## Deployment & Maintenance

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# Add other environment-specific variables
```

### Monitoring
- Error tracking
- Performance monitoring
- Usage analytics

### Maintenance
- Update dependencies
- Review and update tests
- Monitor for deprecated APIs

## Implementation Checklist

- [ ] Set up project structure
- [ ] Implement form state management
- [ ] Create reusable form components
- [ ] Implement form sections
- [ ] Add form validation
- [ ] Implement API integration
- [ ] Add error handling
- [ ] Implement loading states
- [ ] Add accessibility features
- [ ] Write tests
- [ ] Optimize performance
- [ ] Document components and APIs

## Future Enhancements

1. **Offline Support**
   - Service worker for offline access
   - Background sync for pending changes

2. **Advanced Features**
   - Version history
   - Collaborative editing
   - Bulk actions

3. **Performance**
   - Code splitting
   - Image optimization
   - Lazy loading

## Troubleshooting

### Common Issues
1. **Form not submitting**
   - Check required fields
   - Verify API endpoint
   - Check browser console for errors

2. **Data not loading**
   - Verify network connection
   - Check API response
   - Review error logs

3. **Performance issues**
   - Profile component renders
   - Check for unnecessary re-renders
   - Optimize expensive operations

## Support

For assistance, please contact the development team or refer to the API documentation.