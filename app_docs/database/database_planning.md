# Project Planning: AromaChat Admin Dashboard - Essential Oil Management System

**Version:** 1.0
**Date:** May 12, 2025
**Project:** AromaChat (Admin Dashboard Extension)
**Backend:** Supabase
**Frontend:** Next.js + React + Shadcn UI

## 1. Overview

This document outlines the development plan for adding an Essential Oil Management System to the existing AromaChat application. The goal is to create an admin dashboard section allowing administrators to manage a database of essential oils and their related properties. These oils and relationships will be used in the recipe creation flow of the main application. The primary focus for V1 is the "Essential Oil Inserting Screen" with on-the-fly creation of related entities via popovers.

## 2. Development Phases

The project will be developed in a chronological and iterative manner, focusing on building a solid foundation first and then layering features on top.

### Phase 0: AromaChat Integration & Database Setup (Foundation)
* **Goal:** Verify the existing database schema and prepare for admin dashboard integration.
* **Key Activities:**
    * Confirm access to existing Supabase 'aromachat' project.
    * Verify existing essential oils database schema is properly implemented.
    * Create any missing tables or relationships in the Supabase schema.
    * Plan the admin dashboard structure within the existing AromaChat application.
    * Identify the admin route structure and authentication requirements.
    * Review existing AromaChat components for reusability in the admin dashboard.

### Phase 1: Admin Dashboard Integration & Access Control
* **Goal:** Integrate the admin dashboard within the existing AromaChat app and set up proper access controls.
* **Key Activities:**
    * Leverage existing Supabase Authentication (Google OAuth and email/password).
    * Create admin role and RLS policies for essential oil management tables.
    * Add admin dashboard access to existing user account menu for authorized users.
    * Create admin dashboard layout as an extension of the existing app layout using Shadcn UI components.
    * Add admin-specific routes with proper authorization checks.
    * Create admin dashboard navigation with sections for essential oils management.

### Phase 2: Core Feature - Essential Oil Creation & Management (MVP Focus)
* **Goal:** Develop the primary "Essential Oil Inserting Screen" with full CRUD capabilities for essential oils, including the popover mechanism for adding related lookup items. This is the most critical phase.
* **Key Activities:**
    * Develop the "Create Essential Oil" form with fields: `name_english`, `name_scientific`, `name_portuguese`, `general_description`.
    * For ONE related entity (e.g., `extraction_methods`):
        * Implement a multi-select component to choose existing extraction methods.
        * Implement the "Add New" button next to it.
        * Develop the Shadcn Popover/Dialog component containing the form to add a new extraction method.
        * Ensure the new method is added to the Supabase table and then reflected in the parent form's selection.
    * Replicate the popover functionality for ALL other direct lookup relationships of `essential_oils` (Aromatic Descriptors, Categories, Countries, Plant Parts).
    * Implement specific UI for linking `essential_oil_chemical_compounds` (including percentage fields) with its popover for `chemical_compounds`.
    * Implement specific UI for linking `essential_oil_safety` (including notes field) with its popover for `safety_characteristics`.
    * Implement form submission logic to save the essential oil and its relationships to Supabase.
    * Develop the "List Essential Oils" view with search/filter capabilities.
    * Develop "View Essential Oil Details" and "Update Essential Oil" forms (reusing much of the create form).
    * Implement "Delete Essential Oil" functionality with confirmation.

### Phase 3: Usage Suggestions Management
* **Goal:** Implement the functionality to add, edit, and delete usage suggestions related to an essential oil.
* **Key Activities:**
    * Within the "Create/Update Essential Oil" interface, add a section for managing `essential_oil_usage_suggestions`.
    * Implement form fields for `suggestion_title`, `suggestion_details`, `display_order`.
    * Implement selection for `usage_mode_id` (from `usage_modes`) with its "Add New" popover.
    * Implement multi-selection for linking `health_issue_id` (from `health_issues`) via `suggestion_health_issue_links`, with its "Add New" popover for `health_issues`.
    * Implement CRUD operations for these suggestions linked to an essential oil.

### Phase 4: Standalone Lookup Table Management (Admin Utility)
* **Goal:** Provide administrators with dedicated interfaces to manage lookup table entries directly, independent of the essential oil form.
* **Key Activities:** (For each lookup table: `aromatic_descriptors`, `categories`, `chemical_compounds`, `countries`, `extraction_methods`, `health_issues`, `plant_parts`, `safety_characteristics`, `usage_modes`)
    * Develop a list view.
    * Develop create, update, and delete functionalities.
    * Reuse Shadcn components for forms and tables.

### Phase 5: Testing, Refinement & Deployment Prep
* **Goal:** Ensure application stability, usability, and prepare for deployment.
* **Key Activities:**
    * Thorough end-to-end testing of all user flows, especially the popover interactions.
    * UI/UX review and refinement.
    * Cross-browser testing (if applicable).
    * Responsive design checks.
    * Code cleanup and optimization.
    * Add basic error handling and user feedback (toasts/notifications).

### Phase 6: Integration Testing & Deployment
* **Goal:** Test integration with the main AromaChat application and deploy.
* **Key Activities:**
    * Thorough testing of admin dashboard within the main AromaChat application.
    * Verify that the UI follows established Shadcn UI best practices from `shadcn_ui_best_practices.md`.
    * Ensure theme consistency between admin dashboard and main application.
    * Update RLS policies for production.
    * Deploy alongside the main AromaChat application.

## 3. Assumptions & Notes for AI
* The provided SQL schema is the source of truth for database structure.
* Focus on functionality over extensive styling initially; Shadcn/ui provides a good baseline.
* Iterate on features: get a simple version working, then enhance.
* Component reusability is key, especially for forms and popovers.
* Prioritize the "Essential Oil Inserting Screen" and its popover mechanisms. Standalone lookup management can be a secondary priority if time is constrained for V1.
* The AI should be capable of interpreting the SQL schema to understand relationships and constraints.
* The `names_concatenated` field in `essential_oils` should ideally be populated by a database trigger or backend logic upon insert/update of name fields. For the frontend, ensure the individual name fields are captured.
* The `embedding` field in `essential_oils` is out of scope for V1 UI interaction beyond its existence in the table.