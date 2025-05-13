# Project Tasks: AromaChat Admin Dashboard - Essential Oil Management System

**Legend:**
* `[P#]` - Phase Number
* `[DB]` - Database Task
* `[FE]` - Frontend Task
* `[BE]` - Backend/Supabase Task
* `[CFG]` - Configuration/Setup Task
* `[UI]` - UI/UX Design Task
* `[INT]` - Integration Task
* `✓` - Completed Task
* `🔄` - In Progress Task

---

## Implementation Status (Last Updated: 2025-05-12)

Supabase Project: **aromachat** (iutxzpzbznbgpkdwbzds) - **ACTIVE_HEALTHY**
Region: sa-east-1

---

### Phase 0: AromaChat Integration & Database Setup
* [✓] `[DB]` Confirm Supabase project 'aromachat' is active and credentials are available.
* [✓] `[DB]` Verify existing database schema matches the required essential oils schema.
* [✓] `[DB]` Implement any missing tables, triggers, and relationships in the Supabase database.
* [✓] `[INT]` Determine the appropriate location in the existing AromaChat project for the admin dashboard components.
* [✓] `[INT]` Plan the routing structure for the admin dashboard within the Next.js app router.
* [✓] `[UI]` Review the existing Shadcn UI components and theme to maintain consistency with best practices.
* [🔄] `[INT]` Leverage existing `@supabase/ssr` and authentication components from the main application.
* [✓] `[FE]` Create an admin dashboard layout that extends the existing AromaChat layout components.
* [✓] `[BE]` Plan RLS policies for restricting admin dashboard access to authorized admin users only.
* [✓] `[DB]` Connect to Supabase 'aromachat' project via SQL editor.
* [✓] `[DB]` Execute `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` - Extension is already created.
* [✓] `[DB]` Create table: `essential_oils` (including trigger).
* [✓] `[DB]` Create lookup table: `aromatic_descriptors`.
* [✓] `[DB]` Create lookup table: `categories`.
* [✓] `[DB]` Create lookup table: `chemical_compounds`.
* [✓] `[DB]` Create lookup table: `countries`.
* [✓] `[DB]` Create lookup table: `extraction_methods`.
* [✓] `[DB]` Create lookup table: `health_issues`.
* [✓] `[DB]` Create lookup table: `plant_parts`.
* [✓] `[DB]` Create lookup table: `safety_characteristics`.
* [✓] `[DB]` Create lookup table: `usage_modes`.
* [✓] `[DB]` Create junction table: `essential_oil_aromatic_descriptors`.
* [✓] `[DB]` Create junction table: `essential_oil_categories`.
* [✓] `[DB]` Create junction table: `essential_oil_chemical_compounds`.
* [✓] `[DB]` Create junction table: `essential_oil_extraction_countries`.
* [✓] `[DB]` Create junction table: `essential_oil_extraction_methods`.
* [✓] `[DB]` Create junction table: `essential_oil_plant_parts`.
* [✓] `[DB]` Create junction table: `essential_oil_safety`.
* [✓] `[DB]` Create table: `essential_oil_usage_suggestions`.
* [✓] `[DB]` Create junction table: `suggestion_health_issue_links`.
* [✓] `[DB]` Review all table constraints, foreign keys, and indexes as per schema.
* [🔄] `[BE]` Create a Supabase helper module (`supabaseClient.ts`) to initialize and export the Supabase client.
* [ ] `[CFG]` Configure ESLint, Prettier for code quality.

### Phase 1: Admin Dashboard Integration & Access Control
* [ ] `[BE]` Define RLS policy for `essential_oils` and related tables: "Enable read access for all users" (public data).
* [ ] `[BE]` Define RLS policy for admin operations: "Enable insert, update, delete for users with admin role only".
* [ ] `[BE]` Create a Supabase function or trigger to assign admin role to specific users.
* [ ] `[INT]` Update the existing auth context to include admin role detection.
* [ ] `[FE]` Add admin dashboard link to the existing user account menu (only visible for admin users).
* [ ] `[FE]` Create admin dashboard layout component (`AdminDashboardLayout.tsx`) that extends the existing `AppLayout` with admin-specific navigation.
* [ ] `[FE]` Follow Shadcn UI best practices from `shadcn_ui_best_practices.md` for all component creation.
* [ ] `[FE]` Create reusable admin UI components (data tables, forms, filters) using proper theme variables.
* [ ] `[FE]` Set up Next.js App Router routes for admin dashboard under `/admin` path with appropriate middleware protection.
* [ ] `[FE]` Create admin-specific navigation sidebar items using the `AppNavItem` component pattern established previously.

