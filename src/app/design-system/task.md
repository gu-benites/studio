# Design System Page Tasks

- [ ] **Task: Create Design System Page Component**
    - [ ] Subtask: Create `src/app/design-system/page.tsx`.
    - [ ] Subtask: Add basic page structure (main container, title).

- [ ] **Task: Translate HTML Content to JSX**
    - [ ] Subtask: Replicate overall HTML structure from `app_docs/01_design_system_01.html`.
    - [ ] Subtask: Convert HTML tags to JSX elements.
    - [ ] Subtask: Apply Tailwind CSS classes from the HTML to `className` attributes.

- [ ] **Task: Implement Styling and Color Palette**
    - [ ] Subtask: Use explicit hex/rgba color values from `01_design_system_01.html` for `aroma-` prefixed colors to accurately represent the documented design system (e.g., using inline styles for specificity on this page).
    - [ ] Subtask: Ensure typography (font, sizes, weights) matches the HTML specification, leveraging `font-poppins`.
    - [ ] Subtask: Implement gradient text and gradient backgrounds as shown in the HTML.

- [ ] **Task: Implement UI Components Showcase**
    - [ ] Subtask: Buttons: Replicate styles for main action button, standard variants, and suggestion chips.
    - [ ] Subtask: Input Fields: Replicate styled input field with icon and gradient border effect.
    - [ ] Subtask: Loading & Progress:
        - [ ] Replicate pulsing circle loading indicator (using `animate-pulseRing`).
        - [ ] Replicate progress bar with gradient.
        - [ ] Replicate step list with active, completed, and ellipsis states (using `animate-ellipsis`).
    - [ ] Subtask: Alerts & Badges: Replicate alert component style and relevancy badges.
    - [ ] Subtask: Replace placeholder SVGs with Lucide React icons where appropriate (Search, ArrowRight, AlertTriangle) or keep as inline SVGs.

- [ ] **Task: Ensure Page Functionality (Visual)**
    - [ ] Subtask: Page should be responsive based on Tailwind classes.
    - [ ] Subtask: Hover/focus states on interactive elements (buttons, inputs) should visually match the HTML spec.

- [ ] **Task: Verify Integration**
    - [ ] Subtask: Confirm page is accessible via the `/design-system` route.
    - [ ] Subtask: Confirm the "Design System" link in `AppSidebar` correctly navigates to this page.
