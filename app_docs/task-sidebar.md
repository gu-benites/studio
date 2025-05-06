# Sidebar and Related Components - Task List

This document outlines the tasks for implementing the sidebar, user account menu, and related modals based on `app_docs/01_saas_template.md` and subsequent clarifications.

## 1. Left Sidebar Implementation

- [x] **Task: Implement Collapsible Left Sidebar Core Functionality**
    - [x] Subtask: Desktop: Default to collapsed state (target: 48px width, 1px right border).
    - [x] Subtask: Desktop: Expanded state when pinned (target: 287px width, 1px right border).
    - [x] Subtask: Mobile: Sidebar acts as an overlay drawer (target: 287px width).
    - [x] Subtask: Sidebar contains a user profile/account trigger element at the bottom.
    - [x] Subtask: Sidebar contains a toggle icon in its header area for expand/collapse/pin actions.

- [x] **Task: Implement Sidebar Interaction and Pinning**
    - [x] Subtask: Desktop: Clicking the toggle icon (`PanelLeft` when collapsed, `PanelLeftClose` when pinned) pins/unpins and expands/collapses the sidebar.
    - [x] Subtask: Desktop: Hovering over the unpinned collapsed sidebar slightly darkens its background but does NOT open or close it.
    - [x] Subtask: Mobile: Clicking the header toggle icon (`PanelLeft` in `MobileHeader`) opens the sidebar as an overlay.
    - [x] Subtask: Mobile: Clicking the close icon (`X`) within the open mobile sidebar closes it.
    - [x] Subtask: Mobile: Clicking the overlay behind an open mobile sidebar closes it.

- [x] **Task: Styling and Iconography for Sidebar**
    - [x] Subtask: Use Lucide React Icons for all sidebar-related icons.
        - [x] `PanelLeft` for opening/toggling unpinned desktop sidebar and mobile sidebar.
        - [x] `PanelLeftClose` for closing/toggling pinned desktop sidebar.
        - [x] `X` for closing mobile sidebar from within.
    - [x] Subtask: Ensure icon size for navigation items within the sidebar is 28x28 (`h-7 w-7`). Header toggle icons can remain smaller (e.g., `h-5 w-5`).
    - [x] Subtask: Ensure clickable area for each navigation icon (when sidebar is collapsed) is 32px (width) x 36px (height).

- [x] **Task: Sidebar Content Display Rules**
    - [x] Subtask: Desktop (Pinned/Expanded): Show icons (28x28) and text labels for navigation items.
    - [x] Subtask: Desktop (Unpinned/Collapsed): Show only icons (28x28) for navigation items, centered in their 32x36 clickable area. Labels appear as tooltips or are accessible via `title` attribute.
    - [x] Subtask: Mobile (Open): Show icons (28x28) and text labels for navigation items.

- [x] **Task: Sidebar Toggle/Close Icon Positioning in Header**
    - [x] Subtask: Desktop (Pinned/Expanded): `PanelLeftClose` icon positioned to the right of the logo/title area in the sidebar header.
    - [x] Subtask: Desktop (Unpinned/Collapsed): `PanelLeft` icon is the primary toggle, centered within the header's width (48px).
    - [x] Subtask: Mobile (Open): `X` icon positioned to the right of the logo/title area in the sidebar header.

## 2. User Account Menu

