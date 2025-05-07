# Design System Page Tasks

- [x] **Task: Create Design System Page Component**
    - [x] Subtask: Create `src/app/design-system/page.tsx`.
    - [x] Subtask: Add basic page structure (main container, title).

- [x] **Task: Translate HTML Content to JSX**
    - [x] Subtask: Replicate overall HTML structure from `app_docs/01_design_system_01.html`.
    - [x] Subtask: Convert HTML tags to JSX elements.
    - [x] Subtask: Apply Tailwind CSS classes from the HTML to `className` attributes, prioritizing theme-based classes.

- [x] **Task: Integrate with Global Theme (AromaChat)**
    - [x] Subtask: Update `tailwind.config.ts` to include the AromaChat color palette (`aroma-primary`, `aroma-secondary`, etc.) and other design tokens (fonts, borderRadius).
    - [x] Subtask: Update `src/app/globals.css` to define HSL CSS variables for the AromaChat colors, making them available for ShadCN components and general Tailwind usage.
    - [x] Subtask: Ensure the `DesignSystemPage` uses Tailwind classes that reference the newly defined theme colors (e.g., `bg-aroma-primary`, `text-aroma-text`) instead of local constants or inline styles for AromaChat specific colors.
    - [x] Subtask: Verify that existing ShadCN components used elsewhere in the app now reflect the AromaChat theme colors where appropriate (e.g., `bg-primary` should map to `aroma-primary`).

- [x] **Task: Implement Styling and Color Palette Showcase**
    - [x] Subtask: Use Tailwind classes for all `aroma-` prefixed colors by referencing the theme (e.g., `bg-aroma-primary`, `text-aroma-text-muted`).
    - [x] Subtask: Ensure typography (font `font-poppins`, sizes, weights) matches the HTML specification using Tailwind classes.
    - [x] Subtask: Implement gradient text and gradient backgrounds using Tailwind classes (`from-aroma-grad-start`, `to-aroma-grad-end`).

- [x] **Task: Implement UI Components Showcase (Using Tailwind Theme)**
    - [x] Subtask: Buttons: Replicate styles for main action button, standard variants, and suggestion chips using Tailwind classes and theme colors.
    - [x] Subtask: Input Fields: 
        - [x] Replicate original styled input field with icon and gradient border effect.
        - [x] Implement new chat-style input field with send button (`ArrowUp` icon) and accessory buttons (`Plus`, `FileEdit`). Ensure smooth border transition on focus.
    - [x] Subtask: Loading & Progress:
        - [x] Replicate pulsing circle loading indicator (using `animate-pulseRing` and theme colors like `bg-aroma-primary` with opacities).
        - [x] Replicate progress bar with gradient (using `from-aroma-grad-start`, `to-aroma-grad-end`).
        - [x] Replicate step list with active, completed, and ellipsis states (using `animate-ellipsis` and theme text colors like `text-aroma-text`, `text-aroma-text-muted`).
    - [x] Subtask: Alerts & Badges: Replicate alert component style (`bg-alert-bg`, `text-alert-text`) and relevancy badges using theme colors.
    - [x] Subtask: Replace placeholder SVGs with Lucide React icons where appropriate (ArrowRight, AlertTriangle, ArrowUp, Plus, FileEdit).

- [x] **Task: Ensure Page Functionality (Visual)**
    - [x] Subtask: Page should be responsive based on Tailwind classes.
    - [x] Subtask: Hover/focus states on interactive elements (buttons, inputs) should visually match the HTML spec and use theme colors.
    - [x] Subtask: Chat input send button works with click or keyboard Enter (demonstrated with console logs).

- [x] **Task: Verify Integration**
    - [x] Subtask: Confirm page is accessible via the `/design-system` route.
    - [x] Subtask: Confirm the "Design System" link in `AppSidebar` correctly navigates to this page.
    - [x] Subtask: Confirm that the page correctly uses the Poppins font via `font-poppins` Tailwind class.
    - [x] Subtask: Manually inspect that `globals.css` variables for `--primary`, `--secondary`, etc., are correctly mapped to AromaChat HSL values.
