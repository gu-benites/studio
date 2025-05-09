# Checklist: Implementing a Dynamic Loading Screen for API Calls Between Steps

This checklist outlines the general steps to implement a dynamic loading screen that appears immediately after a user action (e.g., clicking "Next"), while an API call fetches data for the subsequent screen.

## Loading Screen: Demographics to Causes

This section details the implementation for the "Demographics" to "Causes" step transition.

### Phase 1: Preparation & Component Creation (Demographics -> Causes)

-   **[X] 1. Design the Loading Screen UI:**
    -   Define the visual elements: pulsing circles, step-by-step messages, progress bar, time elapsed, overall layout.
    -   Refer to the definitive design specification: `app_docs/01_loading_feature.html`.
-   **[X] 2. Create/Update the Loading Screen Component:**
    -   The component `src/components/recipe-flow/LoadingCausesScreen.tsx` has been created/updated to match the design from `01_loading_feature.html`.
    -   Implemented pulsing circles, dynamic step messages (based on `formData` like health concern, gender, age), progress bar, and time elapsed.
    -   The component handles its own animation and state progression internally based on a configuration of steps and durations.

### Phase 2: Context (State Management) Updates (Demographics -> Causes)

-   **[X] 3. Add State to Manage Loading Screen Visibility:**
    -   Open `src/contexts/RecipeFormContext.tsx`.
    -   The state `isFetchingCauses` and setter `setIsFetchingCauses` are already present to control the visibility of `LoadingCausesScreen`.

### Phase 3: Triggering the Loading Screen (DemographicsStep.tsx)

-   **[X] 4. Modify `DemographicsStep.tsx`:**
    -   Import `setIsFetchingCauses` from `useRecipeForm`.
    -   In `onSubmitDemographics` (or the function handling "Next"):
        -   **[X] a. Set `isFetchingCauses(true)`:** Called before the API call.
        -   **[X] b. Navigate Immediately:** Router push to `/create-recipe/causes` is performed.
        -   **[X] c. Update `currentStep` in Context:** `setCurrentStep('causes')` is called.
    -   **[X] d. Initiate API Call:** `getPotentialCauses` is called.
    -   **[X] e. In `finally` block:** `setIsFetchingCauses(false)` is called.

### Phase 4: Displaying the Loading Screen (CreateRecipeStepPage.tsx)

-   **[X] 5. Modify `src/app/(recipe-flow)/create-recipe/[step]/page.tsx`:**
    -   Import `LoadingCausesScreen`.
    -   Import `isFetchingCauses` from `useRecipeForm`.
    -   **[X] Conditional Rendering:**
        -   `if (step === 'causes' && isFetchingCauses)` then render `LoadingCausesScreen`.
        -   Else, render `CausesStep`.
    -   **[X] 6. Adjust Navigation Controls:**
        -   `RecipeStepLayout`'s "Next" button is disabled based on `isFetchingCauses` (among other states).

### Phase 5: Testing (Demographics -> Causes)

-   **[X] 7. Verify the Flow:**
    -   Navigate to Demographics.
    -   Click "Próximo".
    -   Confirm immediate navigation to `/create-recipe/causes` and `LoadingCausesScreen` appears.
    -   Confirm dynamic messages (health concern, gender, age) update correctly.
    -   Confirm progress bar and time update.
    -   Confirm `LoadingCausesScreen` disappears and `CausesStep` appears on API completion.
    -   Test error scenarios.

---

## Loading Screen: Causes to Symptoms

This section details the implementation for the "Causes" to "Symptoms" step transition.

### Phase 1: Preparation & Component Creation (Causes -> Symptoms)

-   **[X] 1. Design the Loading Screen UI (Symptoms):**
    -   Reuse the design from `app_docs/01_loading_feature.html` but with different step messages.
-   **[X] 2. Create the Loading Screen Component (Symptoms):**
    -   Create `src/components/recipe-flow/LoadingSymptomsScreen.tsx`.
    -   Implement pulsing circles, dynamic step messages (based on selected causes), progress bar, and time elapsed.
    -   Component manages its own animation based on configured steps/durations.

### Phase 2: Context (State Management) Updates (Causes -> Symptoms)

-   **[X] 3. Add State to Manage Loading Screen Visibility (Symptoms):**
    -   Open `src/contexts/RecipeFormContext.tsx`.
    -   Add `isFetchingSymptoms: boolean` and `setIsFetchingSymptoms: (fetching: boolean) => void`.
    -   Include these in the context provider's value.

### Phase 3: Triggering the Loading Screen (CausesStep.tsx)

-   **[X] 4. Modify `CausesStep.tsx`:**
    -   Import `setIsFetchingSymptoms` from `useRecipeForm`.
    -   In `handleSubmitCauses` (the function handling "Next"):
        -   **[X] a. Set `setIsFetchingSymptoms(true)`:** Call before the API call.
        -   **[X] b. Navigate Immediately:** Router push to `/create-recipe/symptoms`.
        -   **[X] c. Update `currentStep` in Context:** `setCurrentStep('symptoms')`.
    -   **[X] d. Initiate API Call:** Call `getPotentialSymptoms`.
    -   **[X] e. In `finally` block:** Call `setIsFetchingSymptoms(false)`.

### Phase 4: Displaying the Loading Screen (CreateRecipeStepPage.tsx - Symptoms)

