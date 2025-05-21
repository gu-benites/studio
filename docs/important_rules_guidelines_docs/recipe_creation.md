# AromaCHAT: Blueprint

## Overview

AromaCHAT is a web application designed to assist users in discovering and creating personalized essential oil recipes. It utilizes a multi-step flow to gather user information, including health concerns, demographics, and specific symptoms/causes. This data is then used to interact with an external API, retrieving relevant therapeutic properties and suggesting suitable essential oils. Finally, the app generates a tailored essential oil recipe based on the user's inputs.

## Main Feature:

- **Multi-Step Flow**: A guided, sequential form that collects data about the user's health concerns, demographics, potential causes, and symptoms.
- **API Integration**: Interacts with an external API (https://webhook.daianefreitas.com/webhook/10p_build_recipe_protocols) to:
  - Fetch potential causes and symptoms.
  - Retrieve associated therapeutic properties.
  - Obtain suggestions for essential oils.
- **Data Persistence**: Uses `sessionStorage` to maintain user data and API responses across the different steps of the form.
- **Dynamic Content**: Provides dynamically generated content based on user input and API responses, including lists of potential causes, symptoms, therapeutic properties, suggested oils, and the final recipe.


## Other Features:
- Dilution Calculator
- Safety Guides


## User Flow

1.  **Health Concern**: User describes their health concern.
2.  **Demographics**: User provides their demographic information (sex, age category, specific age).
3.  **Causes Selection**: User selects potential causes from API suggestions or adds their own.
4.  **Symptoms Selection**: User selects symptoms from API suggestions or adds their own.
5.  **Therapeutic Properties**: The app displays relevant therapeutic properties based on user input.
6.  **Essential Oil Suggestions**: The app suggests essential oils for each property.


## API Communication

The app interacts with an external API at `https://webhook.daianefreitas.com/webhook/10p_build_recipe_protocols` to:
  - Fetch potential causes and symptoms.
  - Retrieve therapeutic properties.
  - Get suggested essential oils.


### API Requests

Each request is made via `POST` with a JSON payload containing:
  - All relevant user data gathered so far.
  - The current step's identifier.

### API Responses

Responses are parsed and stored in `sessionStorage` for subsequent steps.

### Step-by-Step API Calls

-   **After Demographics**:
    -   **Request**: Sends health concern, gender, age, and step "PotentialCauses".
    -   **Response**: List of potential causes.
    -   **Storage**: Saved as "results" in `sessionStorage`.
-   **After Causes Selection**:
    -   **Request**: Sends all previous data, selected causes, and step "PotentialSymptoms".
    -   **Response**: List of potential symptoms.
    -   **Storage**: Saved as "symptoms_results" in `sessionStorage`.
-   **After Symptoms Selection**:
    -   **Request**: Sends all previous data, selected symptoms, and step "MedicalProperties".
    -   **Response**: List of therapeutic properties.
    -   **Storage**: Saved as "medical_properties_results" in `sessionStorage`.
-   **Get Suggested Oils**:
    -   **Request**: For each property, sends all previous data, the property, and step "SuggestedOils".
    -   **Response**: Suggested oils for each property.
    -   **Storage**: Aggregated and saved as "suggested_oils_results" in `sessionStorage`.


## Error Handling

The application is designed to handle errors gracefully:

  - **API Errors**: If API responses are malformed or missing, a clear error is displayed, and the user can restart.
  - **Storage Errors**: If `sessionStorage` encounters errors (e.g., due to browser settings), the issue is detected and explained to the user.

## Main value proposition

AromaCHAT transforms the complex process of creating personalized essential oil recipes into an accessible and engaging digital experience. By leveraging a sophisticated multi-step workflow, dynamic API interactions, and a user-friendly interface, the app empowers users to explore and receive tailored wellness recommendations. The modular architecture, comprehensive error handling, and clear separation of concerns make it a robust and scalable platform for future expansion and enhancements.