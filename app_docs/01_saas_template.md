Develop this project using Material UI + Lucide React Icons

# SaaS Dashboard Template

## Overall Layout
The interface primarily utilizes a main content area for user interaction. A collapsible left sidebar for navigation between features and a user account menu is present. Use Material UI + Lucide React Icons for this project.

## Left Sidebar
- Defaults to a collapsed state showing only icons. Collapsed 48px with 1px right border
  - Collapsed 48px with 1px right border.
  - Expanded 287px with 1px right border.
  - Icons size on sidebar 28x28
  - Space for each icon is 32x36 
- Contains a user profile/account trigger element at the bottom and a sidebar icon at the top.
- Uses Lucide React Icons for the sidebar:
  - `panel-left` icon to open the sidebar.
  - `panel-left-close` icon to close the sidebar.
- Clicking on empty areas of the sidebar or the sidebar icon expands the sidebar.
- Hovering over the sidebar slightly darkens it to clearly signal interactivity, but it does not open or closes the sidebar.
- **Pinning Option**: When clicked to open, it will only close once clicked on the "panel-left-close" button. (no extra pin icon necessary)

## User Account Menu
- Accessed when the profile icon (user avatar) at the bottom of the sidebar is clicked (even when sidebar is collapsed.
- Appears as a pop-up menu (fits within the sidebar when opened) providing access to account details, settings, language options, help, and logout.
- If the sidebar is collapsed, clicking the profile icon will expand the sidebar and the menu will appear. If the sidebar is expanded, clicking the profile icon will open the User Account Menu.
- Uses standard UI patterns like checkmarks for selection and arrows for navigation.
- Current selections are bolded.

## Logout Confirmation
- **Activation & Appearance**: When the user clicks the "Sign Out" or "Logout" option in the sidebar, a small, centered modal dialog appears, overlaying the current screen.
- **Content & Actions**: This modal presents a direct question like "Are you sure you want to sign out?". It contains two clearly labeled buttons: "Cancel" (closes the modal and keeps the user logged in) and "Sign Out" or "Confirm" (proceeds with the logout action). The "Sign Out" button is bolded or uses a distinct color to emphasize the primary action.

## Language Selection
- Accessed from the User Account Menu inside the sidebar.
- Opens as a secondary pop-up/fly-out menu.
- Displays a list of languages with the current selection indicated.
- **Visual Cue**: The current language is highlighted, and a flag icon or bolder styling makes the selection pop visually.
- Instant UI text update via i18n library

## Main Content Area (Recipe Generator)
- Features a clean, centered layout focused on a single primary action: generating a recipe.
- A large, prominent heading asks the central question ("Qual receita você quer criar hoje?"), potentially using distinct styling like gradient text.
- A smaller, centered subheading provides context and instruction.
- A rounded rectangular input field is centrally positioned, featuring:
  - A search/magnifying glass icon aligned to the left.
  - Clear placeholder text with examples to guide input.
- A large, visually distinct submit button ("Criar Receita") is placed below the input field, often using a gradient or strong color and an icon (like a paper plane) to signify action.
- Below the submit button, a row of suggestion chips (small, rounded buttons like "Relaxar", "Dormir melhor") offers quick starting points or common category selections.
- An optional informational banner can appear at the bottom, using a distinct background color and icon (like a warning triangle) to convey system status or guidance.

## Settings Page
- Uses a two-column layout within the main content area.
- **Layout**: Employs a tabbed interface with a vertical list of tabs (e.g., "General", "Profile", "Security", "Billing") on the left side.
- The larger right-hand area displays the specific settings and options corresponding to the currently selected tab.
- The active tab is visually highlighted.
- A clear close icon ('X') is present in the top-right corner for easy dismissal and return to the previous area.
- **Left Column**: Vertical tab navigation for settings categories (Profile, Account, etc.).
- **Right Column**: Displays controls for the selected category (input fields, toggles, buttons, etc.).
- Uses clear headings, standard controls like toggle switches, and sections for integrations.
- Includes a save button to prevent data loss and ensure changes are saved.

## Subscription Modal
- **Activation & Appearance**: Clicking the "My Subscription" or similar menu item in the sidebar opens a modal view.
- This modal takes up the full width and height of the browser window or screen, completely covering the underlying application interface, with a light background.
- **Layout & Navigation**: This full-screen view displaysdetailed subscription information, different pricing tiers, plan comparisons, upgrade options, and billing FAQs.
- Includes options to manage payment methods and view history.
- A prominent close icon ('X') is fixed in the top-right corner, allowing the user to easily exit this view and return to the main application interface.