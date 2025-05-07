# Recipe Creation Flow - Task List

This document outlines the tasks required to implement the main feature of the AromaChat application: creating a personalized essential oil recipe based on a user's health concern. This plan is derived from `recipe_creation.md`, `01_api_calls_n_responses.txt`, and assumes a standard multi-step form flow as might be detailed in `aromachat-flowchart.mermaid`.

## Overall Goal
Implement a multi-step, guided user flow that collects health-related information, interacts with an external API to fetch relevant data (causes, symptoms, properties, oils), and ultimately (in a future phase) generates a personalized essential oil recipe.

---

## Phase 1: Initial Setup & Health Concern Input

- [ ] **Task 1.1: Project Setup & Core Components**
    - [ ] Subtask 1.1.1: Determine routing strategy for the multi-step flow (e.g., if it starts on `/` and transitions to `/create-recipe/step/:id` or stays on a single dynamic route).
    - [ ] Subtask 1.1.2: Develop a main state management solution for the multi-step form (e.g., React Context, Zustand, or component state passed through props).
        - This will hold user inputs, API responses, and current step.
    - [ ] Subtask 1.1.3: Create basic UI layout for subsequent steps of the multi-step form (header, content area, navigation buttons). (The first step uses `RecipeGenerator.tsx`).
    - [ ] Subtask 1.1.4: Implement utility functions for `sessionStorage` (get, set, remove) to persist data across steps and browser sessions. Include error handling for `sessionStorage` operations.