- [x] **Task: Implement User Account Menu (Integrated within Sidebar)**
    - [x] Subtask: Accessed when profile icon (user avatar) at the bottom of the sidebar is clicked.
    - [x] Subtask: If sidebar is collapsed (desktop), clicking avatar first expands and pins the sidebar, then shows the User Account Menu.
    - [x] Subtask: If sidebar is expanded (desktop pinned, or mobile open), clicking avatar toggles the User Account Menu's visibility.
    - [x] Subtask: User Account Menu appears as a section *within* the sidebar, directly above the avatar trigger, not as a popover.
    - [x] Subtask: Provides access to:
        - [x] Settings (Link to `/settings`) - Removed direct "Account" link, consolidated into Settings.
        - [x] My Subscription (Opens Subscription Modal)
        - [x] Language (Opens Language Selector sub-menu within the User Account Menu section)
        - [x] Help Center (Link to `/help`)
        - [x] Sign Out (Opens Logout Confirmation Modal)
    - [x] Subtask: User Account Menu (and its sub-menus like Language Selector) closes automatically if the main sidebar is collapsed/closed.
    - [x] Subtask: Clicking a navigation item within the User Account Menu (e.g., Settings, Help) or an action that opens a modal (My Subscription, Sign Out) closes the User Account Menu section (on desktop) or the entire sidebar (on mobile).

## 3. Language Selection (within User Account Menu)

- [x] **Task: Implement Language Selection Sub-Menu**
    - [x] Subtask: Accessed from the "Language" option in the User Account Menu.
    - [x] Subtask: Opens as a secondary view *within* the User Account Menu's allocated space in the sidebar, replacing the main User Account Menu items.
    - [x] Subtask: Displays a list of available languages.
    - [x] Subtask: Current language selection is visually indicated (e.g., checkmark, bold font).
    - [x] Subtask: Flag icons/emojis are displayed next to language names.
    - [x] Subtask: Includes a "back" button or similar mechanism to return to the main User Account Menu items from the language list.

## 4. Modals Triggered from User Account Menu

- [x] **Task: Implement Logout Confirmation Modal**
    - [x] Subtask: Activated when "Sign Out" in User Account Menu is clicked.
    - [x] Subtask: Appears as a small, centered modal dialog (`AlertDialog`).
    - [x] Subtask: Modal presents the question: "Are you sure you want to sign out?".
    - [x] Subtask: Includes a "Cancel" button.
    - [x] Subtask: Includes a "Sign Out" (or "Confirm") button.
    - [x] Subtask: "Sign Out" button is styled as the primary action.

- [x] **Task: Implement Subscription Modal**
    - [x] Subtask: Activated when "My Subscription" in User Account Menu is clicked.
    - [x] Subtask: Appears as a full-screen modal overlay.
    - [x] Subtask: Displays subscription-related information (Overview, Plans, Billing, FAQ tabs).
    - [x] Subtask: Includes a prominent close icon ('X') fixed in the top-right corner.

## 5. Mobile-Specific Sidebar Behavior

- [x] **Task: Ensure Correct Mobile Header and Sidebar Interaction**
    - [x] Subtask: `MobileHeader` component is displayed only on mobile screens.
    - [x] Subtask: `MobileHeader` contains a `PanelLeft` icon to toggle the mobile sidebar.
    - [x] Subtask: When the mobile sidebar is closed, no other main navigation icons from the sidebar are visible in the `MobileHeader`.
    - [x] Subtask: Opening the mobile sidebar displays it as an overlay, showing full navigation items (icons and text), and the User Account Menu section if triggered.
    - [x] Subtask: Mobile sidebar closes when a navigation item (main nav or User Account Menu nav link) within it is clicked.

## 6. Settings Page (Accessed via User Account Menu)
- [x] **Task: Verify Settings Page Functionality (No direct changes needed for this item in this pass, but linked from User Menu)**
    - [x] Subtask: Accessible via "Settings" in User Account Menu.
    - [x] Subtask: Layout and functionality as previously defined (two-column, tabs, close button).

## 7. General UI/UX Notes
    - [x] Sidebar main navigation items (Home, Create Recipe etc.) are distinct from User Account Menu items (Settings, Subscription etc.). User Account Menu items are only accessible via the avatar trigger.
    - [x] Ensure consistent use of Lucide React Icons.
    - [x] Ensure theme colors (`globals.css`) are applied correctly.
    - [x] Ensure smooth transitions for sidebar expand/collapse and User Account Menu display.
    - [x] Test responsiveness across desktop and mobile breakpoints.