-   **[X] 5. Modify `src/app/(recipe-flow)/create-recipe/[step]/page.tsx` (again):**
    -   Import `LoadingSymptomsScreen`.
    -   Import `isFetchingSymptoms` from `useRecipeForm`.
    -   **[X] Add Conditional Rendering for Symptoms Loading:**
        -   `if (step === 'symptoms' && isFetchingSymptoms)` then render `LoadingSymptomsScreen`.
        -   Else, render `SymptomsStep` (when `step === 'symptoms'` and not fetching).
    -   **[X] 6. Adjust Navigation Controls (If applicable for Symptoms):**
        -   Ensure `RecipeStepLayout`'s "Next" button is appropriately disabled if `isFetchingSymptoms` is active for the symptoms step.

### Phase 5: Testing (Causes -> Symptoms)

-   **[X] 7. Verify the Flow (Causes -> Symptoms):**
    -   Navigate to the Causes step.
    -   Select one or more causes.
    -   Click "Próximo".
    -   Confirm immediate navigation to `/create-recipe/symptoms` (URL change) and that the `LoadingSymptomsScreen` appears instantly.
    -   Confirm the dynamic loading messages in `LoadingSymptomsScreen` (e.g., mentioning selected causes) update correctly.
    -   Verify the progress bar and time elapsed update smoothly.
    -   Confirm the `LoadingSymptomsScreen` disappears and the actual content of the `SymptomsStep` appears once the API call for symptoms completes and the `isFetchingSymptoms` state is set to false.
    -   Test error scenarios during the `getPotentialSymptoms` API call.

---

## Loading Screen: Symptoms to Properties

This section details the implementation for the "Symptoms" to "Properties" step transition.

### Phase 1: Preparation & Component Creation (Symptoms -> Properties)

-   **[X] 1. Design the Loading Screen UI (Properties):**
    -   Reuse the design from `app_docs/01_loading_feature.html` but with step messages tailored for fetching therapeutic properties.
-   **[X] 2. Create the Loading Screen Component (Properties):**
    -   Create `src/components/recipe-flow/LoadingPropertiesScreen.tsx`.
    -   Implement pulsing circles, dynamic step messages (based on selected symptoms and potentially causes), progress bar, and time elapsed.
    -   Component manages its own animation based on configured steps/durations.
    -   Example messages for `LoadingPropertiesScreen.tsx`:
        - "Conectando ao Servidor..."
        - "Analisando Sintomas Selecionados: {symptom1, symptom2...}"
        - "Buscando Propriedades Terapêuticas..."
        - "Combinando Propriedades com Sintomas e Causas..."
        - "Finalizando Lista de Propriedades..."

### Phase 2: Context (State Management) Updates (Symptoms -> Properties)

-   **[X] 3. Add State to Manage Loading Screen Visibility (Properties):**
    -   Open `src/contexts/RecipeFormContext.tsx`.
    -   Add `isFetchingProperties: boolean` and `setIsFetchingProperties: (fetching: boolean) => void`.
    -   Include these in the context provider's value.

### Phase 3: Triggering the Loading Screen (SymptomsStep.tsx)

-   **[X] 4. Modify `SymptomsStep.tsx`:**
    -   Import `setIsFetchingProperties` from `useRecipeForm`.
    -   In `handleSubmitSymptoms` (the function handling "Next"):
        -   **[X] a. Set `setIsFetchingProperties(true)`:** Call before the API call.
        -   **[X] b. Navigate Immediately:** Router push to `/create-recipe/properties`.
        -   **[X] c. Update `currentStep` in Context:** `setCurrentStep('properties')`.
    -   **[X] d. Initiate API Call:** Call `getMedicalProperties`.
    -   **[X] e. In `finally` block:** Call `setIsFetchingProperties(false)`.

### Phase 4: Displaying the Loading Screen (CreateRecipeStepPage.tsx - Properties)

-   **[X] 5. Modify `src/app/(recipe-flow)/create-recipe/[step]/page.tsx` (again):**
    -   Import `LoadingPropertiesScreen`.
    -   Import `isFetchingProperties` from `useRecipeForm`.
    -   **[X] Add Conditional Rendering for Properties Loading:**
        -   `if (step === 'properties' && isFetchingProperties)` then render `LoadingPropertiesScreen`.
        -   Else, render `PropertiesOilsStep` (when `step === 'properties'` and not fetching properties, though it has its own internal loading for oils).
    -   **[X] 6. Adjust Navigation Controls (If applicable for Properties):**
        -   Ensure `RecipeStepLayout`'s "Next" button is appropriately disabled if `isFetchingProperties` is active for the properties step.

### Phase 5: Testing (Symptoms -> Properties)

-   **[ ] 7. Verify the Flow (Symptoms -> Properties):**
    -   Navigate to the Symptoms step.
    -   Select one or more symptoms.
    -   Click "Próximo".
    -   Confirm immediate navigation to `/create-recipe/properties` (URL change) and that the `LoadingPropertiesScreen` appears instantly.
    -   Confirm the dynamic loading messages in `LoadingPropertiesScreen` (e.g., mentioning selected symptoms) update correctly.
    -   Verify the progress bar and time elapsed update smoothly.
    -   Confirm the `LoadingPropertiesScreen` disappears and the actual content of the `PropertiesOilsStep` appears once the API call for medical properties completes and the `isFetchingProperties` state is set to false.
    -   Test error scenarios during the `getMedicalProperties` API call.
