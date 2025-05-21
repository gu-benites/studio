
**Key Adaptable Areas:**

*   **`services/` (or `queries/`, `repositories/`, `operations/`):** The name and structure of this directory will heavily depend on what the service does.
    *   If it's like Hasura (GraphQL), you might have `queries/` and `mutations/`.
    *   If it's like Supabase (database + BaaS), you might have `repositories/`.
    *   If it's like OpenAI (functional services), `services/` with sub-directories for each function (e.g., `embeddings/`, `completions/`) is appropriate.
    *   For "AcmeAnalytics", `services/` with sub-directories like `event-tracking/` and `reporting/` makes sense.
*   **`models/`:** The structure here depends on the complexity of the data models. Simple services might not need a `base/` directory.

## Step-by-Step Guide

1.  **Create Directory:**
    *   Create a new directory under `src/lib/` named after the service (e.g., `src/lib/acme-analytics/`).

2.  **Client Setup (`client/`):**
    *   `client/config.ts`: Define an interface for configuration (API keys, URLs) and a function to load these from environment variables.
    *   `client/types.ts`: Add TypeScript types that directly correspond to the service's API request/response structures.
    *   `client/[service-name]-client.ts`: Initialize and configure the actual SDK or HTTP client for interacting with the service. Export the client instance.

3.  **Models (`models/`):**
    *   Define TypeScript interfaces or classes for the data structures your application will use when interacting with this service. These might be transformations of the raw API responses or domain-specific models.

4.  **Core Logic (e.g., `services/`, `queries/`, `repositories/`):**
    *   Implement the primary functions that your application will call to use the service.
    *   This is where you'll wrap client calls, handle data transformation, and implement business logic related to the service.
    *   Organize into sub-directories if the service offers multiple distinct functionalities.

5.  **Utilities (`utils/`):**
    *   Add any helper functions that are specific to this service integration (e.g., data formatting, custom error parsing).

6.  **Constants (`constants/`):**
    *   Define any constants specific to this service (e.g., default retry counts, specific endpoint paths not managed by an SDK, magic strings used with the service).

7.  **Global Types (`types/` - optional):**
    *   If there are broader types that are used across different parts of this service integration but aren't strictly API client types, define them here. Often, `client/types.ts` and types within `services/` sub-modules are sufficient.

8.  **Main Exports (`index.ts`):**
    *   Create an `index.ts` file in the root of your service directory (`src/lib/acme-analytics/index.ts`).
    *   Export the main client instance, key service functions, models, and types that other parts of your application will need to consume.

9.  **Environment Variables:**
    *   Add new environment variables to `.env.example`.
    *   Document them in the service's `README.md`.
    *   Ensure your local `.env` is updated for development.

10. **Error Handling:**
    *   Implement robust error handling for API calls.
    *   Map service-specific errors to common application error types if applicable, or define clear error types for this service.

11. **Testing:**
    *   Write unit tests for your service logic.
    *   Mock API calls to ensure tests are reliable and don't depend on the external service being live.

12. **Documentation (`README.md`):**
    *   Create a `README.md` file within the service directory (e.g., `src/lib/acme-analytics/README.md`).
    *   Document:
        *   Purpose of the service integration.
        *   Required environment variables.
        *   How to initialize and use the client/services.
        *   Key features and examples.
        *   Any known limitations or important notes.

## Updating Documentation

Once the new service integration is complete:

1.  **Update Main Service Structures Documentation:**
    *   Add the new service to the "Table of Contents".
    *   Add a new section detailing the structure of your newly added service, similar to the existing Hasura, OpenAI, and Supabase sections.
    *   Reference its specific `README.md` for more details.

## Checklist

-   [ ] New service directory created under `src/lib/[ServiceName]/`.
-   [ ] Client configuration (`client/config.ts`) implemented.
-   [ ] Client instance (`client/[service-name]-client.ts`) set up.
-   [ ] Client/API types (`client/types.ts`) defined.
-   [ ] Data models (`models/`) defined.
-   [ ] Core service logic implemented (e.g., in `services/`, `queries/`).
-   [ ] Service-specific utilities (`utils/`) added if needed.
-   [ ] Service-specific constants (`constants/`) added if needed.
-   [ ] Main exports defined in `src/lib/[ServiceName]/index.ts`.
-   [ ] Environment variables added to `.env.example` and documented.
-   [ ] Robust error handling implemented.
-   [ ] Unit tests written for the new service module.
-   [ ] `README.md` for the new service created and filled out.
-   [ ] Main `Service Structures Documentation.md` updated to include the new service.

---

By following these guidelines, you'll ensure that new service integrations are added in a consistent and maintainable way, leveraging the strong foundation you've already built.