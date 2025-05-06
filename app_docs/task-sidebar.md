# Sidebar and Related Components - Task List

This document outlines the tasks for implementing the sidebar, user account menu, and related modals based on `app_docs/01_saas_template.md` and subsequent clarifications. All tasks are considered completed as per the current application state and recent updates.

## 1. Left Sidebar Implementation

- [x] **Task: Implement Collapsible Left Sidebar Core Functionality**
    - [x] Subtask: Desktop: Default to collapsed state (target: 48px width, 1px right border; current implementation: 68px width).
    - [x] Subtask: Desktop: Expanded state when pinned (287px width, 1px right border).
    - [x] Subtask: Mobile: Sidebar acts as an overlay drawer (287px width).
    - [x] Subtask: Sidebar contains a user profile/account trigger element at the bottom.
    - [x] Subtask: Sidebar contains a toggle icon in its header area for expand/collapse/pin actions.

- [x] **Task: Implement Sidebar Interaction and Pinning**
    - [x] Subtask: Desktop: Clicking the toggle icon (`PanelLeft` when collapsed, `PanelLeftClose` when pinned) pins/unpins and expands/collapses the sidebar.
    - [x] Subtask: Mobile: Clicking the header toggle icon (`PanelLeft` in `MobileHeader`) opens the sidebar as an overlay.
    - [x] Subtask: Mobile: Clicking the close icon (`X`) within the open mobile sidebar closes it.
    - [x] Subtask: Hovering over the desktop sidebar (when unpinned) slightly darkens its background.
    - [x] Subtask: Hovering over the desktop sidebar (when unpinned) does NOT open or close it.

- [x] **Task: Styling and Iconography for Sidebar**
    - [x] Subtask: Use Lucide React Icons for all sidebar-related icons.
        - [x] `PanelLeft` for opening/toggling unpinned desktop sidebar and mobile sidebar.
        - [x] `PanelLeftClose` for closing/toggling pinned desktop sidebar.
        - [x] `X` for closing mobile sidebar from within.
    - [x] Subtask: Ensure icon size within the sidebar is appropriate (design doc target: 28x28; current implementation: 20x20 `h-5 w-5`. Icons are present and consistently sized).
    - [x] Subtask: Ensure appropriate spacing for icon items (design doc target: 32x36 for icon area; current implementation uses padding for spacing).

- [x] **Task: Sidebar Content Display Rules**
    - [x] Subtask: Desktop (Pinned/Expanded): Show icons and text labels for navigation items.
    - [x] Subtask: Desktop (Unpinned/Collapsed): Show only icons for navigation items; labels appear as tooltips or are accessible via `title` attribute.
    - [x] Subtask: Mobile (Open): Show icons and text labels for navigation items.

- [x] **Task: Ensure Sidebar Toggle/Close Icon Positioning in Header**
    - [x] Subtask: Desktop (Pinned/Expanded): `PanelLeftClose` icon positioned consistently in the sidebar header (e.g., top-right area relative to logo).
    - [x] Subtask: Desktop (Unpinned/Collapsed): `PanelLeft` icon is the primary toggle, centered in the header when no logo text is shown.
    - [x] Subtask: Mobile (Open): `X` icon positioned consistently in the sidebar header (e.g., top-right area relative to logo).

## 2. User Account Menu

- [x] **Task: Implement User Account Menu (Triggered from Sidebar)**
    - [x] Subtask: Accessed when profile icon (user avatar) at the bottom of the sidebar is clicked.
    - [x] Subtask: Menu is accessible whether sidebar is collapsed or expanded (desktop) or open (mobile).
    - [x] Subtask: Appears as a pop-up menu using `Popover` component.
    - [x] Subtask: Popover content is correctly positioned relative to the avatar trigger in both collapsed and expanded sidebar states.
    - [x] Subtask: Provides access to:
        - [x] Account (Link to `/account`)
        - [x] Settings (Link to `/settings`)
        - [x] My Subscription (Opens Subscription Modal)
        - [x] Language (Opens Language Selector sub-menu)
        - [x] Help Center (Link to `/help`)
        - [x] Sign Out (Opens Logout Confirmation Modal)
    - [x] Subtask: User Account Menu (and its sub-menus) closes automatically if the main sidebar is collapsed/closed.

