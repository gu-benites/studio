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