### Phase 2: Core Feature - Essential Oil Creation & Management
* **Essential Oil - General Form Structure**
    * [ ] `[FE]` Create `EssentialOilForm.tsx` component.
    * [ ] `[FE]` Add basic fields: `name_english`, `name_scientific`, `name_portuguese` (Shadcn `Input`), `general_description` (Shadcn `Textarea`). Use `react-hook-form`.
    * [ ] `[FE]` Implement validation for these fields (e.g., required).
* **Essential Oil - Popover for `extraction_methods` (Pilot Implementation)**
    * [ ] `[FE]` Create `ExtractionMethodPopover.tsx` component.
        * [ ] `[FE]` Form inside popover: `name` (Input), `description` (Textarea).
        * [ ] `[FE]` Implement logic to save new extraction method to `extraction_methods` table via Supabase client.
        * [ ] `[FE]` On successful save, close popover and pass new item back to parent form.
    * [ ] `[FE]` In `EssentialOilForm.tsx`:
        * [ ] `[FE]` Add multi-select component (e.g., Shadcn `MultiSelect` or build custom with `Command`) for `extraction_methods`. Populate from Supabase.
        * [ ] `[FE]` Add "Add New Extraction Method" button triggering `ExtractionMethodPopover.tsx`.
        * [ ] `[FE]` Handle callback from popover to update selected extraction methods in the main form state.
* **Essential Oil - Replicate Popover for Other Direct Lookups**
    * [ ] `[FE]` `AromaticDescriptorPopover.tsx` & integrate into `EssentialOilForm.tsx`.
    * [ ] `[FE]` `CategoryPopover.tsx` & integrate.
    * [ ] `[FE]` `CountryPopover.tsx` & integrate.
    * [ ] `[FE]` `PlantPartPopover.tsx` & integrate.
* **Essential Oil - `chemical_compounds` Linking**
    * [ ] `[FE]` Create `ChemicalCompoundPopover.tsx` for adding new `chemical_compounds`.
    * [ ] `[FE]` In `EssentialOilForm.tsx`:
        * [ ] `[FE]` UI to select `chemical_compounds` (multi-select + popover).
        * [ ] `[FE]` For each selected compound, add fields for `min_percentage`, `max_percentage`, `typical_percentage`, `notes`.
* **Essential Oil - `safety_characteristics` Linking**
    * [ ] `[FE]` Create `SafetyCharacteristicPopover.tsx` for adding new `safety_characteristics`.
    * [ ] `[FE]` In `EssentialOilForm.tsx`:
        * [ ] `[FE]` UI to select `safety_characteristics` (multi-select + popover).
        * [ ] `[FE]` For each selected characteristic, add a field for `notes`.
* **Essential Oil - CRUD Operations**
    * [ ] `[FE]` `CreateEssentialOilPage.tsx`: Hosts `EssentialOilForm.tsx` for creation.
    * [ ] `[FE]` Implement form submission logic in `EssentialOilForm.tsx` to:
        * Save main `essential_oils` data.
        * Save records to all relevant junction tables (`essential_oil_aromatic_descriptors`, `essential_oil_categories`, etc.). This might involve a Supabase Edge Function or careful transaction-like handling on the client.
    * [ ] `[FE]` `ListEssentialOilsPage.tsx`:
        * [ ] `[FE]` Fetch and display essential oils in a Shadcn `Table`.
        * [ ] `[FE]` Implement basic search/filter functionality.
    * [ ] `[FE]` `ViewEssentialOilPage.tsx`: Display full details of a selected oil (read-only).
    * [ ] `[FE]` `UpdateEssentialOilPage.tsx`: Hosts `EssentialOilForm.tsx`, pre-filled with data for editing. Handle updates to main data and junction table records.
    * [ ] `[FE]` Implement delete functionality for essential oils (with Shadcn `AlertDialog` for confirmation).

