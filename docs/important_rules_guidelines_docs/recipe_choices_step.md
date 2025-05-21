# Step-by-Step Implementation Plan: RecipeChoices Step (NOT Final Recipe)

---

## 🧬 Overview

This step comes after the user reaches the end of the `/create-recipe/properties` screen. Once all data is collected (user info, health concern, causes, symptoms, and properties with their suggested oils), a new API call will be made to fetch **RecipeChoices** – a set of protocol suggestions.

The UI will transition with a **loading screen**, and the new step will be displayed using the same system-wide design patterns (pulsing animations, step messages, bottom progress bar).

---

## 1. API Integration — Define and Implement API Call

**File:** `src/services/aromarx-api-client.ts`

* [ ] Create a new API method:
  `fetchRecipeChoices(formData: CompleteRecipeData): Promise<RecipeChoices>`

* [ ] Construct the JSON body with:

  * User demographics (age, gender, etc.)
  * Health concern
  * Selected potential causes
  * Selected symptoms
  * All therapeutic properties
  * Associated suggested oils for each property

* [ ] Handle the API response and define the type `RecipeChoices`

* [ ] Update API documentation:

  **File:** `app_docs/01_api_calls_n_responses.txt`
  Add:

  ```json
  POST /api/recipe-choices
  {
    "user": { ... },
    "health_concern": "...",
    "causes": [...],
    "symptoms": [...],
    "properties": [
      {
        "name": "Anti-inflammatory",
        "suggested_oils": ["Lavender", "Helichrysum"]
      },
      ...
    ]
  }

  Response:
  {
    "choices": [
      {
        "title": "Morning Support",
        "steps": [...],
        "oils": [...]
      },
      ...
    ]
  }
  ```

---

## 2. Update Context to Handle New State

**File:** `src/contexts/RecipeFormContext.tsx`

* [ ] Add new state to context:

  ```ts
  recipeChoices: RecipeChoices | null
  isFetchingRecipeChoices: boolean
  setRecipeChoices: (data: RecipeChoices) => void
  setIsFetchingRecipeChoices: (loading: boolean) => void
  ```

* [ ] Add new messages to `STEP_LOADING_MESSAGES` for the new step:

  ```ts
  recipe-choices: [
    "Compiling your selections...",
    "Requesting personalized recipe suggestions...",
    "Analyzing oils and properties...",
    "Finalizing recipe choices..."
  ]
  ```

---

## 3. Modify Properties Step to Trigger RecipeChoices Flow

**File:** `src/components/recipe-flow/PropertiesOilsStep.tsx`

* [ ] Add a **“Generate Suggestions”** button

* [x] On click:

  ```ts
  setIsLoading(true);
  
  // Auto-select all therapeutic properties if they're not already selected
  if (!formData.selectedTherapeuticProperties && formData.medicalPropertiesResult?.therapeutic_properties) {
    updateFormData({ 
      ...formData, 
      selectedTherapeuticProperties: formData.medicalPropertiesResult.therapeutic_properties 
    });
  }
  
  // Use updated form data with all therapeutic properties
  const updatedFormData = {
    ...formData,
    selectedTherapeuticProperties: formData.selectedTherapeuticProperties || 
                                   formData.medicalPropertiesResult?.therapeutic_properties || []
  };
  
  try {
    const choices = await fetchRecipeChoices(updatedFormData);
    updateFormData({ ...updatedFormData, recipeChoices: choices });
    setCurrentStep('recipe-choices');
    router.push('/recipe-choices');
  } catch (error) {
    setError('Failed to fetch recipe choices. Please try again.');
  } finally {
    setIsLoading(false);
  }
  ```

* [x] Automatically use all therapeutic properties without requiring user selection

---

## 4. Create New Step: `RecipeChoicesStep`

**File:** `src/components/recipe-flow/RecipeChoicesStep.tsx`

* [ ] Display the data from `recipeChoices` context

  * Show multiple recipe suggestions if available
  * Allow the user to preview title, oil list, maybe steps or times of day
  * Prepare for future selection step if needed

---

## 5. Register New Step in the Flow

**File:** `src/app/(recipe-flow)/create-recipe/[step]/page.tsx`

* [ ] Add to `stepComponents`:

  ```ts
  recipe-choices: RecipeChoicesStep
  ```

* [ ] Add to `stepTitles` and `stepInstructions`:

  ```ts
  recipe-choices: {
    title: "Suggested Recipes",
    instructions: "Here are your personalized aromatherapy suggestions."
  }
  ```

* [ ] Use `isFetchingRecipeChoices` to control `LoadingScreen` visibility when `currentStep === "recipe-choices"`

* [ ] Update navigation logic (`getNavProps`) if back button or stepper is used

---

## 6. Update Documentation

### 🔧 `app_docs/01_api_calls_n_responses.txt`

* [ ] Add the complete example for `fetch_recipe_choices` request and response

### 🔧 `app_docs/recipe_creation.md`

* [ ] Add to user flow:

  ```
  ➔ After Properties: Send all accumulated data to the API
  ➔ Endpoint returns a list of suggested recipe protocols
  ➔ UI displays a summary screen with these suggestions
  ```

### 🔧 `app_docs/flow-task.md`

* [ ] Add a section for this new step:

  ```
  - Build RecipeChoices API integration
  - Create RecipeChoicesStep component
  - Trigger call after Properties step
  - Update context and page.tsx registration
  ```

### 🔧 `app_docs/tasks_loading_screen_recipe.md`

* [ ] Add:

  ```
  Step: Recipe Choices
  - Reuses common loading UI
  - Loading messages reflect data collation and suggestion generation
  - Progress bar with time elapsed shown at the bottom
  ```

---

## ✅ Summary of Deliverables

| Area    | Task                                                  |
| ------- | ----------------------------------------------------- |
| API     | `fetchRecipeChoices()` with full payload and response |
| Context | Add `recipeChoices` and loading state                 |
| UI Step | New `RecipeChoicesStep` component                     |
| Trigger | Modify `PropertiesOilsStep.tsx` to start this flow    |
| Routing | Register new step and loading screen                  |
| Docs    | Update all `.md` files with clear guidance            |

---

Let me know if you'd like template code for the API function or the new step component.
