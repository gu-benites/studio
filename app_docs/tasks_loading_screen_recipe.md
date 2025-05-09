
# Checklist: Implementing a Dynamic Loading Screen for API Calls Between Steps

This checklist outlines the general steps to implement a dynamic loading screen that appears immediately after a user action (e.g., clicking "Next"), while an API call fetches data for the subsequent screen. This has been updated to reflect a single reusable `LoadingScreen.tsx` component.

## Reusable Loading Screen Implementation

This section details the implementation for a single, reusable loading screen used across different step transitions in the recipe creation flow.

### Phase 1: Preparation & Component Creation (Reusable)

-   **[X] 1. Design the Loading Screen UI:**
    -   The visual elements are defined: pulsing circles, step-by-step messages, progress bar, time elapsed, overall layout.
    -   Reference design specification: `app_docs/01_loading_feature.html`.
-   **[X] 2. Create/Update the Reusable Loading Screen Component:**
    -   Component `src/components/recipe-flow/LoadingScreen.tsx` has been created.
    -   It implements pulsing circles, dynamic step messages, progress bar, and time elapsed.
    -   The component accepts a `targetStepKey` prop ('causes', 'symptoms', 'properties') to determine which set of loading messages to display.
    -   It takes `formData` from context to populate dynamic parts of messages.
    -   The component handles its own animation and state progression internally based on configured steps and durations for the given `targetStepKey`.

### Phase 2: Context (State Management) Updates (Reusable)

-   **[X] 3. Update State in `RecipeFormContext.tsx`:**
    -   Removed individual `isFetchingCauses`, `isFetchingSymptoms`, `isFetchingProperties` boolean states and their setters.
    -   Added `isFetchingNextStepData: boolean` and `setIsFetchingNextStepData: (fetching: boolean) => void` to control the visibility of the `LoadingScreen`.
    -   Added `loadingScreenTargetStepKey: 'causes' | 'symptoms' | 'properties' | null` and `setLoadingScreenTargetStepKey` to inform `LoadingScreen` which set of messages to display.

### Phase 3: Triggering the Loading Screen (From Each Step Component)

-   **[X] 4. Modify `DemographicsStep.tsx`, `CausesStep.tsx`, `SymptomsStep.tsx`:**
    -   Import `setIsFetchingNextStepData` and `setLoadingScreenTargetStepKey` from `useRecipeForm`.
    -   In the respective submit handlers (e.g., `onSubmitDemographics`, `handleSubmitCauses`, `handleSubmitSymptoms`):
        -   **[X] a. Set `setIsFetchingNextStepData(true)`:** Called before the API call.
        -   **[X] b. Set `setLoadingScreenTargetStepKey('target_step_key')`:**
            -   In `DemographicsStep`: `setLoadingScreenTargetStepKey('causes')`
            -   In `CausesStep`: `setLoadingScreenTargetStepKey('symptoms')`
            -   In `SymptomsStep`: `setLoadingScreenTargetStepKey('properties')`
        -   **[X] c. Navigate Immediately:** Router push to the next step (e.g., `/create-recipe/causes`).
        -   **[X] d. Update `currentStep` in Context:** `setCurrentStep('next_step_name')`.
    -   **[X] e. Initiate API Call:** (e.g., `getPotentialCauses`).
    -   **[X] f. In `finally` block:**
        -   Call `setIsFetchingNextStepData(false)`.
        -   Optionally call `setLoadingScreenTargetStepKey(null)` to clear the target key.

### Phase 4: Displaying the Loading Screen (`CreateRecipeStepPage.tsx`)

-   **[X] 5. Modify `src/app/(recipe-flow)/create-recipe/[step]/page.tsx`:**
    -   Import `LoadingScreen`.
    -   Import `isFetchingNextStepData` and `loadingScreenTargetStepKey` from `useRecipeForm`.
    -   **[X] Conditional Rendering:**
        -   `if (isFetchingNextStepData && loadingScreenTargetStepKey)` then render `<LoadingScreen targetStepKey={loadingScreenTargetStepKey} />`.
        -   Else, render the actual step component (e.g., `CausesStep`).
    -   **[X] 6. Adjust Navigation Controls:**
        -   `RecipeStepLayout`'s "Next" button is disabled based on `isFetchingNextStepData` (among other states like `isFormValid` and general `isLoading`).

### Phase 5: Testing (All Transitions)

-   **[X] 7. Verify the Flow for Each Transition:**
    -   **Demographics -> Causes:**
        -   Click "Próximo" on Demographics.
        -   Confirm immediate navigation to `/create-recipe/causes` and `LoadingScreen` appears with "causes" messages.
        -   Confirm dynamic messages (health concern, gender, age) update correctly.
        -   Confirm progress bar and time update.
        -   Confirm `LoadingScreen` disappears and `CausesStep` appears on API completion.
    -   **Causes -> Symptoms:**
        -   Click "Próximo" on Causes.
        -   Confirm immediate navigation to `/create-recipe/symptoms` and `LoadingScreen` appears with "symptoms" messages.
        -   Confirm dynamic messages (selected causes) update correctly.
        -   Confirm progress bar and time update.
        -   Confirm `LoadingScreen` disappears and `SymptomsStep` appears on API completion.
    -   **Symptoms -> Properties:**
        -   Click "Próximo" on Symptoms.
        -   Confirm immediate navigation to `/create-recipe/properties` and `LoadingScreen` appears with "properties" messages.
        -   Confirm dynamic messages (selected symptoms) update correctly.
        -   Confirm progress bar and time update.
        -   Confirm `LoadingScreen` disappears and `PropertiesOilsStep` appears on API completion.
    -   Test error scenarios for all API calls.

### Phase 6: Cleanup

-   **[X] 8. Delete Old Loading Screen Components:**
    -   `src/components/recipe-flow/LoadingCausesScreen.tsx`
    -   `src/components/recipe-flow/LoadingSymptomsScreen.tsx`
    -   `src/components/recipe-flow/LoadingPropertiesScreen.tsx`

This refactoring ensures a more maintainable and consistent loading experience throughout the recipe creation flow.