- [x] **Task 1.2: Health Concern Input UI & Logic**
    - [x] Subtask 1.2.1: Adapt existing UI for the "Health Concern" step.
        - Component: `RecipeGenerator.tsx` (main page at `/`).
        - Elements: Existing input field in `RecipeGenerator.tsx` for 'recipeIdea' serves as health concern input. Existing 'Criar Receita' button will act as 'Next'.
    - [x] Subtask 1.2.2: Implement form validation for the health concern input.
        - Note: `RecipeGenerator.tsx` already uses a Zod schema (`recipeInputSchema`) for `recipeIdea` which includes `min(3)`. This validation is suitable.
    - [ ] Subtask 1.2.3: On 'Criar Receita' button click (adapting `RecipeGenerator.tsx`'s `handleGenerateRecipe` or creating a new handler for the flow):
        - [ ] Store the health concern (from `recipeIdea` input) in the main state and `sessionStorage`.
        - [ ] **Rename `recipeIdea` to `healthConcern` in the main state and `sessionStorage` to reflect its purpose in this flow.**
        - [ ] Transition the user to the "Demographics" step.

---

## Phase 2: Demographics Input & First API Call (Potential Causes)

- [ ] **Task 2.1: Demographics Input UI & Logic**
    - [ ] Subtask 2.1.1: Design and implement the UI for the "Demographics" step.
        - Component: `DemographicsStep.tsx` (or similar, as part of the `/create-recipe/...` flow).
        - Elements:
            - Input for "Gender" (e.g., select dropdown: male, female, other).
            - Input for "Age Category" (e.g., select dropdown: child, teen, adult, senior).
            - Input for "Specific Age" (e.g., number input).
            - "Previous" and "Next" buttons.
    - [ ] Subtask 2.1.2: Implement form validation for demographic inputs.
    - [ ] Subtask 2.1.3: On "Next" button click:
        - Store demographic data in the main state and `sessionStorage`.
        - Trigger the API call to fetch "PotentialCauses".

- [ ] **Task 2.2: API Integration - PotentialCauses**
    - [ ] Subtask 2.2.1: Create an API client/service function to call the external API (`https://webhook.daianefreitas.com/webhook/10p_build_recipe_protocols`).
    - [ ] Subtask 2.2.2: Implement the "PotentialCauses" API call:
        - Method: `POST`
        - Request Body (as per `01_api_calls_n_responses.txt`):
            ```json
            {
              "health_concern": "...", // From Step 1
              "gender": "...",
              "age_category": "...",
              "age_specific": "...",
              "step": "PotentialCauses",
              "user_language": "PT_BR" // Or make this configurable later
            }
            ```
    - [ ] Subtask 2.2.3: Handle API response:
        - Parse the JSON response (expected: array of cause objects).
        - Store the `potential_causes` array in the main state and `sessionStorage` (e.g., key: `potentialCausesResult`).
    - [ ] Subtask 2.2.4: Implement loading state UI while the API call is in progress.
    - [ ] Subtask 2.2.5: Implement error handling for the API call (network errors, non-200 responses, malformed JSON). Display user-friendly error messages.
    - [ ] Subtask 2.2.6: If API call is successful, transition the user to the "Causes Selection" step.

---

## Phase 3: Causes Selection & Second API Call (Potential Symptoms)

- [ ] **Task 3.1: Causes Selection UI & Logic**
    - [ ] Subtask 3.1.1: Design and implement the UI for the "Causes Selection" step.
        - Component: `CausesStep.tsx`
        - Elements:
            - Display the list of `potential_causes` (from `potentialCausesResult`) with their `cause_name`, `cause_suggestion`, and `explanation`.
            - Allow users to select multiple causes (e.g., using checkboxes).
            - (Optional, as per `recipe_creation.md`): Input field for users to add custom causes not listed.
            - "Previous" and "Next" buttons.
    - [ ] Subtask 3.1.2: Implement logic to manage selected causes.
    - [ ] Subtask 3.1.3: On "Next" button click:
        - Store selected causes (and any custom causes) in the main state and `sessionStorage`.
        - Trigger the API call to fetch "PotentialSymptoms".

- [ ] **Task 3.2: API Integration - PotentialSymptoms**
    - [ ] Subtask 3.2.1: Implement the "PotentialSymptoms" API call:
        - Method: `POST`
        - Request Body (as per `01_api_calls_n_responses.txt`):
            ```json
            {
              // ...all previous data (health_concern, demographics)
              "selected_causes": [/* array of selected cause objects */],
              "step": "PotentialSymptoms",
              "user_language": "PT_BR"
            }
            ```
    - [ ] Subtask 3.2.2: Handle API response:
        - Parse the JSON response (expected: array of symptom objects).
        - Store the `potential_symptoms` array in the main state and `sessionStorage` (e.g., key: `potentialSymptomsResult`).
    - [ ] Subtask 3.2.3: Implement loading state UI.
    - [ ] Subtask 3.2.4: Implement API error handling.
    - [ ] Subtask 3.2.5: If successful, transition to "Symptoms Selection" step.

---

## Phase 4: Symptoms Selection & Third API Call (Medical Properties)

- [ ] **Task 4.1: Symptoms Selection UI & Logic**
    - [ ] Subtask 4.1.1: Design and implement the UI for the "Symptoms Selection" step.
        - Component: `SymptomsStep.tsx`
        - Elements:
            - Display the list of `potential_symptoms` (from `potentialSymptomsResult`) with their `symptom_name`, `symptom_suggestion`, and `explanation`.
            - Allow users to select multiple symptoms.
            - (Optional, as per `recipe_creation.md`): Input field for custom symptoms.
            - "Previous" and "Next" buttons.
    - [ ] Subtask 4.1.2: Implement logic to manage selected symptoms.
    - [ ] Subtask 4.1.3: On "Next" button click:
        - Store selected symptoms in the main state and `sessionStorage`.
        - Trigger the API call to fetch "MedicalProperties".

- [ ] **Task 4.2: API Integration - MedicalProperties**
    - [ ] Subtask 4.2.1: Implement the "MedicalProperties" API call:
        - Method: `POST`
        - Request Body (as per `01_api_calls_n_responses.txt`):
            ```json
            {
              // ...all previous data (health_concern, demographics, selected_causes)
              "selected_symptoms": [/* array of selected symptom objects */],
              "step": "MedicalProperties",
              "user_language": "PT_BR"
            }
            ```
    - [ ] Subtask 4.2.2: Handle API response:
        - Parse the JSON response (expected: object with `health_concern_in_english` and `therapeutic_properties` array).
        - Store the `health_concern_in_english` and `therapeutic_properties` array in the main state and `sessionStorage` (e.g., key: `medicalPropertiesResult`).
    - [ ] Subtask 4.2.3: Implement loading state UI.
    - [ ] Subtask 4.2.4: Implement API error handling.
    - [ ] Subtask 4.2.5: If successful, transition to "Therapeutic Properties & Oil Suggestions" step.

---

## Phase 5: Therapeutic Properties Display & Fourth API Call (Suggested Oils - Iterative)

- [ ] **Task 5.1: Therapeutic Properties Display UI**
    - [ ] Subtask 5.1.1: Design and implement the UI to display the fetched therapeutic properties.
        - Component: `PropertiesOilsStep.tsx` (this component will handle both properties and oil suggestions)
        - Elements:
            - For each property in `medicalPropertiesResult.therapeutic_properties`:
                - Display `property_name`, `description`, `causes_addressed`, `symptoms_addressed`, `relevancy`.
            - "Previous" button.
            - A mechanism to trigger fetching oils (could be automatic on load or per property).
            - Area to display suggested oils (populated by Task 5.2).
            - "Next" button (enabled after oils are fetched/selected).
    - [ ] Subtask 5.1.2: Upon loading this step, iterate through each therapeutic property from `medicalPropertiesResult` and trigger an API call for "SuggestedOils".

- [ ] **Task 5.2: API Integration - SuggestedOils (Iterative)**
    - [ ] Subtask 5.2.1: For each `therapeutic_property` object in `medicalPropertiesResult.therapeutic_properties`:
        - Implement the "SuggestedOils" API call:
            - Method: `POST`
            - Request Body (as per `01_api_calls_n_responses.txt`):
                ```json
                {
                  // ...all previous data (health_concern, demographics, selected_causes, selected_symptoms)
                  "therapeutic_properties": [/* current therapeutic_property object being processed */],
                  "step": "SuggestedOils",
                  "user_language": "PT_BR"
                }
                ```
        - Handle API response:
            - Parse the JSON response (expected: object containing `property_id`, `property_name`, and `suggested_oils` array for that property).
            - Store/append these suggested oils, associating them with their respective property, in the main state and `sessionStorage` (e.g., key: `suggestedOilsResult`, which could be an object mapping property_id to its oils).
        - Implement loading state UI (can be per-property or global for all oil fetching).
        - Implement API error handling for each call.
    - [ ] Subtask 5.2.2: Aggregate all "SuggestedOils" responses.

- [ ] **Task 5.3: Suggested Oils Display & Selection UI**
    - [ ] Subtask 5.3.1: Enhance `PropertiesOilsStep.tsx` to display suggested oils under each property or in a consolidated view.
        - For each oil: display `name_english`, `name_local_language`, `oil_description`, `relevancy`.
    - [ ] Subtask 5.3.2: (If interaction is desired) Allow users to select/confirm which oils they want to include in their recipe. This might involve checkboxes next to each oil.
    - [ ] Subtask 5.3.3: On "Next" button click:
        - Store selected/confirmed oils in the main state and `sessionStorage`.
        - Transition to the "Final Recipe Generation" step (currently a placeholder for a future phase).

---

## Phase 6: Final Recipe Generation (Placeholder for Future Implementation)

- [ ] **Task 6.1: (Future) API Integration - CreateRecipe**
    - [ ] Subtask 6.1.1: Define the request/response for a "CreateRecipe" step with the external API provider (not currently in `01_api_calls_n_responses.txt`).
    - [ ] Subtask 6.1.2: Implement the "CreateRecipe" API call.
    - [ ] Subtask 6.1.3: Handle API response (the final recipe details).
    - [ ] Subtask 6.1.4: Implement loading and error handling.

- [ ] **Task 6.2: (Future) Display Generated Recipe UI**
    - [ ] Subtask 6.2.1: Design and implement UI to display the final generated recipe.
        - Component: `RecipeDisplayStep.tsx`
        - Elements: Recipe name, ingredients list, instructions, usage guidelines, safety notes.
        - Options to save, print, or share the recipe.

---

## Phase 7: General UI/UX and Flow Enhancements

- [ ] **Task 7.1: Overall Flow Navigation**
    - [ ] Subtask 7.1.1: Ensure "Previous" buttons correctly navigate to the prior step and repopulate data from state/`sessionStorage`.
    - [ ] Subtask 7.1.2: Implement a progress indicator (e.g., stepper component) to show the user their current position in the flow.
    - [ ] Subtask 7.1.3: Ensure the UI is responsive across different screen sizes.

- [ ] **Task 7.2: Loading & Error States**
    - [ ] Subtask 7.2.1: Standardize loading indicators across all API-dependent steps.
    - [ ] Subtask 7.2.2: Provide consistent and user-friendly error messages. Offer options to retry API calls if applicable.

- [ ] **Task 7.3: User Language (i18n)**
    - [ ] Subtask 7.3.1: (Post-MVP) Implement a mechanism to select `user_language` and pass it to API calls.
    - [ ] Subtask 7.3.2: (Post-MVP) Localize UI text elements if supporting multiple languages.

- [ ] **Task 7.4: Code Quality and Refinement**
    - [ ] Subtask 7.4.1: Refactor components for reusability where applicable.
    - [ ] Subtask 7.4.2: Write unit/integration tests for key logic and API interactions.
    - [ ] Subtask 7.4.3: Ensure code adheres to project styling and linting rules.

---

## Notes
*   The `aromachat-flowchart.mermaid` file was not provided, so this task list assumes a linear progression as strongly indicated by the other documents.
*   The "CreateRecipe" step is marked as future as it's not detailed in the current API documentation. The flow will initially culminate in suggesting oils.
*   Error handling and loading states are crucial for a good user experience and should be implemented thoroughly at each step.
*   `sessionStorage` usage should be carefully managed, especially regarding data structure and potential size limitations if complex objects are stored.
*   Accessibility (ARIA attributes, keyboard navigation) should be considered throughout UI development.

This task list will be updated as development progresses and more insights are gained.