### Phase 3: Usage Suggestions Management
* [ ] `[FE]` Create `UsageModePopover.tsx` and `HealthIssuePopover.tsx`.
* [ ] `[FE]` In `EssentialOilForm.tsx` (or a dedicated section within create/edit oil page):
    * [ ] `[FE]` UI to add/edit/delete multiple `essential_oil_usage_suggestions`.
    * [ ] `[FE]` For each suggestion:
        * [ ] `[FE]` Fields: `suggestion_title`, `suggestion_details`, `display_order`.
        * [ ] `[FE]` Select `usage_mode_id` (from `usage_modes`) with `UsageModePopover.tsx`.
        * [ ] `[FE]` Multi-select `health_issue_id` (from `health_issues`) with `HealthIssuePopover.tsx` (linking via `suggestion_health_issue_links`).
    * [ ] `[FE]` Implement logic to save/update/delete suggestions and their health issue links along with the essential oil.

### Phase 4: Standalone Lookup Table Management (Admin Utility)
* *For each lookup table (`aromatic_descriptors`, `categories`, etc.):*
    * [ ] `[FE]` Create `[TableName]ListPage.tsx` (e.g., `AromaticDescriptorsListPage.tsx`).
        * [ ] `[FE]` Display items in a Shadcn `Table`.
        * [ ] `[FE]` Links/buttons for Add, Edit, Delete.
    * [ ] `[FE]` Create `[TableName]Form.tsx` component for create/edit.
    * [ ] `[FE]` Implement Supabase calls for CRUD operations on the lookup table.
    * [ ] `[FE]` Add routes for these management pages.

### Phase 5: Testing, Refinement & Deployment Prep
* [ ] `[FE]` Add loading indicators (e.g., Shadcn `Spinner` or skeleton loaders) for data fetching.
* [ ] `[FE]` Add user feedback/notifications (e.g., Shadcn `Toast`) for save success/failure.
* [ ] `[TST]` Conduct end-to-end testing of all primary user flows:
    * [ ] `[TST]` Signup & Login.
    * [ ] `[TST]` Create new Essential Oil with new lookup items via popovers (all types).
    * [ ] `[TST]` Edit existing Essential Oil, add/remove linked items.
    * [ ] `[TST]` Delete Essential Oil.
    * [ ] `[TST]` Manage Usage Suggestions.
    * [ ] `[TST]` CRUD for at least one standalone lookup table.
* [ ] `[FE]` Review UI for consistency and usability.
* [ ] `[FE]` Check responsiveness on common screen sizes (desktop, tablet).
* [ ] `[CFG]` Code review and refactoring for clarity and performance.
* [ ] `[DB]` Backend: Implement trigger for `names_concatenated` on `essential_oils` table if not handled by client logic on save.
    ```sql
    -- Example Trigger Function for names_concatenated
    CREATE OR REPLACE FUNCTION update_names_concatenated()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.names_concatenated = NEW.name_english || ' | ' || NEW.name_scientific || ' | ' || NEW.name_portuguese;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_update_names_concatenated
    BEFORE INSERT OR UPDATE ON public.essential_oils
    FOR EACH ROW
    EXECUTE FUNCTION update_names_concatenated();
    ```
    *(AI to verify and adapt this trigger)*

### Phase 6: Integration Testing & Deployment
* [ ] `[INT]` Test admin dashboard integration within the main AromaChat application structure.
* [ ] `[UI]` Ensure all components follow Shadcn UI best practices from `shadcn_ui_best_practices.md`.
* [ ] `[UI]` Verify theme consistency between admin components and main application.
* [ ] `[BE]` Update production RLS policies to properly restrict admin functions.
* [ ] `[CFG]` Include admin dashboard components in the Next.js build process: `npm run build`.
* [ ] `[TST]` Test admin dashboard in development and production environments.
* [ ] `[CFG]` Deploy alongside the main AromaChat application.
* [ ] `[TST]` Perform end-to-end testing of the admin features in the deployed application.

---
**Note for AI:** This task list is comprehensive. Prioritize tasks within Phase 2 first, especially the core essential oil creation with a single popover type to establish the pattern. Then expand to other popovers and CRUD operations for essential oils. Standalone lookup table management (Phase 4) can be considered a lower priority for an initial MVP if time is constrained.