## 3. Language Selection (within User Account Menu)

- [x] **Task: Implement Language Selection Sub-Menu**
    - [x] Subtask: Accessed from the "Language" option in the User Account Menu.
    - [x] Subtask: Opens as a secondary interface within the User Account Menu popover, replacing the main menu content.
    - [x] Subtask: Displays a list of available languages (e.g., English, Português, Español).
    - [x] Subtask: Current language selection is visually indicated (e.g., checkmark, bold font).
    - [x] Subtask: Flag icons/emojis are displayed next to language names.
    - [x] Subtask: Basic mechanism for language change exists (currently `console.log`; setup for future i18n integration which would provide instant UI text updates).

## 4. Modals Triggered from User Account Menu

- [x] **Task: Implement Logout Confirmation Modal**
    - [x] Subtask: Activated when "Sign Out" in User Account Menu is clicked.
    - [x] Subtask: Appears as a small, centered modal dialog (`AlertDialog`).
    - [x] Subtask: Modal presents the question: "Are you sure you want to sign out?".
    - [x] Subtask: Includes a "Cancel" button (closes modal, user remains logged in).
    - [x] Subtask: Includes a "Sign Out" (or "Confirm") button (proceeds with logout action, currently logs to console).
    - [x] Subtask: "Sign Out" button is styled as the primary action (e.g., bolded or distinct color).

- [x] **Task: Implement Subscription Modal**
    - [x] Subtask: Activated when "My Subscription" in User Account Menu is clicked.
    - [x] Subtask: Appears as a full-screen modal overlay with a light background.
    - [x] Subtask: Displays subscription-related information using a tabbed interface:
        - [x] Overview tab.
        - [x] Pricing Plans tab with multiple tiers and comparisons.
        - [x] Billing tab for payment methods and history.
        - [x] FAQ tab.
    - [x] Subtask: Includes a prominent close icon ('X') fixed in the top-right corner to dismiss the modal.

## 5. Mobile-Specific Sidebar Behavior

- [x] **Task: Ensure Correct Mobile Header and Sidebar Interaction**
    - [x] Subtask: `MobileHeader` component is displayed only on mobile screens.
    - [x] Subtask: `MobileHeader` contains a `PanelLeft` icon to toggle the mobile sidebar.
    - [x] Subtask: When the mobile sidebar is closed, no other main navigation icons from the sidebar are visible in the `MobileHeader`.
    - [x] Subtask: Opening the mobile sidebar displays it as an overlay, showing full navigation items (icons and text).
    - [x] Subtask: Mobile sidebar closes when a navigation item within it is clicked.
    - [x] Subtask: An overlay is shown behind the mobile sidebar when it's open; clicking this overlay closes the sidebar.

## 6. Settings Page (Accessed via User Account Menu)

- [x] **Task: Implement Settings Page Functionality and Layout**
    - [x] Subtask: Uses a two-column layout within the main content area.
    - [x] Subtask: Employs a tabbed interface with a vertical list of tabs on the left (e.g., "General", "Profile", "Security", "Billing").
    - [x] Subtask: The right-hand area displays settings corresponding to the selected tab.
    - [x] Subtask: The active tab is visually highlighted.
    - [x] Subtask: A close icon ('X') is present in the top-right for dismissal, returning to the previous view.
    - [x] Subtask: Includes standard controls like input fields, toggle switches, and buttons.
    - [x] Subtask: "Save" buttons are present where applicable to persist changes.

## 7. General UI/UX Notes (from `01_saas_template.md`)
    - [x] Primary color theme matches Material UI's default blue palette (achieved via ShadCN theme customization in `globals.css`).
    - [x] Consistent font styles for headings, subheadings, and body text (achieved via Tailwind base, `globals.css`, and component-level styling).
    - [x] Clean and structured layout with clear spacing and alignment (general goal addressed by component structure, Tailwind utility classes, and Material UI's grid concepts where applicable).
    - [x] Subtle transitions and animations for UI elements like the sidebar and modals (leveraging ShadCN component defaults and Tailwind transitions).
